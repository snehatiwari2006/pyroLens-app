"""XGBoost thermal-source classifier with a deterministic rule-based fallback.

Feature order:
    brightness_temp, confidence, distance_to_industry, persistence_count, wind_speed

Classes:
    Industrial Heat, New Source, Likely Fire, Artifact
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from ..config import get_settings
from ..schemas import ThermalEvent

FEATURES = [
    "brightness_temp",
    "confidence",
    "distance_to_industry",
    "persistence_count",
    "wind_speed",
]
CLASSES = ["Industrial Heat", "New Source", "Likely Fire", "Artifact"]
_CLASS_TO_ID = {name: index for index, name in enumerate(CLASSES)}


def _feature_array(features: dict[str, float]):
    import numpy as np

    return np.array([[
        float(features.get("brightness_temp") or 0),
        float(features.get("confidence") or 0),
        float(features.get("distance_to_industry") or 5),
        float(features.get("persistence_count") or 1),
        float(features.get("wind_speed") or 0),
    ]], dtype=float)


def _synthetic_training_set():
    import numpy as np

    rng = np.random.default_rng(26162)
    # Means: brightness, confidence, distance_km, persistence, wind
    groups = [
        ([360, 82, 0.4, 18, 8], [18, 8, 0.25, 6, 4]),   # Industrial Heat
        ([390, 78, 4.5, 2, 12], [22, 10, 1.5, 1.2, 5]),  # New Source
        ([420, 92, 2.8, 6, 22], [25, 6, 1.2, 3, 8]),     # Likely Fire
        ([305, 38, 6.0, 1, 6], [12, 14, 2.0, 0.6, 3]),   # Artifact
    ]
    samples, targets = [], []
    for label, (means, deviations) in enumerate(groups):
        samples.append(rng.normal(means, deviations, size=(200, len(FEATURES))))
        targets.extend([label] * 200)
    x = np.clip(np.vstack(samples), 0, None)
    return x, np.array(targets)


def train_and_persist(path: Path | None = None) -> dict[str, Any]:
    """Fit a compact XGBoost model on synthetic calibration data."""
    import joblib
    from xgboost import XGBClassifier

    x, y = _synthetic_training_set()
    model = XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="multi:softprob",
        num_class=len(CLASSES),
        eval_metric="mlogloss",
        random_state=26162,
    )
    model.fit(x, y)
    artifact = {
        "model": model,
        "features": FEATURES,
        "labels": CLASSES,
        "version": "xgboost-hotspot-v2",
    }
    target = path or Path(get_settings().model_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, target)
    return artifact


def load_artifact() -> dict[str, Any] | None:
    path = Path(get_settings().model_path)
    if not path.is_file():
        # Resolve relative to the backend package when uvicorn cwd differs.
        alt = Path(__file__).resolve().parents[2] / "artifacts" / "fire_classifier.joblib"
        path = alt if alt.is_file() else path
    if not path.is_file():
        return None
    try:
        import joblib

        artifact = joblib.load(path)
        labels = list(artifact.get("labels") or [])
        if labels != CLASSES:
            return None
        return artifact
    except Exception:
        return None


def _rule_based(features: dict[str, float]) -> tuple[str, float, str]:
    brightness = float(features.get("brightness_temp") or 0)
    confidence = float(features.get("confidence") or 0)
    distance = float(features.get("distance_to_industry") if features.get("distance_to_industry") is not None else 5)
    persistence = float(features.get("persistence_count") or 1)
    if brightness < 320 or confidence < 40:
        return "Artifact", max(55.0, 100 - confidence), "rules-fallback"
    if distance <= 1.2 and persistence >= 8:
        return "Industrial Heat", min(96.0, 70 + persistence), "rules-fallback"
    if persistence <= 2 and brightness >= 350 and distance > 1.5:
        return "New Source", min(93.0, 60 + confidence * 0.3), "rules-fallback"
    if brightness >= 380 and confidence >= 70:
        return "Likely Fire", min(97.0, confidence), "rules-fallback"
    if distance <= 1.5:
        return "Industrial Heat", 68.0, "rules-fallback"
    return "New Source", 62.0, "rules-fallback"


def classify_features(features: dict[str, float]) -> dict[str, Any]:
    """Predict a thermal class and class probabilities for a feature vector."""
    artifact = load_artifact()
    if artifact is None:
        try:
            artifact = train_and_persist()
        except Exception:
            label, confidence, version = _rule_based(features)
            probabilities = {name: (confidence / 100 if name == label else 0.0) for name in CLASSES}
            return {
                "label": label,
                "confidence": round(confidence, 1),
                "probabilities": probabilities,
                "features": {key: float(features.get(key) or 0) for key in FEATURES},
                "model_version": version,
                "vector": _safe_vector(features),
                "model": None,
            }

    vector = _feature_array(features)
    model = artifact["model"]
    try:
        import numpy as np

        probabilities = model.predict_proba(vector)[0]
        class_index = int(np.argmax(probabilities))
        label = artifact["labels"][class_index]
        return {
            "label": label,
            "confidence": round(float(probabilities[class_index]) * 100, 1),
            "probabilities": {name: round(float(prob), 4) for name, prob in zip(artifact["labels"], probabilities)},
            "features": {key: float(vector[0][index]) for index, key in enumerate(FEATURES)},
            "model_version": artifact.get("version", "xgboost-hotspot-v2"),
            "vector": vector,
            "model": model,
            "class_index": class_index,
        }
    except Exception:
        label, confidence, version = _rule_based(features)
        return {
            "label": label,
            "confidence": round(confidence, 1),
            "probabilities": {name: (confidence / 100 if name == label else 0.0) for name in CLASSES},
            "features": {key: float(features.get(key) or 0) for key in FEATURES},
            "model_version": version,
            "vector": vector,
            "model": model,
        }


def _safe_vector(features: dict[str, float]):
    try:
        return _feature_array(features)
    except Exception:
        return None


def predict_event(
    event: ThermalEvent,
    distance_to_industry_km: float | None = None,
    wind_speed: float | None = None,
) -> dict[str, Any]:
    persistence_count = max(1, int(round(event.persistence_score / 5)) or event.observations)
    return classify_features({
        "brightness_temp": event.brightness_kelvin,
        "confidence": event.confidence,
        "distance_to_industry": 5.0 if distance_to_industry_km is None else distance_to_industry_km,
        "persistence_count": persistence_count,
        "wind_speed": 0.0 if wind_speed is None else wind_speed,
    })


def predict(event: ThermalEvent) -> tuple[str, float, list[str], str]:
    """Compatibility wrapper used by the existing intelligence pipeline."""
    from .explainability import explain_classification

    result = predict_event(event)
    reasons = explain_classification(result)
    return result["label"], result["confidence"], reasons["summary"], result["model_version"]

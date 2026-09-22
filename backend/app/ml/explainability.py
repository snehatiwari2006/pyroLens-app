"""Human-readable SHAP (or importance) explanations for hotspot classifications."""
from __future__ import annotations

from typing import Any

from .classifier import FEATURES

FEATURE_LABELS = {
    "brightness_temp": "brightness temperature",
    "confidence": "satellite confidence",
    "distance_to_industry": "distance to known industry",
    "persistence_count": "repeat detections (persistence)",
    "wind_speed": "wind speed",
}

CLASS_NARRATIVE = {
    "Industrial Heat": "the hotspot is consistent with a known industrial heat source",
    "New Source": "this looks like a previously unseen thermal source",
    "Likely Fire": "the signature is consistent with an active fire",
    "Artifact": "the detection is likely sensor noise or a low-confidence artifact",
}


def _shap_contributions(model: object, vector: object, class_index: int):
    import numpy as np
    import shap

    values = np.asarray(shap.TreeExplainer(model).shap_values(vector))
    if values.ndim == 3:
        return values[class_index, 0]
    return values[0]


def _importance_contributions(model: object):
    import numpy as np

    importance = getattr(model, "feature_importances_", np.zeros(len(FEATURES)))
    return np.asarray(importance, dtype=float)


def _sentence(feature: str, contribution: float, value: float, label: str) -> str:
    direction = "increased" if contribution >= 0 else "reduced"
    readable = FEATURE_LABELS.get(feature, feature.replace("_", " "))
    return (
        f"{readable.capitalize()} ({value:g}) {direction} the chance of '{label}' "
        f"(SHAP {contribution:+.3f})."
    )


def explain_classification(result: dict[str, Any]) -> dict[str, Any]:
    """Return ranked reasons that a non-specialist can read in an alert modal."""
    label = result.get("label") or "Unknown"
    features = result.get("features") or {}
    model = result.get("model")
    vector = result.get("vector")
    class_index = int(result.get("class_index") or 0)
    method = "rules"

    contributions = None
    if model is not None and vector is not None:
        try:
            contributions = _shap_contributions(model, vector, class_index)
            method = "shap"
        except Exception:
            try:
                contributions = _importance_contributions(model)
                method = "feature_importance"
            except Exception:
                contributions = None

    reasons: list[dict[str, Any]] = []
    if contributions is not None:
        ranked = sorted(
            enumerate(contributions),
            key=lambda item: abs(float(item[1])),
            reverse=True,
        )
        for index, raw in ranked[:5]:
            feature = FEATURES[index]
            value = float(features.get(feature) or 0)
            contribution = float(raw)
            reasons.append({
                "feature": feature,
                "label": FEATURE_LABELS.get(feature, feature),
                "value": value,
                "contribution": round(contribution, 4),
                "text": _sentence(feature, contribution, value, label),
            })

    if not reasons:
        brightness = float(features.get("brightness_temp") or 0)
        distance = float(features.get("distance_to_industry") or 0)
        persistence = float(features.get("persistence_count") or 0)
        confidence = float(features.get("confidence") or 0)
        heuristic = [
            f"Brightness temperature is {brightness:.0f} K.",
            f"Detection confidence is {confidence:.0f}%.",
            f"Nearest mapped industrial site is {distance:.2f} km away." if distance else "Industrial proximity was not confirmed.",
            f"The source has been observed about {persistence:.0f} time(s).",
        ]
        reasons = [{"feature": "heuristic", "label": "rule summary", "value": 0, "contribution": 0, "text": line} for line in heuristic]

    headline = CLASS_NARRATIVE.get(label, f"classified as {label}")
    summary = [item["text"] for item in reasons[:3]]
    return {
        "label": label,
        "headline": f"Model evidence suggests {headline}.",
        "method": method,
        "model_version": result.get("model_version"),
        "confidence": result.get("confidence"),
        "reasons": reasons,
        "summary": summary,
        "probabilities": result.get("probabilities") or {},
    }

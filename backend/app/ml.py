"""Versioned classifier inference and feature-attribution boundary."""
from pathlib import Path

from .config import get_settings
from .schemas import ThermalEvent


def _feature_vector(event: ThermalEvent):
    import numpy as np
    return np.array([[event.frp_mw, event.brightness_kelvin, event.persistence_score, event.confidence, event.observations]], dtype=float)


def load_artifact() -> dict | None:
    """Load the optional trained model without preventing API startup."""
    path = Path(get_settings().model_path)
    if not path.exists():
        return None
    try:
        import joblib
        return joblib.load(path)
    except (ImportError, ModuleNotFoundError):
        return None


def _fallback(event: ThermalEvent) -> tuple[str, float, list[str], str]:
    if event.frp_mw >= 100 and event.persistence_score >= 60:
        label = "Industrial Fire"
    elif event.persistence_score >= 70:
        label = "Persistent Thermal Source"
    elif event.frp_mw < 10:
        label = "Possible False Positive"
    else:
        label = "Potential Fire Event"
    return label, event.confidence, [f"FRP {event.frp_mw:.0f} MW", f"Persistence score {event.persistence_score:.0f}/100", f"Satellite confidence {event.confidence:.0f}%"], "rules-fallback"


def predict(event: ThermalEvent) -> tuple[str, float, list[str], str]:
    artifact = load_artifact()
    if not artifact:
        return _fallback(event)
    vector = _feature_vector(event)
    model = artifact["model"]
    probabilities = model.predict_proba(vector)[0]
    class_index = int(np.argmax(probabilities))
    label = artifact["labels"][class_index]
    indicators = explain(model, artifact["features"], vector, class_index)
    return label, round(float(probabilities[class_index]) * 100, 1), indicators, artifact["version"]


def explain(model: object, features: list[str], vector: object, class_index: int) -> list[str]:
    """Use SHAP when available; model importances are a transparent fallback."""
    try:
        import numpy as np
        import shap
        values = np.asarray(shap.TreeExplainer(model).shap_values(vector))
        contributions = values[class_index, 0] if values.ndim == 3 else values[0]
        ranked = np.argsort(np.abs(contributions))[::-1][:3]
        return [f"SHAP: {features[index]} contributed {contributions[index]:+.3f}" for index in ranked]
    except Exception:
        import numpy as np
        importance = getattr(model, "feature_importances_", np.zeros(len(features)))
        ranked = np.argsort(importance)[::-1][:3]
        return [f"Model importance: {features[index]} ({importance[index]:.2f})" for index in ranked]

"""Machine-learning package: classification, SHAP reasons, and spread geometry."""

from .classifier import CLASSES, FEATURES, classify_features, predict, predict_event
from .explainability import explain_classification
from .spread_predictor import predict_spread_geojson

__all__ = [
    "CLASSES",
    "FEATURES",
    "classify_features",
    "predict",
    "predict_event",
    "explain_classification",
    "predict_spread_geojson",
]

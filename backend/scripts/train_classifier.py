"""Create the versioned baseline XGBoost classifier artifact used by the API.

The training set is deterministic synthetic calibration data. Replace it with
reviewed labelled FIRMS/field-observation data before operational deployment.
"""
from pathlib import Path

from app.ml.classifier import FEATURES, CLASSES, train_and_persist


if __name__ == "__main__":
    artifact = Path(__file__).resolve().parents[1] / "artifacts" / "fire_classifier.joblib"
    train_and_persist(artifact)
    print(f"Created {artifact} with features {FEATURES} and classes {CLASSES}")

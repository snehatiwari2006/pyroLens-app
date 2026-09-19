"""Create the versioned baseline XGBoost classifier artifact used by the API.

The training set is deterministic synthetic calibration data. Replace it with
reviewed labelled FIRMS/field-observation data before operational deployment.
"""
from pathlib import Path

import joblib
import numpy as np
from xgboost import XGBClassifier

FEATURES = ["frp_mw", "brightness_kelvin", "persistence_score", "confidence", "observations"]
LABELS = ["Agricultural Burning", "Industrial Fire", "Persistent Thermal Source", "Possible False Positive"]


def make_training_data() -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(26162)
    groups = [
        ([18, 328, 30, 76, 5], [12, 12, 18, 12, 4]),
        ([170, 410, 82, 90, 14], [55, 30, 13, 8, 7]),
        ([70, 365, 88, 82, 35], [22, 16, 9, 9, 15]),
        ([5, 302, 10, 48, 1], [4, 5, 7, 18, 2]),
    ]
    samples, targets = [], []
    for label, (means, deviations) in enumerate(groups):
        samples.append(rng.normal(means, deviations, size=(180, len(FEATURES))))
        targets.extend([label] * 180)
    return np.clip(np.vstack(samples), 0, None), np.array(targets)


if __name__ == "__main__":
    x, y = make_training_data()
    model = XGBClassifier(
        n_estimators=120, max_depth=4, learning_rate=0.08, subsample=0.9,
        colsample_bytree=0.9, objective="multi:softprob", num_class=len(LABELS),
        eval_metric="mlogloss", random_state=26162,
    )
    model.fit(x, y)
    artifact = Path(__file__).resolve().parents[1] / "artifacts" / "fire_classifier.joblib"
    artifact.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "features": FEATURES, "labels": LABELS, "version": "xgboost-synthetic-v1"}, artifact)
    print(f"Created {artifact}")

# Model artifacts

`scripts/train_classifier.py` creates `fire_classifier.joblib`, a versioned
XGBoost baseline included during the Docker build. It uses deterministic
synthetic calibration data only, so it is appropriate for demonstrations and
integration testing—not operational fire classification. Replace the training
source with governed, labelled observations and document validation metrics
before deployment.

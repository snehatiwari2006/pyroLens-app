from app.validation import validate_events


def test_validation_accepts_valid_coordinates_and_rejects_invalid_coordinates():
    accepted, rejected = validate_events([
        {"id": "valid", "name": "Valid", "lat": 19.1, "lng": 72.9, "confidence": 80, "frp_mw": 20, "brightness_kelvin": 330},
        {"id": "invalid", "name": "Invalid", "lat": 91, "lng": 72.9, "confidence": 80, "frp_mw": 20, "brightness_kelvin": 330},
    ])
    assert len(accepted) == 1
    assert rejected == 1

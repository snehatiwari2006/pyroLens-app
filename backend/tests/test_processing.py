import asyncio

from app.processing import assess_impact, classify
from app.schemas import ThermalEvent


def test_processing_returns_a_classification_and_spatial_impact_contract():
    event = ThermalEvent(id="test", name="Test", lat=19.076, lng=72.877, confidence=90, frp_mw=170, brightness_kelvin=410, persistence_score=82, observations=12)
    classification = asyncio.run(classify(event))
    impact = asyncio.run(assess_impact(event))
    assert classification.classification
    assert classification.indicators
    assert impact.impact_zone_km2 > 0
    assert impact.model

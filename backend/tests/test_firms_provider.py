from app.providers import FirmsProvider


def test_firms_csv_normalization_uses_nasa_fields():
    payload = """latitude,longitude,bright_ti4,acq_date,acq_time,satellite,confidence,frp
19.076,72.877,412,2026-09-17,0912,N21,h,186
"""
    events = FirmsProvider._parse_csv(payload, source="VIIRS")
    assert len(events) == 1
    event = events[0]
    assert event.source == "N21"
    assert event.event_type == "Industrial Fire"
    assert event.confidence == 90
    assert event.observed_at.year == 2026

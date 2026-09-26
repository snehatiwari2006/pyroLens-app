import asyncio
from datetime import datetime, timezone
from app.repository import repository
from app.schemas import ThermalEvent
from datetime import datetime, timezone

events_data = [
    {
        'id': 'INSP-001',
        'name': 'Coastal Spain',
        'lat': 44.85,
        'lng': -1.05,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Coastal Spain ~44.85°N, 1.05°W',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-002',
        'name': 'Ávila–Madrid–Toledo',
        'lat': 40.6,
        'lng': -4.7,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Ávila–Madrid–Toledo, Spain',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-003',
        'name': 'La Mierla',
        'lat': 40.5,
        'lng': -3.5,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'La Mierla, Spain',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-004',
        'name': "Vall d'Uixó",
        'lat': 39.9,
        'lng': 0.0,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': "Vall d'Uixó, Spain",
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-005',
        'name': 'Porto Germeno',
        'lat': 38.0,
        'lng': 23.5,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Porto Germeno, Greece',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-006',
        'name': 'Poggiorsini',
        'lat': 41.0,
        'lng': 16.5,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Poggiorsini, Italy',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-007',
        'name': 'Peñas de Riglos',
        'lat': 41.4,
        'lng': 0.2,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Peñas de Riglos, Spain',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-008',
        'name': 'Aude / Carcassonne',
        'lat': 43.2,
        'lng': 2.3,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Aude / Carcassonne, France',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-009',
        'name': 'Hürtgenwald',
        'lat': 50.5,
        'lng': 6.0,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Hürtgenwald, Germany',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
    {
        'id': 'INSP-010',
        'name': 'Baelen (Hautes Fagnes)',
        'lat': 50.3,
        'lng': 5.7,
        'event_type': 'Inspection',
        'confidence': 100.0,
        'frp_mw': 0.0,
        'brightness_kelvin': 300.0,
        'observations': 1,
        'persistence_score': 0.0,
        'risk_score': 10.0,
        'risk_level': 'LOW',
        'status': 'Active',
        'location': 'Baelen (Hautes Fagnes), Belgium',
        'source': 'INSPECTION',
        'observed_at': datetime.now(timezone.utc).isoformat()
    },
]

async def main():
    from app.repository import repository
    from app.schemas import ThermalEvent
    from datetime import datetime, timezone
    
    events = []
    for e in events_data:
        e = e.copy()
        e['observed_at'] = datetime.fromisoformat(e['observed_at'].replace('Z', '+00:00'))
        events.append(ThermalEvent(**e))
    
    written = repository.save_many(events)
    print(f'Saved {len(events)} inspection events')

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
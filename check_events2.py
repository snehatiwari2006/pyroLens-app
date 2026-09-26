import requests

r = requests.get('http://localhost:8000/api/v1/events?limit=20', headers={'Origin': 'http://localhost:8080'})
data = r.json()
print(f"Total events: {len(data)}")
for e in data:
    if e['id'].startswith('INSP'):
        print(f"{e['id']}: {e['name']} - {e['location']} ({e['latitude']}, {e['longitude']})")
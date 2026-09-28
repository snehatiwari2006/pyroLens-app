import httpx
import json

# First get a token
url = 'http://localhost:8000/api/v1/auth/token'
try:
    response = httpx.post(url, json={'username': 'test', 'role': 'analyst'}, timeout=10)
    token_data = response.json()
    token = token_data['access_token']
    
    # Call events with token
    headers = {'Authorization': f'Bearer {token}'}
    events_url = 'http://localhost:8000/api/v1/events?limit=10'
    response = httpx.get(events_url, headers=headers, timeout=10)
    print(f'Events Status: {response.status_code}')
    data = response.json()
    print(f'Total events: {len(data)}')
    for e in data[:3]:
        print(f'  {e["id"]}: {e["name"]} at {e["latitude"]},{e["longitude"]}')
except Exception as e:
    print(f'Error: {e}')
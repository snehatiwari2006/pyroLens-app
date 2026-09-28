import httpx
import json

# First get a token
url = 'http://localhost:8000/api/v1/auth/token'
try:
    response = httpx.post(url, json={'username': 'test', 'role': 'analyst'}, timeout=10)
    token_data = response.json()
    token = token_data['access_token']
    
    # Call events with token - check response text and headers
    headers = {'Authorization': f'Bearer {token}'}
    events_url = 'http://localhost:8000/api/v1/events?limit=10'
    response = httpx.get(events_url, headers=headers, timeout=10)
    print(f'Events Status: {response.status_code}')
    print(f'Content-Type: {response.headers.get("content-type")}')
    print(f'Content-Length: {response.headers.get("content-length")}')
    print(f'Response text: {response.text}')
    print(f'Response text repr: {repr(response.text)}')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
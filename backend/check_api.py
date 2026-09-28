import httpx

# Call the events endpoint
url = 'http://localhost:8000/api/v1/events?limit=10'
try:
    response = httpx.get(url, timeout=10)
    print(f'Status: {response.status_code}')
    import json
    data = response.json()
    print(f'Total events: {len(data)}')
    for e in data[:3]:
        print(f'  {e["id"]}: {e["name"]} at {e["latitude"]},{e["longitude"]}')
except Exception as e:
    print(f'Error: {e}')
import httpx

# Check the OpenAPI spec
url = 'http://localhost:8000/openapi.json'
response = httpx.get(url, timeout=10)
import json
data = response.json()
paths = data.get('paths', {})
for path in sorted(paths.keys()):
    if 'event' in path.lower():
        print(path)
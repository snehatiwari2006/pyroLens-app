import httpx
from datetime import datetime, timedelta, timezone

api_key = '9313b789d191f68e0db528987356a403'
source = 'VIIRS_NOAA21_NRT'
area = '22.0,-15.0,32.0,-8.0'

for day in range(14):
    date_obj = datetime.now(timezone.utc) - timedelta(days=day)
    date_str = date_obj.strftime('%Y-%m-%d')
    url = f'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{api_key}/{source}/{area}/1/{date_str}'
    response = httpx.get(url, timeout=30)
    lines = response.text.strip().split('\n')
    if len(lines) > 1:
        print(f'{date_str}: {len(lines) - 1} records')
    else:
        print(f'{date_str}: 0 records')
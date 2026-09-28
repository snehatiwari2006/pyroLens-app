from app.repository import repository
latest = repository.latest_ingestion('firms')
print(f'Latest ingestion: {latest}')
print(f'records_seen: {latest["records_seen"]}')
print(f'status: {latest["status"]}')
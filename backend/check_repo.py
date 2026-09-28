from app.repository import repository
events = repository.list()
print(f'Total events from repository: {len(events)}')
for e in events[:5]:
    print(f'  {e.id}: risk_score={e.risk_score}, starts with FE-: {e.id.startswith("FE-")}')
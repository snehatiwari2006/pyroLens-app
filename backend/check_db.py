import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM ingestion_runs ORDER BY finished_at DESC')
for row in cursor.fetchall():
    print(row)
    
print()
cursor.execute("SELECT id, name, lat, lng, frp, confidence, satellite FROM incidents WHERE id LIKE 'FIRMS-%' ORDER BY created_at DESC")
for row in cursor.fetchall():
    print(row)
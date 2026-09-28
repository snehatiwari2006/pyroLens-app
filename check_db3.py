import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT count(*) FROM incidents')
count = cursor.fetchone()[0]
print(f'incidents count: {count}')

cursor.execute("SELECT id, name, lat, lng, frp, confidence, satellite FROM incidents WHERE id LIKE 'FIRMS-%' ORDER BY created_at DESC")
for row in cursor.fetchall():
    print(row)
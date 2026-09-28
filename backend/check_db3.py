import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT count(*) FROM incidents')
count = cursor.fetchone()[0]
print(f'incidents count: {count}')
cursor.execute("SELECT id FROM incidents WHERE id LIKE 'FIRMS-%'")
firms = cursor.fetchall()
print(f'FIRMS incidents: {len(firms)}')
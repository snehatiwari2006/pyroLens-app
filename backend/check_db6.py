import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT count(*) FROM incidents')
count = cursor.fetchone()[0]
print(f'incidents count: {count}')
cursor.execute("SELECT id FROM incidents WHERE id LIKE 'FIRMS-%' LIMIT 5")
for row in cursor.fetchall():
    print(row)
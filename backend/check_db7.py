import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT count(*) FROM incidents WHERE id LIKE "FIRMS-%"')
count = cursor.fetchone()[0]
print(f'FIRMS incidents in pyrolens.db: {count}')
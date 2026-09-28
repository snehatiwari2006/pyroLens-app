import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT id, name, risk_score FROM incidents WHERE id LIKE "FIRMS-%" LIMIT 10')
for row in cursor.fetchall():
    print(row)
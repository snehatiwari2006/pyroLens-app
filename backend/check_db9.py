import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT id, name, risk_score, created_at FROM incidents WHERE id LIKE "FIRMS-%" ORDER BY created_at DESC LIMIT 10')
for row in cursor.fetchall():
    print(row)
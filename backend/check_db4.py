import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute("SELECT id, name, lat, lng, frp, confidence FROM incidents WHERE id LIKE 'FIRMS-%' LIMIT 5")
for row in cursor.fetchall():
    print(row)
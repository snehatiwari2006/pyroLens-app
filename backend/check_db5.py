import sqlite3
conn = sqlite3.connect('pyrolens.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM ingestion_runs WHERE source = "firms" ORDER BY finished_at DESC LIMIT 1')
row = cursor.fetchone()
print(row)
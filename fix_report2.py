with open('E:/pyrolens/pyrolens-app/src/pages/ReportBuilder.jsx', 'r') as f:
    content = f.read()

# Fix the duplicate </Card>ard>
content = content.replace('</Card>ard>', '</Card>')

# Fix the middle dots (U+00B7) - replace with simple dot
content = content.replace('\xc2\xb7', '·')

with open('E:/pyrolens/pyrolens-app/src/pages/ReportBuilder.jsx', 'w') as f:
    f.write(content)

print('Fixed!')
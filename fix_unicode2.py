with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'rb') as f:
    content = f.read()

# Replace common Unicode characters
# Ellipsis: E2 80 A6 -> ...
content = content.replace(b'\xe2\x80\xa6', b'...')
# Em dash: E2 80 94 -> --
content = content.replace(b'\xe2\x80\x94', b'--')
# Middle dot: C2 B7 -> .
content = content.replace(b'\xc2\xb7', b'.')

with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'wb') as f:
    f.write(content)

print('Fixed!')
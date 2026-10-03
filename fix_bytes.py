with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'rb') as f:
    content = f.read()

# Replace the UTF-8 sequences for checkmark (E2 9C 93) and cross (E2 9C 97)
# Checkmark: E2 9C 93
# Cross: E2 9C 97
content = content.replace(b'\xe2\x9c\x93', b'Yes')
content = content.replace(b'\xe2\x9c\x97', b'No')

with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'wb') as f:
    f.write(content)

print('Fixed!')
with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'r') as f:
    content = f.read()

# Replace checkmark characters
content = content.replace('"✓"', '"Yes"')
content = content.replace('"✗"', '"No"')

with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'w') as f:
    f.write(content)

print('Fixed!')
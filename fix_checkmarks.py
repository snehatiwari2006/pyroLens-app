with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'r') as f:
    content = f.read()

old = '''                        <td className="py-2 text-center">{viewer ? "✓" : "✗"}</td>
                        <td className="py-2 text-center">{analyst ? "✓" : "✗"}</td>
                        <td className="py-2 text-center">{admin ? "✓" : "✗"}</td>'''

new = '''                        <td className="py-2 text-center">{viewer ? "Yes" : "No"}</td>
                        <td className="py-2 text-center">{analyst ? "Yes" : "No"}</td>
                        <td className="py-2 text-center">{admin ? "Yes" : "No"}</td>'''

if old in content:
    content = content.replace(old, new)
    with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'w') as f:
        f.write(content)
    print('Fixed!')
else:
    print('Not found')
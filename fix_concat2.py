with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'r') as f:
    content = f.read()

# Fix 1: Tab Navigation className
old1 = '''            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all " +
              (activeTab === tab.id
                ? "bg-orange-50 text-orange-700 border border-orange/30"
                : "text-slate-500 hover:text-ink hover:bg-slate-50")'''

new1 = '''            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-orange-50 text-orange-700 border border-orange/30"
                : "text-slate-500 hover:text-ink hover:bg-slate-50"
            }`}'''

# Fix 2: Permissions tab role badge
old2 = '''                  <div className="p-2 rounded-lg " + role.bg + ">" + <Shield className="w-5 h-5 " + role.color + " /> + "</div>'''

new2 = '''                  <div className={"p-2 rounded-lg " + role.bg}><Shield className={"w-5 h-5 " + role.color} /></div>'''

# Fix 3: Card border in permissions tab
old3 = '''                <div
                  key={role.id}
                  className="p-4 rounded-xl border-2 transition-all " + (user?.role === role.id ? "border-orange-300 bg-orange-50" : "border-line bg-white/50")
                >'''

new3 = '''                <div
                  key={role.id}
                  className={`p-4 rounded-xl border-2 transition-all ${user?.role === role.id ? "border-orange-300 bg-orange-50" : "border-line bg-white/50"}`}
                >'''

fixed = False
if old1 in content:
    content = content.replace(old1, new1)
    fixed = True
if old2 in content:
    content = content.replace(old2, new2)
    fixed = True
if old3 in content:
    content = content.replace(old3, new3)
    fixed = True

if fixed:
    with open('E:/pyrolens/pyrolens-app/src/pages/UserDashboard.jsx', 'w') as f:
        f.write(content)
    print('Fixed all string concatenation issues!')
else:
    print('No patterns found to fix')
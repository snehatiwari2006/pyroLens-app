import React, { useState, useEffect, useContext } from "react";
import { apiFetch } from "../services/api.js";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { User, Key, Shield, LogOut, Edit, Save, X, Eye, EyeOff, Copy, Check, AlertTriangle, Bell, Smartphone, Mail, Settings, History, Download } from "lucide-react";

const ROLES = [
  { id: "viewer", label: "Viewer", desc: "Read-only access to dashboards and reports", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "analyst", label: "Analyst", desc: "Full read access + ingestion + alerts", color: "text-orange-600", bg: "bg-orange-50" },
  { id: "admin", label: "Admin", desc: "Full access + user management + config", color: "text-critical", bg: "bg-criticalBg" },
];

export default function UserDashboard() {
  const { incidents } = useApp();
  const [user, setUser] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    dashboard: true,
    criticalOnly: false,
  });
  const [showKey, setShowKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
    loadApiKeys();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiFetch("/auth/profile");
      if (profile) {
        setUser(profile);
        return;
      }
    } catch {}
    const stored = localStorage.getItem("pyrolens_user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      const defaultUser = {
        id: "demo-analyst",
        username: "demo-analyst",
        email: "analyst@pyrolens.demo",
        role: "analyst",
        createdAt: "2026-01-15T10:30:00Z",
        lastLogin: new Date().toISOString(),
      };
      setUser(defaultUser);
      localStorage.setItem("pyrolens_user", JSON.stringify(defaultUser));
    }
  };

  const loadApiKeys = async () => {
    try {
      const keys = await apiFetch("/auth/api-keys");
      if (keys) {
        setApiKeys(keys);
        return;
      }
    } catch {}
    const stored = localStorage.getItem("pyrolens_api_keys");
    if (stored) setApiKeys(JSON.parse(stored));
    else setApiKeys([]);
  };

  const saveApiKeys = (keys) => {
    setApiKeys(keys);
    localStorage.setItem("pyrolens_api_keys", JSON.stringify(keys));
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim() || creatingKey) return;
    setCreatingKey(true);
    try {
      const response = await apiFetch("/auth/api-keys", {
        method: "POST",
        body: JSON.stringify({ name: newKeyName }),
      });
      if (response) {
        setApiKeys([response, ...apiKeys]);
      }
    } catch {
      const newKey = {
        id: "key_" + Date.now(),
        name: newKeyName,
        key: "pl_" + Math.random().toString(36).substr(2, 32),
        createdAt: new Date().toISOString(),
        lastUsed: null,
      };
      saveApiKeys([newKey, ...apiKeys]);
    }
    setShowCreateKey(false);
    setNewKeyName("");
  };

  const handleRevokeKey = async (keyId) => {
    try {
      await apiFetch("/auth/api-keys/" + keyId, { method: "DELETE" });
    } catch {}
    saveApiKeys(apiKeys.filter(k => k.id !== keyId));
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateProfile = async (field, value) => {
    const updated = { ...user, [field]: value };
    setUser(updated);
    localStorage.setItem("pyrolens_user", JSON.stringify(updated));
    try {
      await apiFetch("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });
    } catch {}
  };

  const updateNotifications = (field, value) => {
    const updated = { ...notifications, [field]: value };
    setNotifications(updated);
    localStorage.setItem("pyrolens_notifications", JSON.stringify(updated));
  };

  const exportUserData = () => {
    const data = {
      profile: user,
      apiKeys: apiKeys.map(k => ({ ...k, key: "***REDACTED***" })),
      notifications,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pyrolens-user-data-" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const roleInfo = ROLES.find(r => r.id === user?.role) || ROLES[1];

  const roleBadgeClass = roleInfo.bg + " " + roleInfo.color;

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : "--";

  const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : "--";

  const roleBadgeClassName = "px-3 py-1 rounded-full text-xs font-bold " + roleBadgeClass;

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Account Center"
        title="User Dashboard"
        desc="Manage your profile, API keys, notification preferences, and access permissions."
      />

      {/* Profile Header */}
      <Card accent="blue">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-critical flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-xl text-ink">{user?.username || "Loading..."}</h3>
                <span className={roleBadgeClassName}>{roleInfo.label}</span>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Member since {formatDate(user?.createdAt)}
                {user?.lastLogin && " | Last login " + formatDateTime(user.lastLogin)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-xs flex items-center gap-2" onClick={exportUserData}>
              <Download size={14} />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-line/50 pb-1">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "keys", label: "API Keys", icon: Key },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "permissions", label: "Permissions", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-orange-50 text-orange-700 border border-orange/30"
                : "text-slate-500 hover:text-ink hover:bg-slate-50"
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Profile Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Username</label>
                <input
                  type="text"
                  value={user?.username}
                  onChange={(e) => updateProfile("username", e.target.value)}
                  className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Role</label>
                <select
                  value={user?.role}
                  onChange={(e) => updateProfile("role", e.target.value)}
                  className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15"
                >
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Status</label>
                <div className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-line/60">
              <h4 className="font-bold text-sm text-ink mb-3">Danger Zone</h4>
              <p className="text-xs text-slate-500 mb-3">These actions are irreversible.</p>
              <div className="flex gap-3">
                <button className="btn-secondary text-xs flex items-center gap-2 py-2 px-4 border-critical/30 text-critical hover:bg-criticalBg">
                  <AlertTriangle size={14} />
                  <span>Delete Account</span>
                </button>
                <button className="btn-secondary text-xs flex items-center gap-2 py-2 px-4" onClick={() => localStorage.clear()}>
                  <LogOut size={14} />
                  <span>Sign Out Everywhere</span>
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* API Keys Tab */}
        {activeTab === "keys" && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-ink">API Keys</h3>
                <button
                  onClick={() => setShowCreateKey(true)}
                  className="btn-primary text-xs flex items-center gap-2 py-2 px-3"
                >
                  <Key size={14} />
                  <span>Create New Key</span>
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-line rounded-xl">
                  <Key className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No API keys created yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create a key to access PyroLens APIs programmatically</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="p-4 rounded-xl border border-line bg-white/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm text-ink">{key.name}</p>
                          <p className="text-xs text-slate-500 font-mono">
                            Created {new Date(key.createdAt).toLocaleString()}
                            {key.lastUsed && " | Last used " + new Date(key.lastUsed).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowKey(showKey === key.key ? null : key.key)}
                          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                        >
                          {showKey === key.key ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{showKey === key.key ? "Hide" : "Show"}</span>
                        </button>
                        <button
                          onClick={() => handleCopyKey(key.key)}
                          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                        >
                          {copiedKey === key.key ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedKey === key.key ? "Copied!" : "Copy"}</span>
                        </button>
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 border-critical/30 text-critical hover:bg-criticalBg"
                        >
                          <X size={14} />
                          <span>Revoke</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Key Modal */}
              {showCreateKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
                  <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl animate-slideUp">
                    <h3 className="font-bold text-lg text-ink mb-4">Create New API Key</h3>
                    <form onSubmit={handleCreateKey} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Key Name</label>
                        <input
                          type="text"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g., Production Dashboard, Mobile App"
                          className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15"
                        />
                        <p className="text-xs text-slate-500 mt-1">Give your key a descriptive name for easy identification</p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowCreateKey(false)} className="btn-secondary flex-1 py-2.5 text-xs font-bold">Cancel</button>
                        <button type="submit" disabled={creatingKey || !newKeyName.trim()} className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                          {creatingKey ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Key size={14} />
                              <span>Create Key</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card>
            <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Notification Preferences</h3>
            <p className="text-xs text-slate-500 mb-6">Configure how you receive alerts for thermal events</p>

            <div className="space-y-4">
              {[
                { id: "criticalOnly", label: "Critical Only", desc: "Only notify for CRITICAL risk events", icon: AlertTriangle },
                { id: "dashboard", label: "Dashboard Alerts", desc: "In-app notifications for all events", icon: Bell },
                { id: "email", label: "Email Alerts", desc: "Email notifications for configured events", icon: Mail },
                { id: "sms", label: "SMS Alerts", desc: "Text message alerts for urgent events", icon: Smartphone },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-4 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <pref.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-ink">{pref.label}</p>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[pref.id]}
                      onChange={(e) => updateNotifications(pref.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <Card>
            <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Access Permissions</h3>
            <p className="text-xs text-slate-500 mb-6">Your current role determines what actions you can perform</p>

            <div className="space-y-3">
              {ROLES.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border-2 transition-all ${user?.role === role.id ? "border-orange-300 bg-orange-50" : "border-line bg-white/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={"p-2 rounded-lg " + role.bg}><Shield className={"w-5 h-5 " + role.color} /></div>
                      <div>
                        <p className="font-bold text-sm text-ink">{role.label}</p>
                        <p className="text-xs text-slate-500">{role.desc}</p>
                      </div>
                    </div>
                    {user?.role === role.id ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Current Role</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-100">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-line/60">
              <h4 className="font-bold text-sm text-ink mb-3">Permission Matrix</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-line/60">
                      <th className="pb-2 font-medium">Action</th>
                      <th className="pb-2 font-medium text-center">Viewer</th>
                      <th className="pb-2 font-medium text-center">Analyst</th>
                      <th className="pb-2 font-medium text-center">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/50">
                    {[
                      ["View Dashboard", true, true, true],
                      ["View Events", true, true, true],
                      ["View Impact Analysis", true, true, true],
                      ["View Decision Support", true, true, true],
                      ["Trigger Ingestion", false, true, true],
                      ["Issue Alerts", false, true, true],
                      ["Manage Users", false, false, true],
                      ["Manage API Keys (self)", true, true, true],
                      ["Manage API Keys (all)", false, false, true],
                      ["Configure System", false, false, true],
                      ["View Audit Logs", false, false, true],
                    ].map(([action, viewer, analyst, admin]) => (
                      <tr key={action} className="hover:bg-slate-50/50">
                        <td className="py-2 text-slate-600">{action}</td>
                        <td className="py-2 text-center">{viewer ? "Yes" : "No"}</td>
                        <td className="py-2 text-center">{analyst ? "Yes" : "No"}</td>
                        <td className="py-2 text-center">{admin ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
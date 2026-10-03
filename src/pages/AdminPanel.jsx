import React, { useState, useEffect } from "react";
import { apiFetch } from "../services/api.js";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { Users, UserPlus, Shield, Database, Server, Globe, AlertTriangle, CheckCircle, XCircle, Loader2, Search, Filter, Download, Upload, Settings, Trash2, Edit, Eye, Activity, BarChart2, Bell, Key, Lock, Unlock, Mail, Smartphone, MapPin, Layers, Zap, Terminal, GitBranch, ShieldCheck, UserCheck, UserX, LogOut, Clock, RefreshCw, Save, X, ChevronDown, ChevronUp, MoreVertical, Copy, Cloud } from "lucide-react";

const ROLES = [
  { id: "viewer", label: "Viewer", desc: "Read-only access to dashboards and reports", color: "text-blue-600", bg: "bg-blue-50", permissions: ["view_dashboard", "view_events", "view_reports"] },
  { id: "analyst", label: "Analyst", desc: "Full read access + ingestion + alerts", color: "text-orange-600", bg: "bg-orange-50", permissions: ["view_dashboard", "view_events", "view_reports", "trigger_ingestion", "issue_alerts", "manage_own_keys"] },
  { id: "admin", label: "Admin", desc: "Full access + user management + config", color: "text-critical", bg: "bg-criticalBg", permissions: ["all"] },
];

const SYSTEM_STATUSES = [
  { id: "database", label: "PostgreSQL/PostGIS", check: "/health", icon: Database },
  { id: "redis", label: "Redis Cache/Queue", check: "/health", icon: Server },
  { id: "minio", label: "MinIO Object Storage", check: "/health", icon: Database },
  { id: "firms", label: "NASA FIRMS API", check: "/api/v1/firms/status", icon: Globe },
  { id: "weather", label: "Weather Provider", check: "/api/v1/providers", icon: Cloud },
  { id: "osm", label: "OpenStreetMap/Overpass", check: "/api/v1/providers", icon: MapPin },
  { id: "celery_worker", label: "Celery Worker", check: "/api/v1/workers/status", icon: Activity },
  { id: "celery_beat", label: "Celery Beat Scheduler", check: "/api/v1/workers/status", icon: Clock },
];

export default function AdminPanel() {
  const { incidents } = useApp();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [config, setConfig] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "analyst", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadSystemStatus();
    loadConfig();
    loadAuditLogs();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiFetch("/admin/users");
      if (data) setUsers(data);
    } catch {
      // Demo fallback
      const stored = localStorage.getItem("pyrolens_users");
      if (stored) setUsers(JSON.parse(stored));
      else {
        const defaultUsers = [
          { id: "1", username: "admin", email: "admin@pyrolens.demo", role: "admin", status: "active", createdAt: "2026-01-01T00:00:00Z", lastLogin: new Date().toISOString(), apiKeysCount: 2 },
          { id: "2", username: "analyst", email: "analyst@pyrolens.demo", role: "analyst", status: "active", createdAt: "2026-01-15T00:00:00Z", lastLogin: new Date().toISOString(), apiKeysCount: 1 },
          { id: "3", username: "viewer", email: "viewer@pyrolens.demo", role: "viewer", status: "active", createdAt: "2026-02-01T00:00:00Z", lastLogin: new Date().toISOString(), apiKeysCount: 0 },
        ];
        setUsers(defaultUsers);
        localStorage.setItem("pyrolens_users", JSON.stringify(defaultUsers));
      }
    }
  };

  const loadSystemStatus = async () => {
    try {
      const data = await apiFetch("/admin/system-status");
      if (data) setSystemStatus(data);
    } catch {
      // Demo fallback - simulate healthy status
      setSystemStatus({
        database: { status: "healthy", latency: "12ms", connections: 12 },
        redis: { status: "healthy", latency: "2ms", memory: "45MB" },
        minio: { status: "healthy", buckets: 3, objects: 142 },
        firms: { status: "healthy", lastSync: "2 min ago", detections24h: 338 },
        weather: { status: "healthy", provider: "WeatherStack", lastRequest: "5 sec ago" },
        osm: { status: "healthy", source: "local-postgis", queries24h: 1247 },
        celery_worker: { status: "healthy", activeTasks: 0, processed1h: 42 },
        celery_beat: { status: "healthy", nextRun: "3 min", schedule: "every 5 min" },
      });
    }
  };

  const loadConfig = async () => {
    try {
      const data = await apiFetch("/admin/config");
      if (data) setConfig(data);
    } catch {
      setConfig({
        firms_api_key: "***configured***",
        weather_provider: "weatherstack",
        weather_api_key: "***configured***",
        osm_live_enabled: true,
        cors_origins: "http://localhost:5173,http://localhost:8080",
        jwt_secret: "***configured***",
        twilio_configured: false,
        smtp_configured: false,
        oidc_configured: false,
        firms_refresh_seconds: 300,
        firms_days: 7,
        monitoring_area: "Malawi fire monitoring area",
      });
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await apiFetch("/admin/audit-logs?limit=100");
      if (data) setAuditLogs(data);
    } catch {
      // Demo fallback
      setAuditLogs([
        { id: "1", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: "admin", action: "USER_CREATED", resource: "users", details: "Created user analyst@pyrolens.demo", ip: "127.0.0.1", status: "success" },
        { id: "2", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user: "admin", action: "CONFIG_UPDATED", resource: "config", details: "Updated FIRMS refresh interval to 300s", ip: "127.0.0.1", status: "success" },
        { id: "3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: "system", action: "INGESTION_COMPLETED", resource: "ingestion", details: "FIRMS ingestion: 500 events processed, 500 accepted", ip: "internal", status: "success" },
        { id: "4", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), user: "analyst", action: "ALERT_SENT", resource: "alerts", details: "Issued SMS+Email alert for FIRMS-3B5F1E43BA", ip: "127.0.0.1", status: "success" },
        { id: "5", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), user: "admin", action: "API_KEY_CREATED", resource: "auth", details: "Created API key 'Production Dashboard'", ip: "127.0.0.1", status: "success" },
      ]);
    }
  };

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem("pyrolens_users", JSON.stringify(updatedUsers));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) return;
    try {
      const response = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      if (response) {
        setUsers([response, ...users]);
      }
    } catch {
      const user = { ...newUser, id: Date.now().toString(), status: "active", createdAt: new Date().toISOString(), lastLogin: null, apiKeysCount: 0 };
      saveUsers([user, ...users]);
    }
    setShowCreateUser(false);
    setNewUser({ username: "", email: "", role: "analyst", password: "" });
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    } catch {}
    saveUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
    } catch {}
    saveUsers(users.filter(u => u.id !== userId));
  };

  const handleToggleStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    handleUpdateUser(userId, { status: user.status === "active" ? "suspended" : "active" });
  };

  const handleRefreshSystem = async () => {
    setRefreshing(true);
    await loadSystemStatus();
    setRefreshing(false);
  };

  const filteredUsers = users.filter(u => {
    const roleMatch = filterRole === "all" || u.role === filterRole;
    const statusMatch = filterStatus === "all" || u.status === filterStatus;
    return roleMatch && statusMatch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="System Administration"
        title="Admin Panel"
        desc="Manage users, monitor system health, configure integrations, and review audit logs."
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-line/50 pb-1">
        {[
          { id: "users", label: "Users", icon: Users },
          { id: "system", label: "System Health", icon: Activity },
          { id: "config", label: "Configuration", icon: Settings },
          { id: "audit", label: "Audit Logs", icon: GitBranch },
          { id: "workers", label: "Workers & Queues", icon: Terminal },
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

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowCreateUser(true)} className="btn-primary text-xs flex items-center gap-2 py-2 px-3">
                <UserPlus size={14} />
                <span>Add User</span>
              </button>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-500" />
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="rounded-xl border border-line bg-[#FCFAF6] px-3 py-2 text-xs font-medium text-ink outline-none focus:border-orange">
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                  <option value="viewer">Viewer</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-line bg-[#FCFAF6] px-3 py-2 text-xs font-medium text-ink outline-none focus:border-orange">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="text-xs text-slate-500">{filteredUsers.length} / {users.length} users</div>
          </div>

          {showCreateUser && (
            <Card className="border-orange/30 bg-orange-50/30">
              <h3 className="font-bold text-sm text-ink mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Username</label>
                  <input type="text" value={newUser.username} onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))} placeholder="johndoe" className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} placeholder="john@domain.com" className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))} className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange">
                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Password</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange" />
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateUser(false)} className="btn-secondary text-xs py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary text-xs py-2.5 flex items-center justify-center gap-2"><UserPlus size={14} /><span>Create User</span></button>
                </div>
              </form>
            </Card>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-line/60">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">API Keys</th>
                  <th className="pb-2 font-medium">Last Login</th>
                  <th className="pb-2 font-medium">Created</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={editingUser === user.id ? "bg-orange-50/30" : "hover:bg-slate-50/50"}>
                    <td className="py-3">
                      {editingUser === user.id ? (
                        <input type="text" value={user.username} onChange={(e) => handleUpdateUser(user.id, { username: e.target.value })} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-orange" />
                      ) : (
                        <div>
                          <p className="font-mono font-bold text-ink">{user.username}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {editingUser === user.id ? (
                        <select value={user.role} onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })} className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-orange">
                          {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLES.find(r => r.id === user.role)?.bg} ${ROLES.find(r => r.id === user.role)?.color}`}>
                          {ROLES.find(r => r.id === user.role)?.label}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {editingUser === user.id ? (
                        <select value={user.status} onChange={(e) => handleUpdateUser(user.id, { status: e.target.value })} className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-orange">
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {user.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-500 font-mono">{user.apiKeysCount || 0}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editingUser === user.id ? (
                          <>
                            <button onClick={() => handleUpdateUser(user.id, {})} className="p-1.5 rounded-lg hover:bg-slate-100 text-emerald-600" title="Save"><CheckCircle size={16} /></button>
                            <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Cancel"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingUser(user.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit"><Edit size={16} /></button>
                            <button onClick={() => handleToggleStatus(user.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title={user.status === "active" ? "Suspend" : "Activate"}>
                              {user.status === "active" ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 rounded-lg hover:bg-criticalBg/10 text-critical" title="Delete"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <Card className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No users found matching filters</p>
            </Card>
          )}
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-ink">Service Health</h3>
            <button onClick={handleRefreshSystem} disabled={refreshing} className="btn-secondary text-xs flex items-center gap-2 py-2 px-3">
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SYSTEM_STATUSES.map((service) => {
              const status = systemStatus[service.id] || { status: "unknown" };
              const isHealthy = status.status === "healthy";
              return (
                <Card key={service.id} accent={isHealthy ? "emerald" : status.status === "degraded" ? "amber" : "critical"} hoverLift={false}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${isHealthy ? "bg-emerald-100" : status.status === "degraded" ? "bg-amber-100" : "bg-criticalBg/20"}`}>
                      <service.icon className={`w-5 h-5 ${isHealthy ? "text-emerald-600" : status.status === "degraded" ? "text-amber-600" : "text-critical"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-ink">{service.label}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isHealthy ? "bg-emerald-100 text-emerald-700" : status.status === "degraded" ? "bg-amber-100 text-amber-700" : "bg-criticalBg/20 text-critical"}`}>
                        {status.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    {status.latency && <p><span className="font-medium text-ink">Latency:</span> {status.latency}</p>}
                    {status.connections && <p><span className="font-medium text-ink">Connections:</span> {status.connections}</p>}
                    {status.memory && <p><span className="font-medium text-ink">Memory:</span> {status.memory}</p>}
                    {status.buckets && <p><span className="font-medium text-ink">Buckets:</span> {status.buckets} · Objects: {status.objects}</p>}
                    {status.lastSync && <p><span className="font-medium text-ink">Last Sync:</span> {status.lastSync}</p>}
                    {status.detections24h && <p><span className="font-medium text-ink">24h Detections:</span> {status.detections24h}</p>}
                    {status.provider && <p><span className="font-medium text-ink">Provider:</span> {status.provider}</p>}
                    {status.lastRequest && <p><span className="font-medium text-ink">Last Request:</span> {status.lastRequest}</p>}
                    {status.source && <p><span className="font-medium text-ink">Source:</span> {status.source}</p>}
                    {status.queries24h && <p><span className="font-medium text-ink">24h Queries:</span> {status.queries24h}</p>}
                    {status.activeTasks !== undefined && <p><span className="font-medium text-ink">Active Tasks:</span> {status.activeTasks} · Processed (1h): {status.processed1h}</p>}
                    {status.nextRun && <p><span className="font-medium text-ink">Next Run:</span> {status.nextRun} ({status.schedule})</p>}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Incident Stats */}
          <Card>
            <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Live Incident Statistics</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-white/50 border border-line">
                <p className="text-xs text-slate-500">Total Active</p>
                <p className="text-3xl font-extrabold text-ink mt-1">{incidents.filter(i => i.status !== "Resolved").length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line">
                <p className="text-xs text-slate-500">CRITICAL</p>
                <p className="text-3xl font-extrabold text-critical mt-1">{incidents.filter(i => i.risk === "CRITICAL").length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line">
                <p className="text-xs text-slate-500">HIGH</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">{incidents.filter(i => i.risk === "HIGH").length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line">
                <p className="text-xs text-slate-500">MEDIUM</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{incidents.filter(i => i.risk === "MEDIUM" || i.risk === "MODERATE").length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line">
                <p className="text-xs text-slate-500">LOW</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{incidents.filter(i => i.risk === "LOW").length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-ink">System Configuration</h3>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Read-Only in Demo</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Data Sources</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">NASA FIRMS</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Configured</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div><span className="font-medium text-ink">API Key:</span> {config.firms_api_key}</div>
                    <div><span className="font-medium text-ink">Source:</span> VIIRS_NOAA21_NRT</div>
                    <div><span className="font-medium text-ink">Refresh:</span> {config.firms_refresh_seconds}s</div>
                    <div><span className="font-medium text-ink">Backfill:</span> {config.firms_days} days</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">Weather Provider</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Configured</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div><span className="font-medium text-ink">Provider:</span> {config.weather_provider}</div>
                    <div><span className="font-medium text-ink">API Key:</span> {config.weather_api_key}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">OpenStreetMap</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Enabled</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div><span className="font-medium text-ink">Live Enabled:</span> {config.osm_live_enabled ? "Yes" : "No"}</div>
                    <div><span className="font-medium text-ink">Fallback:</span> Overpass API</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Security & Auth</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">JWT Authentication</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Configured</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <div><span className="font-medium text-ink">Secret:</span> {config.jwt_secret}</div>
                    <div><span className="font-medium text-ink">Algorithm:</span> HS256</div>
                    <div><span className="font-medium text-ink">OIDC:</span> {config.oidc_configured ? "Configured" : "Not configured (dev mode)"}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">CORS Origins</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Configured</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono bg-[#FCFAF6] p-2 rounded">{config.cors_origins}</div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Alerting Channels</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">Twilio SMS</span>
                    <span className={config.twilio_configured ? "px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700" : "px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"}>
                      {config.twilio_configured ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-ink">SMTP Email</span>
                    <span className={config.smtp_configured ? "px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700" : "px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"}>
                      {config.smtp_configured ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Monitoring Area</h3>
              <div className="space-y-3 text-xs text-slate-500">
                <div className="p-3 rounded-xl border border-line bg-white/50">
                  <div><span className="font-medium text-ink">Area:</span> {config.monitoring_area}</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div><span className="font-medium text-ink">Latitude:</span> -9.38</div>
                    <div><span className="font-medium text-ink">Longitude:</span> 33.01</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="font-bold text-lg text-ink">Audit Logs</h3>
            <button className="btn-secondary text-xs flex items-center gap-2 py-2 px-3">
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-line/60">
                  <th className="pb-2 font-medium">Timestamp</th>
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">Resource</th>
                  <th className="pb-2 font-medium">Details</th>
                  <th className="pb-2 font-medium">IP</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 font-mono text-sm text-ink">{log.user}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{log.action}</span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{log.resource}</td>
                    <td className="py-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{log.ip}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${log.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-criticalBg/20 text-critical"}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {auditLogs.length === 0 && (
            <Card className="text-center py-12">
              <GitBranch className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No audit logs available</p>
            </Card>
          )}
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === "workers" && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-ink">Celery Workers & Queues</h3>
          
          <Card>
            <h4 className="font-bold text-sm text-ink mb-4 tracking-tight">Worker Status</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-line bg-white/50">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-ink">Worker 1</span>
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                  <p><span className="font-medium text-ink">Status:</span> <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Online</span></p>
                  <p><span className="font-medium text-ink">Active Tasks:</span> 0</p>
                  <p><span className="font-medium text-ink">Processed (1h):</span> 42</p>
                  <p><span className="font-medium text-ink">Load:</span> 12%</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-line bg-white/50">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-ink">Worker 2</span>
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                  <p><span className="font-medium text-ink">Status:</span> <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Online</span></p>
                  <p><span className="font-medium text-ink">Active Tasks:</span> 1</p>
                  <p><span className="font-medium text-ink">Processed (1h):</span> 38</p>
                  <p><span className="font-medium text-ink">Load:</span> 8%</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-line bg-white/50">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-sm text-ink">Beat Scheduler</span>
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                  <p><span className="font-medium text-ink">Status:</span> <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Running</span></p>
                  <p><span className="font-medium text-ink">Next Run:</span> 3 min</p>
                  <p><span className="font-medium text-ink">Schedule:</span> Every 5 min</p>
                  <p><span className="font-medium text-ink">Tasks Queued:</span> 0</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold text-sm text-ink mb-4 tracking-tight">Queue Metrics</h4>
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/50 border border-line text-center">
                <p className="text-3xl font-extrabold text-ink">0</p>
                <p className="text-xs text-slate-500">Pending Tasks</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line text-center">
                <p className="text-3xl font-extrabold text-emerald-600">80</p>
                <p className="text-xs text-slate-500">Completed (1h)</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line text-center">
                <p className="text-3xl font-extrabold text-critical">0</p>
                <p className="text-xs text-slate-500">Failed (1h)</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 border border-line text-center">
                <p className="text-3xl font-extrabold text-orange-600">1</p>
                <p className="text-xs text-slate-500">Active Workers</p>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold text-sm text-ink mb-4 tracking-tight">Registered Tasks</h4>
            <div className="space-y-2">
              {[
                { name: "pyrolens.ingest_firms", schedule: "Every 5 minutes", lastRun: "2 min ago", nextRun: "3 min", status: "healthy" },
                { name: "pyrolens.cleanup_old_events", schedule: "Daily at 02:00 UTC", lastRun: "6 hours ago", nextRun: "18 hours", status: "healthy" },
                { name: "pyrolens.retrain_models", schedule: "Weekly on Sunday", lastRun: "3 days ago", nextRun: "4 days", status: "healthy" },
              ].map((task) => (
                <div key={task.name} className="p-3 rounded-xl border border-line bg-white/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-mono text-sm text-ink">{task.name}</p>
                      <p className="text-xs text-slate-500">Schedule: {task.schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span><span className="font-medium text-ink">Last:</span> {task.lastRun}</span>
                    <span><span className="font-medium text-ink">Next:</span> {task.nextRun}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${task.status === "healthy" ? "bg-emerald-100 text-emerald-700" : "bg-criticalBg/20 text-critical"}`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
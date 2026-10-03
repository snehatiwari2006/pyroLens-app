import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { apiFetch } from "../services/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { Bell, Send, X, ChevronDown, ChevronUp, Filter, AlertTriangle, CheckCircle, Clock, MessageSquare, Smartphone, Mail } from "lucide-react";

const CHANNELS = [
  { id: "dashboard", label: "Dashboard", icon: Bell, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "sms", label: "SMS", icon: Smartphone, color: "text-green-600", bg: "bg-green-50" },
  { id: "email", label: "Email", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
];

const STATUS_STYLES = {
  sent: { bg: "bg-emerald-100", text: "text-emerald-800", icon: CheckCircle },
  failed: { bg: "bg-criticalBg", text: "text-critical", icon: AlertTriangle },
  recorded: { bg: "bg-amber-100", text: "text-amber-800", icon: Clock },
  not_configured: { bg: "bg-slate-100", text: "text-slate-600", icon: X },
};

export default function AlertManagement() {
  const { incidents, issueWarning, openIncident } = useApp();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selectedId, setSelectedId] = useState(active[0]?.id || "");
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    channels: ["dashboard"],
    recipients: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterChannel, setFilterChannel] = useState("all");

  const sel = incidents.find((i) => i.id === selectedId) || active[0];

  // Load alert history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Try to fetch from API, fallback to localStorage
        const response = await apiFetch("/alerts/history");
        if (response) {
          setAlertHistory(response);
        } else {
          // Fallback to localStorage for demo
          const stored = localStorage.getItem("pyrolens_alert_history");
          if (stored) setAlertHistory(JSON.parse(stored));
        }
      } catch {
        const stored = localStorage.getItem("pyrolens_alert_history");
        if (stored) setAlertHistory(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const saveToHistory = (alert) => {
    const history = [alert, ...alertHistory].slice(0, 100);
    setAlertHistory(history);
    localStorage.setItem("pyrolens_alert_history", JSON.stringify(history));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sel || submitting) return;
    
    setSubmitting(true);
    const recipients = formData.recipients.split(",").map(r => r.trim()).filter(Boolean);
    
    try {
      const response = await apiFetch(`/events/${sel.id}/alerts`, {
        method: "POST",
        body: JSON.stringify({
          channels: formData.channels,
          recipients,
          message: formData.message,
        }),
      });
      
      // Save to history
      const alertRecord = {
        id: `ALERT-${Date.now()}`,
        eventId: sel.id,
        eventName: sel.name,
        timestamp: new Date().toISOString(),
        channels: formData.channels,
        recipients,
        message: formData.message,
        deliveries: response.deliveries || formData.channels.map(c => ({ channel: c, status: "sent" })),
      };
      saveToHistory(alertRecord);
      
      // Reset form
      setFormData({ channels: ["dashboard"], recipients: "", message: "" });
      setShowCreate(false);
    } catch (error) {
      console.error("Failed to send alert:", error);
      // Still save to history for demo
      const alertRecord = {
        id: `ALERT-${Date.now()}`,
        eventId: sel.id,
        eventName: sel.name,
        timestamp: new Date().toISOString(),
        channels: formData.channels,
        recipients,
        message: formData.message,
        deliveries: formData.channels.map(c => ({ channel: c, status: "recorded" })),
      };
      saveToHistory(alertRecord);
      setFormData({ channels: ["dashboard"], recipients: "", message: "" });
      setShowCreate(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = filterChannel === "all"
    ? alertHistory
    : alertHistory.filter(a => a.channels.includes(filterChannel));

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Alert Operations"
        title="Alert Management Center"
        desc="Issue, track, and manage multi-channel warnings for thermal events. Supports dashboard, SMS, and email delivery with delivery confirmation."
      />

      {/* Event Selector + Create Alert */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slateink">Target Event</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="min-w-[20rem] max-w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15 shadow-xs transition-all"
          >
            {active.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.id} · {incident.frp} · {incident.confidence}% ({incident.name})
              </option>
            ))}
          </select>
          <SeverityPill level={sel?.risk} />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-xs font-bold shadow-sm shadow-orange/30"
        >
          <Send size={14} />
          <span>Issue New Alert</span>
        </button>
      </div>

      {/* Create Alert Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-ink">Issue Alert for {sel?.id}</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-2">Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => (
                    <label key={ch.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line bg-white cursor-pointer hover:bg-slate-50 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(ch.id)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          channels: e.target.checked
                            ? [...prev.channels, ch.id]
                            : prev.channels.filter(c => c !== ch.id)
                        }))}
                        className="rounded border-line text-orange focus:ring-orange"
                      />
                      <ch.icon className={`w-4 h-4 ${ch.color}`} />
                      <span className="text-sm font-medium text-ink">{ch.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-2">Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={formData.recipients}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="+1234567890, user@domain.com"
                  className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15 shadow-xs transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">Phone numbers for SMS, emails for email channel</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-2">Custom Message (optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  placeholder="PyroLens {risk} alert: {name} at {location}. Risk score: {riskScore}/100."
                  className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15 shadow-xs transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.channels.length === 0}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Alert</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert History */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-bold text-lg text-ink">Alert History</h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="rounded-xl border border-line bg-[#FCFAF6] px-3 py-2 text-xs font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15"
            >
              <option value="all">All Channels</option>
              {CHANNELS.map(ch => <option key={ch.id} value={ch.id}>{ch.label}</option>)}
            </select>
            {loading && <span className="text-xs text-slate-500 animate-pulse">Loading…</span>}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <Card className="bg-white/50 border-dashed">
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No alerts issued yet</p>
              <p className="text-xs text-slate-400 mt-1">Select an event and click "Issue New Alert" to send your first warning</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((alert) => (
              <Card key={alert.id} accent="orange" hoverLift={false} className="overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 items-center">
                  {/* Event Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-orange">{alert.eventId}</span>
                      <SeverityPill level={sel?.risk} size="xs" />
                    </div>
                    <p className="text-xs text-slate-500 truncate">{alert.eventName}</p>
                  </div>

                  {/* Channels & Recipients */}
                  <div className="flex flex-wrap gap-1.5">
                    {alert.channels.map((ch) => {
                      const delivery = alert.deliveries?.find(d => d.channel === ch);
                      const style = STATUS_STYLES[delivery?.status] || STATUS_STYLES.recorded;
                      const Icon = style.icon;
                      return (
                        <span key={ch} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}`}>
                          <Icon size={10} />
                          {CHANNELS.find(c => c.id === ch)?.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-slate-500 font-mono">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>

                  {/* Recipients */}
                  <div className="text-xs text-slate-500 max-w-[150px] truncate">
                    {alert.recipients.length > 0 ? alert.recipients.join(", ") : "Dashboard only"}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openIncident(alert.eventId)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-ink transition-colors"
                      title="View event"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Message Preview */}
                {alert.message && (
                  <div className="mt-3 pt-3 border-t border-line/60">
                    <p className="text-xs text-slate-600 font-mono bg-[#FCFAF6] p-2 rounded-lg">{alert.message}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Channel Configuration */}
        <Card accent="blue">
          <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Channel Configuration</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {CHANNELS.map((ch) => (
              <div key={ch.id} className="p-4 rounded-xl border border-line bg-white/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${ch.bg}`}>
                    <ch.icon className={`w-5 h-5 ${ch.color}`} />
                  </div>
                  <span className="font-bold text-sm text-ink">{ch.label}</span>
                </div>
                <div className="space-y-2 text-xs text-slate-500">
                  <p>Status: <span className="text-ink font-medium">Configured</span></p>
                  <p>Rate limit: <span className="text-ink font-medium">{ch.id === "sms" ? "10/min" : ch.id === "email" ? "50/hr" : "Unlimited"}</span></p>
                  <p>Retry policy: <span className="text-ink font-medium">{ch.id === "dashboard" ? "Instant" : "3 retries"}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
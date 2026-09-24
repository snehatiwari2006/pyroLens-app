import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { MONITORING_ZONES } from "../data/monitoringZones.js";

export default function AreaMonitoring() {
  const [zones, setZones] = useState(MONITORING_ZONES);
  const [form, setForm] = useState({
    name: "",
    location: "",
    radius: "2",
    threshold: "Medium+",
    freq: "15 min",
    notify: "SMS + Dashboard",
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    setZones([
      {
        name: form.name,
        radius: `${form.radius} km`,
        threshold: form.threshold,
        freq: form.freq,
        notify: form.notify,
      },
      ...zones,
    ]);
    setForm({ ...form, name: "", location: "" });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Perimeter Geofencing"
        title="Custom Area Monitoring"
        desc="Arm custom geographic perimeters for continuous satellite thermal surveillance around refineries, chemical complexes, and mining hubs."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Form Card */}
        <Card className="lg:col-span-1" accent="teal" hoverLift={false}>
          <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Arm New Geofence Perimeter</h3>
          <form onSubmit={submit} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="text-xs font-semibold text-slateink block mb-1">Perimeter Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="e.g. Copper Smelter Sector 4"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slateink block mb-1">Location Coordinates</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input"
                placeholder="Coordinates or facility name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slateink block mb-1">Surveillance Radius (km)</label>
              <input
                type="number"
                value={form.radius}
                onChange={(e) => setForm({ ...form, radius: e.target.value })}
                className="input"
                min="0.5"
                step="0.5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slateink block mb-1">Alert Trigger Threshold</label>
              <select
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                className="input"
              >
                <option>Low+ (FRP &gt; 10MW)</option>
                <option>Medium+ (FRP &gt; 35MW)</option>
                <option>High+ (FRP &gt; 80MW)</option>
                <option>Critical Only (FRP &gt; 150MW)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slateink block mb-1">Observation Sampling</label>
              <select
                value={form.freq}
                onChange={(e) => setForm({ ...form, freq: e.target.value })}
                className="input"
              >
                <option>Every Orbit Pass (~15 min)</option>
                <option>30 min Aggregation</option>
                <option>1 hour Batch</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slateink block mb-1">Dispatch Channel</label>
              <select
                value={form.notify}
                onChange={(e) => setForm({ ...form, notify: e.target.value })}
                className="input"
              >
                <option>Dashboard Only</option>
                <option>SMS + Dashboard</option>
                <option>Email + Push Notifications</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 font-bold shadow-sm shadow-orange/30 mt-2">
              Arm Monitoring Perimeter
            </button>
          </form>
        </Card>

        {/* Active Zones List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink tracking-tight">Active Surveillance Perimeters</h3>
            <span className="text-xs text-slateink font-mono">{zones.length} armed zones</span>
          </div>

          <div className="space-y-3">
            {zones.map((z, idx) => (
              <Card key={idx} accent="blue" hoverLift={true}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-ink tracking-tight">{z.name}</div>
                    <div className="text-xs mt-1 text-slateink">
                      Radius <strong className="text-ink">{z.radius}</strong> · Threshold <strong className="text-ink">{z.threshold}</strong> · Sampling <strong className="text-ink">{z.freq}</strong>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-0.5 text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Armed</span>
                  </span>
                </div>
                <div className="text-xs mt-3 pt-2.5 border-t border-line/60 text-slateink">
                  Notification: <span className="font-medium text-ink">{z.notify}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

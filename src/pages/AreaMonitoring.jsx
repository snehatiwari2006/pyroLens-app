import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { MONITORING_ZONES } from "../data/monitoringZones.js";

export default function AreaMonitoring() {
  const [zones, setZones] = useState(MONITORING_ZONES);
  const [form, setForm] = useState({ name: "", location: "", radius: "2", threshold: "Medium+", freq: "15 min", notify: "SMS + Dashboard" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    setZones([{ name: form.name, radius: `${form.radius} km`, threshold: form.threshold, freq: form.freq, notify: form.notify }, ...zones]);
    setForm({ ...form, name: "", location: "" });
  };

  return (
    <div>
      <SectionHeader title="Area monitoring" desc="Define custom zones for continuous thermal monitoring around sensitive sites." />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-sm mb-4 text-ink">New monitoring zone</h3>
          <form onSubmit={submit} className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slateink">Zone name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Industrial Zone A Perimeter" />
            </div>
            <div>
              <label className="text-xs text-slateink">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Coordinates or place name" />
            </div>
            <div>
              <label className="text-xs text-slateink">Radius (km)</label>
              <input type="number" value={form.radius} onChange={(e) => setForm({ ...form, radius: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-xs text-slateink">Risk threshold</label>
              <select value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} className="input">
                <option>Low+</option><option>Medium+</option><option>High+</option><option>Critical only</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slateink">Monitoring frequency</label>
              <select value={form.freq} onChange={(e) => setForm({ ...form, freq: e.target.value })} className="input">
                <option>5 min</option><option>15 min</option><option>30 min</option><option>1 hour</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slateink">Notification preference</label>
              <select value={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.value })} className="input">
                <option>Dashboard only</option><option>SMS + Dashboard</option><option>Email + Dashboard</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Start monitoring</button>
          </form>
        </Card>
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-sm text-ink">Active monitoring zones</h3>
          {zones.map((z, idx) => (
            <Card key={idx}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm text-ink">{z.name}</div>
                  <div className="text-xs mt-1 text-slateink">Radius {z.radius} · Threshold {z.threshold} · Every {z.freq}</div>
                </div>
                <span className="text-[11px] font-semibold rounded px-2 py-0.5 text-safe bg-safeBg">Active</span>
              </div>
              <div className="text-xs mt-2 text-slateink">Notifications: {z.notify}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

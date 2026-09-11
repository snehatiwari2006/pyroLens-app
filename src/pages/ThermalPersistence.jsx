import React from "react";
import { Thermometer, Activity, ScanLine } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import KpiCard from "../components/KpiCard.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import { THERMAL_SOURCES } from "../data/thermalSources.js";
import { TIME_SERIES } from "../data/analytics.js";

export default function ThermalPersistence() {
  return (
    <div>
      <SectionHeader title="Fire & thermal persistence analysis" desc="Differentiates one-off events from persistent thermal sources requiring continuous monitoring." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={Thermometer} label="Avg. brightness temp." value="378 K" tone="high" />
        <KpiCard icon={Activity} label="Avg. FRP" value="94 MW" tone="critical" />
        <KpiCard icon={ScanLine} label="Persistent sources" value="08" tone="info" />
      </div>
      <SectionHeader title="Persistent thermal sources" desc="Recurring anomalies distinguished from temporary fire events." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {THERMAL_SOURCES.map((t) => (
          <Card key={t.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-slateink">{t.id}</div>
              <span className="text-[11px] font-semibold rounded px-2 py-0.5 text-info bg-infoBg">Persistent source</span>
            </div>
            <div className="font-semibold text-sm mb-1 text-ink">{t.name}</div>
            <div className="text-xs mb-3 text-slateink">{t.location}</div>
            <ConfidenceMeter value={t.persistenceScore} label="Persistence score" />
            <div className="grid grid-cols-2 gap-2 text-xs mt-3 text-slateink">
              <div>Frequency<br /><strong className="text-ink">{t.freq}</strong></div>
              <div>Duration<br /><strong className="text-ink">{t.duration}</strong></div>
              <div>Industrial proximity<br /><strong className="text-ink">{t.proximity}</strong></div>
              <div>Possible source<br /><strong className="text-ink">{t.source}</strong></div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="font-semibold mb-4 text-sm text-ink">Fire events over time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={TIME_SERIES}>
            <CartesianGrid stroke="#DFE4E9" vertical={false} />
            <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#5B6B7A" }} axisLine={{ stroke: "#DFE4E9" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#5B6B7A" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="events" stroke="#0F2A43" fill="#EEF2F6" strokeWidth={2} name="All events" />
            <Area type="monotone" dataKey="industrial" stroke="#B3261E" fill="#FBEAE9" strokeWidth={2} name="Industrial fires" />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

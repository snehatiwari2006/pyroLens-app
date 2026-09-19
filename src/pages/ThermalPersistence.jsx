import React, { useMemo } from "react";
import { Thermometer, Activity, ScanLine } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import KpiCard from "../components/KpiCard.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function ThermalPersistence() {
  const { incidents } = useApp();
  const sources = useMemo(() => [...incidents]
    .filter((incident) => incident.persistenceScore >= 35)
    .sort((left, right) => right.persistenceScore - left.persistenceScore)
    .slice(0, 12), [incidents]);
  const average = (field) => sources.length
    ? Math.round(sources.reduce((sum, source) => sum + (Number(source[field]) || 0), 0) / sources.length)
    : 0;
  const chartData = sources.slice(0, 8).map((source) => ({
    d: source.id.slice(-6),
    events: source.persistenceScore,
    industrial: source.riskScore,
  }));

  return (
    <div>
      <SectionHeader title="Fire & thermal persistence analysis" desc="Differentiates one-off events from persistent thermal sources requiring continuous monitoring." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={Thermometer} label="Avg. persistence score" value={`${average("persistenceScore")}%`} tone="high" />
        <KpiCard icon={Activity} label="Avg. risk score" value={`${average("riskScore")}%`} tone="critical" />
        <KpiCard icon={ScanLine} label="Persistent sources" value={sources.length.toString()} tone="info" />
      </div>
      <SectionHeader title="Persistent thermal sources" desc="Recurring anomalies distinguished from temporary fire events." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sources.map((t) => (
          <Card key={t.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-slateink">{t.id}</div>
              <span className="text-[11px] font-semibold rounded px-2 py-0.5 text-info bg-infoBg">Persistent source</span>
            </div>
            <div className="font-semibold text-sm mb-1 text-ink">{t.name}</div>
            <div className="text-xs mb-3 text-slateink">{t.location}</div>
            <ConfidenceMeter value={t.persistenceScore} label="Persistence score" />
            <div className="grid grid-cols-2 gap-2 text-xs mt-3 text-slateink">
              <div>Confidence<br /><strong className="text-ink">{t.confidence}%</strong></div>
              <div>Fire intensity<br /><strong className="text-ink">{t.frp}</strong></div>
              <div>Risk score<br /><strong className="text-ink">{t.riskScore}%</strong></div>
              <div>Provider<br /><strong className="text-ink">{t.satellite}</strong></div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="font-semibold mb-4 text-sm text-ink">Fire events over time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <CartesianGrid stroke="#E8E4DC" vertical={false} />
            <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="events" stroke="#0F1E2E" fill="#F5F1EB" strokeWidth={2} name="Persistence score" />
            <Area type="monotone" dataKey="industrial" stroke="#B3261E" fill="#FBEAE9" strokeWidth={2} name="Risk score" />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

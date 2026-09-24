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
  const sources = useMemo(
    () =>
      [...incidents]
        .filter((incident) => incident.persistenceScore >= 35)
        .sort((left, right) => right.persistenceScore - left.persistenceScore)
        .slice(0, 12),
    [incidents]
  );
  
  const average = (field) =>
    sources.length
      ? Math.round(sources.reduce((sum, source) => sum + (Number(source[field]) || 0), 0) / sources.length)
      : 0;

  const chartData = sources.slice(0, 8).map((source) => ({
    d: source.id.slice(-6),
    events: source.persistenceScore,
    industrial: source.riskScore,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Temporal Analysis"
        title="Fire & Thermal Persistence Analysis"
        desc="Differentiates temporary wildfires and crop burning from persistent thermal sources (smelters, flaring stacks, industrial kilns) requiring continuous monitoring."
      />

      <div className="grid sm:grid-cols-3 gap-5">
        <KpiCard icon={Thermometer} label="Avg. Persistence Score" value={`${average("persistenceScore")}%`} tone="high" />
        <KpiCard icon={Activity} label="Avg. Threat Index" value={`${average("riskScore")}%`} tone="critical" />
        <KpiCard icon={ScanLine} label="Persistent Sources" value={sources.length.toString()} tone="info" sub="Recurring passes ≥ 30d" />
      </div>

      <div>
        <SectionHeader
          title="Persistent Thermal Sources"
          desc="Recurring anomalies observed across multiple satellite orbits, cross-referenced with spatial coordinates."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map((t) => (
            <Card key={t.id} accent="amber" hoverLift={true}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-bold text-slateink">{t.id}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-amber-800 bg-amber-100 border border-amber-200">
                  Persistent
                </span>
              </div>
              <div className="font-bold text-sm text-ink mb-1 tracking-tight truncate">{t.name}</div>
              <div className="text-xs mb-3.5 text-slateink">{t.location}</div>
              <ConfidenceMeter value={t.persistenceScore} label="Persistence Score" />
              <div className="grid grid-cols-2 gap-2 text-xs mt-3.5 pt-3 border-t border-line/60 text-slateink">
                <div>Confidence: <strong className="text-ink">{t.confidence}%</strong></div>
                <div>FRP Intensity: <strong className="text-ink">{t.frp}</strong></div>
                <div>Threat Index: <strong className="text-ink">{t.riskScore}%</strong></div>
                <div>Sensor Feed: <strong className="text-ink">{t.satellite}</strong></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Historical Area Chart */}
      <Card accent="orange" hoverLift={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-ink tracking-tight">Persistence vs. Risk Telemetry Over Time</h3>
          <span className="text-xs text-slateink">Top 8 tracked targets</span>
        </div>
        <div className="py-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#E8E4DC" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#E8E4DC",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(15,30,46,0.08)",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="events" stroke="#D97706" fill="#FEF3C7" strokeWidth={2} name="Persistence score" />
              <Area type="monotone" dataKey="industrial" stroke="#C2410C" fill="#FFF4EB" strokeWidth={2} name="Risk score" />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

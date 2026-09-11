import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, AlertTriangle, Thermometer, ShieldAlert, Building2, Satellite, ChevronRight } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import Card from "../components/Card.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import KpiCard from "../components/KpiCard.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { RISK_DIST, KPIS } from "../data/analytics.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { incidents, openIncident } = useApp();
  const active = incidents.filter((i) => i.status !== "Resolved");

  return (
    <div>
      <SectionHeader title="Intelligence dashboard" desc="Current situation across all monitored thermal events and industrial zones." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard icon={Flame} label="Active thermal events" value={KPIS.activeThermalEvents} sub="+4 in last 6 hours" tone="critical" />
        <KpiCard icon={AlertTriangle} label="Potential fire events" value={KPIS.potentialFireEvents} sub="Awaiting verification" tone="high" />
        <KpiCard icon={Thermometer} label="Persistent thermal sources" value={`0${KPIS.persistentThermalSources}`} sub="Recurring ≥ 30 days" tone="info" />
        <KpiCard icon={ShieldAlert} label="High-risk zones" value={`0${KPIS.highRiskZones}`} sub="Score ≥ 70 / 100" tone="high" />
        <KpiCard icon={Building2} label="Potentially exposed areas" value={KPIS.potentiallyExposedAreas} sub="Within estimated impact zones" tone="navy" />
        <KpiCard icon={Satellite} label="Satellite observations" value={KPIS.satelliteObservations.toLocaleString()} sub="Last 24 hours" tone="safe" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padded={false}>
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="font-semibold text-ink">Priority incidents</h3>
              <button onClick={() => navigate("/incidents")} className="text-xs font-medium flex items-center gap-1 text-navy">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="divide-y divide-line">
              {active.slice(0, 5).map((i) => (
                <button key={i.id} onClick={() => openIncident(i)} className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50">
                  <SeverityPill level={i.risk} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-ink">{i.name}</div>
                    <div className="text-xs text-slateink">{i.location} · {i.type}</div>
                  </div>
                  <div className="text-xs shrink-0 text-slateink">{i.detectionTime}</div>
                  <ChevronRight size={15} className="text-slateink" />
                </button>
              ))}
            </div>
          </Card>
        </div>
        <Card>
          <h3 className="font-semibold mb-3 text-ink">Risk distribution</h3>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={RISK_DIST} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={2}>
                {RISK_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {RISK_DIST.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs text-slateink">
                <span className="h-2 w-2 rounded-full" style={{ background: r.color }} /> {r.name} — {r.value}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

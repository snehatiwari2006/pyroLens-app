import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, AlertTriangle, Thermometer, ShieldAlert, Building2, Satellite, ChevronRight, Activity } from "lucide-react";
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
    <div className="dashboard-shell space-y-8 animate-fadeIn py-3">
      <SectionHeader
        eyebrow="Operational Intelligence"
        title="Intelligence Dashboard"
        desc="Real-time multi-sensor situation overview across active thermal detections, high-risk industrial perimeters, and estimated exposure zones."
      />

      {/* KPI Telemetry Matrix */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard icon={Flame} label="Active Thermal Events" value={KPIS.activeThermalEvents} sub="+4 detected in last 6 hours" tone="critical" />
        <KpiCard icon={AlertTriangle} label="Potential Industrial Fires" value={KPIS.potentialFireEvents} sub="Awaiting ground verification" tone="high" />
        <KpiCard icon={Thermometer} label="Persistent Thermal Sources" value={`0${KPIS.persistentThermalSources}`} sub="Recurring passes ≥ 30 days" tone="info" />
        <KpiCard icon={ShieldAlert} label="High-Risk Asset Zones" value={`0${KPIS.highRiskZones}`} sub="Threat score ≥ 70 / 100" tone="high" />
        <KpiCard icon={Building2} label="Potentially Exposed Areas" value={KPIS.potentiallyExposedAreas} sub="Within estimated impact footprint" tone="navy" />
        <KpiCard icon={Satellite} label="Satellite Observations" value={KPIS.satelliteObservations.toLocaleString()} sub="NASA VIIRS & MODIS (24h)" tone="safe" />
      </div>

      {/* Priority Stream + Risk Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Priority Incidents Table */}
        <div className="lg:col-span-2">
          <Card padded={false} accent="orange" hoverLift={false} className="shadow-[0_16px_30px_-22px_rgba(234,88,12,0.38)]">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-line/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange animate-pulse" />
                <h3 className="font-bold text-base text-ink tracking-tight">Priority Incident Queue</h3>
              </div>
              <button
                onClick={() => navigate("/incidents")}
                className="text-xs font-semibold flex items-center gap-1 text-orange hover:text-orangeHover transition-colors"
              >
                <span>View all incidents</span>
                <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="divide-y divide-line/60">
              {active.slice(0, 5).map((i) => (
                <button
                  key={i.id}
                  onClick={() => openIncident(i)}
                  className="w-full text-left px-6 py-4 flex items-center gap-3.5 hover:bg-[#FAF7F2] transition-colors group"
                >
                  <SeverityPill level={i.risk} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink group-hover:text-orange transition-colors truncate">
                      {i.name}
                    </div>
                    <div className="text-xs text-slateink mt-0.5">
                      {i.location} · <span className="font-medium text-ink/80">{i.type}</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slateink shrink-0">{i.detectionTime}</div>
                  <ChevronRight size={16} className="text-slateink/60 group-hover:text-orange group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Risk Distribution Card */}
        <Card accent="purple" hoverLift={false} className="bg-gradient-to-br from-white via-white to-purple-50/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-ink tracking-tight">Risk Distribution</h3>
            <span className="text-[11px] font-semibold text-slateink bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200/60">
              Active Events
            </span>
          </div>
          
          <div className="py-2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={RISK_DIST} dataKey="value" nameKey="name" innerRadius={48} outerRadius={74} paddingAngle={3}>
                  {RISK_DIST.map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#E8E4DC",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(15,30,46,0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-line/60">
            {RISK_DIST.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-xs text-slateink">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="truncate">{r.name}</span>
                <span className="font-bold text-ink ml-auto">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

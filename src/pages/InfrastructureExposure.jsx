import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Factory, Building2, Route, Users, Hospital, ScanLine, Info } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { AiTag } from "../components/AIInsightCard.jsx";
import { apiFetch } from "../services/api.js";

export default function InfrastructureExposure() {
  const { incidents } = useApp();
  const location = useLocation();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selId, setSelId] = useState(location.state?.incidentId || active[0]?.id || incidents[0]?.id || "");
  const [liveExposure, setLiveExposure] = useState(null);
  const [loadError, setLoadError] = useState("");
  const sel = incidents.find((i) => i.id === selId) || active[0] || incidents[0];

  useEffect(() => {
    if (!selId) return;
    let cancelled = false;
    setLoadError("");
    apiFetch(`/events/${selId}/impact`)
      .then((result) => {
        if (!cancelled) setLiveExposure(result.exposed);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || "Live exposure query unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [selId]);

  if (!sel) {
    return (
      <div className="rounded-xl border border-high/30 bg-highBg p-4 text-sm text-high">
        Loading live thermal events…
      </div>
    );
  }

  const exposure = liveExposure || sel.exposure || {};

  const rows = [
    {
      icon: Factory,
      label: "Industrial Facilities",
      value: exposure.industrial_sites ?? exposure.industrial ?? 0,
      accent: "orange",
      chip: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      icon: Building2,
      label: "Civil & Commercial Buildings",
      value: exposure.buildings ?? 0,
      accent: "blue",
      chip: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      icon: Route,
      label: "Critical Road Corridors",
      value: exposure.roads ?? 0,
      accent: "teal",
      chip: "bg-teal-50 text-teal-600 border-teal-200",
    },
    {
      icon: Users,
      label: "Resident Population",
      value: `~${(exposure.population ?? 0).toLocaleString()}`,
      accent: "critical",
      chip: "bg-rose-50 text-rose-600 border-rose-200",
    },
    {
      icon: Hospital,
      label: "Critical Assets / Healthcare",
      value: exposure.critical_assets ?? exposure.critical ?? 0,
      accent: "purple",
      chip: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      icon: ScanLine,
      label: "Protected Environmental Zone",
      value: exposure.environment ?? "OSM Land-use",
      accent: "safe",
      chip: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Asset Exposure Matrix"
        title="Infrastructure & Population Exposure"
        desc="Spatial intersection of the estimated spread footprint with OpenStreetMap critical infrastructure polygons, transportation corridors, and residential sectors."
        action={<AiTag />}
      />

      {/* Target Selector */}
      <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slateink" htmlFor="exposure-event">
          Target Observation
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select
            id="exposure-event"
            value={selId}
            onChange={(event) => setSelId(event.target.value)}
            className="min-w-[18rem] max-w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15 shadow-xs transition-all"
          >
            {active.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.id} · {incident.frp} ({incident.name})
              </option>
            ))}
          </select>
          <span className="text-xs font-medium text-slateink">
            {active.length.toLocaleString()} observations monitored
          </span>
        </div>
      </div>

      {/* Exposure Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rows.map((r) => (
          <Card key={r.label} accent={r.accent} hoverLift={true}>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${r.chip}`}>
                <r.icon size={20} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-ink tracking-tight">{r.value}</div>
                <div className="text-xs font-medium text-slateink truncate mt-0.5">{r.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {loadError && (
        <p className="rounded-xl border border-high/30 bg-highBg p-3 text-xs text-high">
          Live OSM exposure query: {loadError}
        </p>
      )}

      {/* Clarification Box */}
      <div className="rounded-xl border border-line/80 p-4 text-xs sm:text-sm flex items-start gap-3 bg-[#FCFAF6]">
        <Info size={18} className="mt-0.5 shrink-0 text-orange" />
        <p className="text-slateink leading-relaxed">
          Assets listed above fall within the estimated perimeter footprint and are classified as{" "}
          <strong className="text-ink font-semibold">potentially at risk</strong>. Multi-agency field verification is recommended prior to ordering preventative evacuations or asset shutdowns.
        </p>
      </div>

    </div>
  );
}

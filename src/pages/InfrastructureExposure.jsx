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
  const [selId, setSelId] = useState(location.state?.incidentId || active[0]?.id || "");
  const [liveExposure, setLiveExposure] = useState(null);
  const [loadError, setLoadError] = useState("");
  const sel = incidents.find((i) => i.id === selId);
  useEffect(() => {
    if (!selId) return;
    let cancelled = false;
    setLoadError("");
    apiFetch(`/events/${selId}/impact`)
      .then((result) => { if (!cancelled) setLiveExposure(result.exposed); })
      .catch((error) => { if (!cancelled) setLoadError(error.message || "Live exposure query unavailable"); });
    return () => { cancelled = true; };
  }, [selId]);

  if (!sel) return <div className="rounded-md border border-high/30 bg-highBg px-3 py-2 text-sm text-high">Loading live thermal events…</div>;
  const exposure = liveExposure || sel.exposure;

  const rows = [
    { icon: Factory, label: "Industrial facilities", value: exposure.industrial_sites ?? exposure.industrial ?? 0 },
    { icon: Building2, label: "Buildings", value: exposure.buildings ?? 0 },
    { icon: Route, label: "Roads", value: exposure.roads ?? 0 },
    { icon: Users, label: "Population", value: `~${(exposure.population ?? 0).toLocaleString()}` },
    { icon: Hospital, label: "Critical infrastructure", value: exposure.critical_assets ?? exposure.critical ?? 0 },
    { icon: ScanLine, label: "Environmental area", value: exposure.environment ?? "Live OSM context" },
  ];

  return (
    <div>
      <SectionHeader title="Infrastructure & population exposure"
        desc="Assets potentially exposed within the estimated impact zone — never a claim of guaranteed damage."
        action={<AiTag />} />
      <div className="mb-5 rounded-lg border border-line bg-white p-4">
        <label className="block text-xs font-semibold text-ink" htmlFor="exposure-event">Live thermal event</label>
        <select id="exposure-event" value={selId} onChange={(event) => setSelId(event.target.value)} className="mt-2 min-w-[18rem] max-w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink">
          {active.map((incident) => <option key={incident.id} value={incident.id}>{incident.id} · {incident.frp}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {rows.map((r) => (
          <Card key={r.label}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#F5F1EB]"><r.icon size={18} className="text-ink" /></div>
              <div>
                <div className="text-xl font-semibold text-ink">{r.value}</div>
                <div className="text-xs text-slateink">Potentially exposed — {r.label.toLowerCase()}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {loadError && <p className="mb-4 text-xs text-high">Live OSM exposure data is unavailable: {loadError}</p>}
      <div className="rounded-lg border border-line p-4 text-sm flex items-start gap-2.5 bg-[#FAF7F2]">
        <Info size={16} className="mt-0.5 shrink-0 text-slateink" />
        <p className="text-slateink">
          Assets listed above fall within the estimated impact zone and are classified as
          <strong className="text-ink"> potentially at risk</strong>, not confirmed affected. Field verification by
          authorized personnel is required before any response action.
        </p>
      </div>
    </div>
  );
}

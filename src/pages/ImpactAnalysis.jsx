import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { AiTag, Disclaimer } from "../components/AIInsightCard.jsx";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";
import { apiFetch } from "../services/api.js";

export default function ImpactAnalysis() {
  const { incidents } = useApp();
  const location = useLocation();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selId, setSelId] = useState(location.state?.incidentId || active[0]?.id || "");
  const [impact, setImpact] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [impactError, setImpactError] = useState("");
  const sel = incidents.find((i) => i.id === selId);

  useEffect(() => {
    if (!selId) return;
    let cancelled = false;
    setLoadingImpact(true);
    setImpactError("");
    apiFetch(`/events/${selId}/impact`)
      .then((result) => { if (!cancelled) setImpact(result); })
      .catch((error) => { if (!cancelled) { setImpact(null); setImpactError(error.message || "Impact analysis is unavailable"); } })
      .finally(() => { if (!cancelled) setLoadingImpact(false); });
    return () => { cancelled = true; };
  }, [selId]);

  if (!sel) {
    return <div className="rounded-md border border-high/30 bg-highBg px-3 py-2 text-sm text-high">Loading live thermal events…</div>;
  }

  const direction = impact?.direction || "Calculating…";
  const confidence = impact?.confidence ?? "—";
  const zone = impact?.impact_zone_km2 != null ? `${impact.impact_zone_km2} km²` : "Calculating…";
  const weather = impact?.exposed?.weather || null;

  return (
    <div>
      <SectionHeader title="Potential fire impact / spread direction estimation"
        desc="An estimation of where a thermal event's impact could potentially move — never a guaranteed prediction."
        action={<AiTag />} />
      <div className="mb-5 rounded-lg border border-line bg-white p-4">
        <label className="block text-xs font-semibold text-ink" htmlFor="impact-event">Live thermal event</label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select id="impact-event" value={selId} onChange={(event) => setSelId(event.target.value)}
            className="min-w-[18rem] max-w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-[#C2410C]">
            {active.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.id} · {incident.frp} · {incident.confidence}% confidence
              </option>
            ))}
          </select>
          <span className="text-xs text-slateink">{active.length.toLocaleString()} live observations available</span>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="relative h-56 rounded-lg border border-line flex items-center justify-center bg-[#FAF6EE]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="34" fill="#FBEAE9" opacity="0.7" />
                  <circle cx="50" cy="50" r="22" fill="#FBEEE0" opacity="0.8" />
                  <circle cx="50" cy="50" r="10" fill="#FEF3C7" />
                  <circle cx="50" cy="50" r="4" fill="#B3261E" />
                  <line x1="50" y1="50" x2="76" y2="24" stroke="#C2410C" strokeWidth="1.8" markerEnd="url(#arrow)" />
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#C2410C" />
                    </marker>
                  </defs>
                  <text x="78" y="20" fontSize="6" fill="#C2410C" fontWeight="700">{direction}</text>
                </svg>
                <div className="absolute bottom-2 left-2 text-[10px] px-2 py-1 rounded bg-white/90 border border-line text-slateink">
                  {loadingImpact ? "Calculating live weather impact…" : `Wind → ${direction}`}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slateink">Estimated impact direction</div>
                  <div className="text-2xl font-semibold text-ink">{direction}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Analysis confidence" value={confidence === "—" ? confidence : `${confidence}%`} />
                  <Field label="Forecast horizon" value="Current weather snapshot" />
                  <Field label="Potential impact zone" value={zone} />
                  <Field label="Fire intensity (FRP)" value={sel.frp} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-5">
            <h3 className="font-semibold text-sm mb-3 text-ink">Analysis factors</h3>
            <div className="grid sm:grid-cols-2 gap-x-8">
              <Field label="Wind direction" value={direction} />
              <Field label="Wind speed" value={weather?.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : "Live weather unavailable"} />
              <Field label="Temperature" value={weather?.temperature_c != null ? `${weather.temperature_c}°C` : "Live weather unavailable"} />
              <Field label="Humidity" value={weather?.humidity_pct != null ? `${weather.humidity_pct}%` : "Live weather unavailable"} />
              <Field label="Terrain" value="Conservative terrain fallback" />
              <Field label="Land cover" value="Provider-derived context" />
            </div>
            {impactError && <p className="mt-3 text-xs text-critical">Live impact analysis unavailable: {impactError}</p>}
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <h3 className="font-semibold text-sm mb-3 text-ink">Impact zones</h3>
            {IMPACT_ZONE_RINGS.map((z) => (
              <div key={z.key} className="flex items-start gap-2.5 mb-3">
                <span className="h-3 w-3 rounded-full mt-0.5" style={{ background: z.color }} />
                <div>
                  <div className="text-sm font-medium text-ink">{z.label}</div>
                  <div className="text-xs text-slateink">{z.desc}</div>
                </div>
              </div>
            ))}
          </Card>
          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}

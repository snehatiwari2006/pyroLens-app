import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Compass, Wind, Thermometer, Droplets } from "lucide-react";
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
  const sel = incidents.find((i) => i.id === selId) || incidents[0];

  useEffect(() => {
    if (!selId) return;
    let cancelled = false;
    setLoadingImpact(true);
    setImpactError("");
    apiFetch(`/events/${selId}/impact`)
      .then((result) => {
        if (!cancelled) setImpact(result);
      })
      .catch((error) => {
        if (!cancelled) {
          setImpact(null);
          setImpactError(error.message || "Impact analysis is unavailable");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingImpact(false);
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

  const direction = impact?.direction || "Calculating…";
  const confidence = impact?.confidence ?? "—";
  const zone = impact?.impact_zone_km2 != null ? `${impact.impact_zone_km2} km²` : "Calculating…";
  const weather = impact?.exposed?.weather || null;

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Physics & Weather Simulation"
        title="Potential Fire Impact & Spread Estimation"
        desc="Multi-ring atmospheric propagation models estimating potential thermal spread directions based on live wind, humidity, and terrain slope."
        action={<AiTag />}
      />

      {/* Selector Container */}
      <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slateink" htmlFor="impact-event">
          Target Thermal Event
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select
            id="impact-event"
            value={selId}
            onChange={(event) => setSelId(event.target.value)}
            className="min-w-[18rem] max-w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15 shadow-xs transition-all"
          >
            {active.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.id} · {incident.frp} · {incident.confidence}% confidence ({incident.name})
              </option>
            ))}
          </select>
          <span className="text-xs font-medium text-slateink">
            {active.length.toLocaleString()} active observations monitored
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Vector Radar Card */}
        <div className="lg:col-span-2 space-y-5">
          <Card accent="orange" hoverLift={false}>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              
              {/* Concentric Spread Circles SVG */}
              <div className="relative h-60 rounded-xl border border-line flex items-center justify-center bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#FFF5EB] shadow-inner overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                  <circle cx="50" cy="50" r="36" fill="#FBEAE9" opacity="0.6" stroke="#B3261E" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
                  <circle cx="50" cy="50" r="24" fill="#FBEEE0" opacity="0.7" stroke="#C2410C" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="12" fill="#FEF3C7" opacity="0.9" stroke="#D97706" strokeWidth="0.6" />
                  <circle cx="50" cy="50" r="4.5" fill="#B3261E" className="animate-pulse" />
                  
                  {/* Direction Vector Arrow */}
                  <line x1="50" y1="50" x2="76" y2="24" stroke="#C2410C" strokeWidth="2.2" markerEnd="url(#arrow)" />
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#C2410C" />
                    </marker>
                  </defs>
                  <text x="78" y="20" fontSize="6.5" fill="#C2410C" fontWeight="800">
                    {direction}
                  </text>
                </svg>

                <div className="absolute bottom-2.5 left-2.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/95 border border-line text-ink shadow-xs flex items-center gap-1.5">
                  <Compass size={13} className="text-orange" />
                  <span>{loadingImpact ? "Estimating vector…" : `Bearing → ${direction}`}</span>
                </div>
              </div>

              {/* Vector Telemetry Summary */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slateink">
                    Estimated Spread Bearing
                  </div>
                  <div className="text-3xl font-extrabold text-ink mt-1 tracking-tight">{direction}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line/60">
                  <Field label="Model Certainty" value={confidence === "—" ? confidence : `${confidence}%`} />
                  <Field label="Horizon" value="Live Weather Snapshot" />
                  <Field label="Potential Footprint" value={zone} />
                  <Field label="Thermal FRP" value={sel.frp} />
                </div>
              </div>

            </div>
          </Card>

          {/* Analysis Factors Card */}
          <Card accent="blue" hoverLift={false}>
            <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Meteorological & Terrain Factors</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              <Field label="Wind Bearing" value={direction} />
              <Field
                label="Wind Velocity"
                value={weather?.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : "Live weather unavailable"}
              />
              <Field
                label="Ambient Temperature"
                value={weather?.temperature_c != null ? `${weather.temperature_c}°C` : "Live weather unavailable"}
              />
              <Field
                label="Relative Humidity"
                value={weather?.humidity_pct != null ? `${weather.humidity_pct}%` : "Live weather unavailable"}
              />
              <Field label="Topographic Slope" value="Conservative Digital Elevation Model" />
              <Field label="Surface Fuel / Land Cover" value="Provider-derived context layer" />
            </div>
            {impactError && (
              <p className="mt-4 rounded-lg bg-criticalBg border border-critical/30 p-2.5 text-xs text-critical">
                Live impact analysis unavailable: {impactError}
              </p>
            )}
          </Card>
        </div>

        {/* Impact Rings Sidebar */}
        <div className="space-y-5">
          <Card accent="critical" hoverLift={false}>
            <h3 className="font-bold text-sm text-ink mb-3 tracking-tight">Impact Footprint Rings</h3>
            <div className="space-y-3.5">
              {IMPACT_ZONE_RINGS.map((z) => (
                <div key={z.key} className="flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full mt-1 shrink-0" style={{ background: z.color }} />
                  <div>
                    <div className="text-xs font-bold text-ink">{z.label}</div>
                    <div className="text-xs text-slateink leading-relaxed mt-0.5">{z.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Disclaimer compact />
        </div>

      </div>
    </div>
  );
}

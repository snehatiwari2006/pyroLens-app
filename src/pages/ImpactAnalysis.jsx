import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { AiTag, Disclaimer } from "../components/AIInsightCard.jsx";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";

export default function ImpactAnalysis() {
  const { incidents } = useApp();
  const location = useLocation();
  const active = incidents.filter((i) => i.status !== "Resolved");
  const [selId, setSelId] = useState(location.state?.incidentId || active[0].id);
  const sel = incidents.find((i) => i.id === selId);

  return (
    <div>
      <SectionHeader title="Potential fire impact / spread direction estimation"
        desc="An estimation of where a thermal event's impact could potentially move — never a guaranteed prediction."
        action={<AiTag />} />
      <div className="flex flex-wrap gap-2 mb-5">
        {active.map((i) => (
          <button key={i.id} onClick={() => setSelId(i.id)} className="text-xs font-medium rounded-md px-2.5 py-1.5 border"
            style={{ borderColor: selId === i.id ? "#0F2A43" : "#DFE4E9", color: selId === i.id ? "#0F2A43" : "#5B6B7A", background: selId === i.id ? "#EEF2F6" : "#fff" }}>
            {i.id}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="relative h-56 rounded-lg border border-line flex items-center justify-center bg-[#EAF0F4]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="34" fill="#FBEAE9" opacity="0.7" />
                  <circle cx="50" cy="50" r="22" fill="#FBEEE0" opacity="0.8" />
                  <circle cx="50" cy="50" r="10" fill="#FBF3DC" />
                  <circle cx="50" cy="50" r="4" fill="#B3261E" />
                  <line x1="50" y1="50" x2="76" y2="24" stroke="#0F2A43" strokeWidth="1.6" markerEnd="url(#arrow)" />
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#0F2A43" />
                    </marker>
                  </defs>
                  <text x="78" y="20" fontSize="6" fill="#0F2A43" fontWeight="700">{sel.impactDirection}</text>
                </svg>
                <div className="absolute bottom-2 left-2 text-[10px] px-2 py-1 rounded bg-white/90 border border-line text-slateink">
                  Wind → {sel.windDir} at {sel.windSpeed}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slateink">Estimated impact direction</div>
                  <div className="text-2xl font-semibold text-ink">{sel.impactDirection}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Analysis confidence" value={`${sel.impactConfidence}%`} />
                  <Field label="Forecast horizon" value={sel.horizon} />
                  <Field label="Potential impact zone" value={sel.impactZone} />
                  <Field label="Fire intensity (FRP)" value={sel.frp} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-5">
            <h3 className="font-semibold text-sm mb-3 text-ink">Analysis factors</h3>
            <div className="grid sm:grid-cols-2 gap-x-8">
              <Field label="Wind direction" value={sel.windDir} />
              <Field label="Wind speed" value={sel.windSpeed} />
              <Field label="Temperature" value={sel.temp} />
              <Field label="Humidity" value={sel.humidity} />
              <Field label="Terrain" value="Flat industrial plain" />
              <Field label="Land cover" value="Mixed industrial / built-up" />
            </div>
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

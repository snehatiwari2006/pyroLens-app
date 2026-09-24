import React, { useState } from "react";
import { CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import { AiTag, Disclaimer } from "../components/AIInsightCard.jsx";

const CATEGORIES = [
  "Industrial Fire",
  "Vegetation Fire",
  "Agricultural Burning",
  "Persistent Thermal Source",
  "Possible False Positive",
  "Unknown Thermal Anomaly",
];

export default function Classification() {
  const { incidents } = useApp();
  const location = useLocation();
  const [selId, setSelId] = useState(location.state?.incidentId || incidents[0]?.id);
  const sel = incidents.find((i) => i.id === selId) || incidents[0] || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Machine Learning Engine"
        title="AI Source Classification"
        desc="Automated ML classification distinguishing genuine industrial flare and structure fires from agricultural burning, vegetation fires, and solar glints."
        action={<AiTag />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Incident Selector List */}
        <Card className="lg:col-span-1" padded={false} hoverLift={false}>
          <div className="p-4 border-b border-line/70 text-xs font-bold uppercase tracking-wider text-slateink flex items-center justify-between">
            <span>Select Observation</span>
            <span className="text-[11px] font-mono text-orange">{incidents.length} events</span>
          </div>
          <div className="max-h-[440px] overflow-y-auto divide-y divide-line/60">
            {incidents.map((i) => {
              const active = selId === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => setSelId(i.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors ${
                    active ? "bg-orange-50/80 border-l-[3px] border-orange" : "hover:bg-[#FAF7F2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-ink">{i.id}</span>
                    <span className="text-[11px] font-medium text-slateink">{i.frp}</span>
                  </div>
                  <div className="text-xs font-medium text-slateink mt-0.5 truncate">{i.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* AI Inference Cards */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Classification Result Card */}
          <Card accent="purple" hoverLift={false}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slateink">
                Predicted Source Classification
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                <Sparkles size={12} />
                <span>ViT Inference</span>
              </span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-ink mt-2 mb-4 tracking-tight">
              {sel.type || "Industrial Fire"}
            </div>
            
            <ConfidenceMeter value={sel.confidence || 85} label="Model Certainty Score" />

            {/* Category Badges Grid */}
            <div className="grid sm:grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-line/70">
              {CATEGORIES.map((cat) => {
                const match = cat === sel.type;
                return (
                  <div
                    key={cat}
                    className={`text-xs font-semibold rounded-xl px-3 py-2.5 border text-center transition-all ${
                      match
                        ? "border-orange bg-orange-50 text-orange shadow-xs ring-1 ring-orange/30"
                        : "border-line bg-[#FCFAF6] text-slateink"
                    }`}
                  >
                    {match && <span className="mr-1">✓</span>}
                    <span>{cat}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Supporting Evidence Card */}
          <Card accent="blue" hoverLift={false}>
            <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slateink">
              Multi-Spectral Supporting Indicators
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-ink">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-safe" />
                <span>
                  Fire radiative power of <strong className="text-ink">{sel.frp}</strong> indicates{" "}
                  {sel.riskScore > 70 ? "sustained high-intensity industrial combustion" : "moderate combustion signature"}.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-safe" />
                <span>
                  Industrial proximity of <strong className="text-ink">{sel.industrialProximity}</strong> significantly elevates industrial facility exposure.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-safe" />
                <span>
                  <strong className="text-ink">{sel.observations}</strong> repeated satellite passes since {sel.firstObserved} confirm persistent operational thermal signature.
                </span>
              </li>
            </ul>

            <div className="mt-5 rounded-xl p-3.5 text-xs text-ink/90 bg-[#FAF7F2] border border-line/80 leading-relaxed font-medium">
              💡 <strong>Ground Truth Correlation:</strong> High thermal intensity, continuous recurrence across orbital passes, and spatial intersection with industrial polygons suppress false-glint classification.
            </div>
          </Card>

          <Disclaimer />

        </div>

      </div>
    </div>
  );
}

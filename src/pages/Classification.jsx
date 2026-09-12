import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import { AiTag, Disclaimer } from "../components/AIInsightCard.jsx";

const CATEGORIES = ["Industrial Fire", "Vegetation Fire", "Agricultural Burning", "Persistent Thermal Source", "Possible False Positive", "Unknown Thermal Anomaly"];

export default function Classification() {
  const { incidents } = useApp();
  const location = useLocation();
  const [selId, setSelId] = useState(location.state?.incidentId || incidents[0].id);
  const sel = incidents.find((i) => i.id === selId);

  return (
    <div>
      <SectionHeader title="AI source classification"
        desc="Classifies each thermal event to help authorities distinguish genuine industrial fires from other thermal signatures."
        action={<AiTag />} />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1" padded={false}>
          <div className="p-4 border-b border-line text-xs font-semibold text-slateink">SELECT EVENT</div>
          <div className="max-h-[420px] overflow-y-auto divide-y divide-line">
            {incidents.map((i) => (
              <button key={i.id} onClick={() => setSelId(i.id)} className="w-full text-left px-4 py-3 hover:bg-[#FAF7F2]"
                style={{ background: selId === i.id ? "#FFF7ED" : "transparent", borderLeft: selId === i.id ? "3px solid #C2410C" : "3px solid transparent" }}>
                <div className="text-sm font-medium text-ink">{i.id}</div>
                <div className="text-xs text-slateink">{i.name}</div>
              </button>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="text-xs font-semibold mb-1 text-slateink">AI CLASSIFICATION</div>
            <div className="text-2xl font-semibold mb-3 text-ink">{sel.type}</div>
            <ConfidenceMeter value={sel.confidence} />
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="text-xs rounded-md px-2.5 py-2 border text-center"
                  style={{ borderColor: cat === sel.type ? "#C2410C" : "#E8E4DC", color: cat === sel.type ? "#9A3412" : "#5E6573", background: cat === sel.type ? "#FFF7ED" : "transparent" }}>
                  {cat}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="text-xs font-semibold mb-3 text-slateink">SUPPORTING INDICATORS</div>
            <ul className="space-y-2 text-sm text-ink">
              <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-safe" />Fire radiative power of {sel.frp} indicates {sel.riskScore > 70 ? "sustained high-intensity combustion" : "moderate combustion intensity"}.</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-safe" />Industrial proximity of {sel.industrialProximity} increases likelihood of an industrial source.</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-safe" />{sel.observations} repeated observations since {sel.firstObserved} suggest {sel.persistence.toLowerCase()} persistence.</li>
            </ul>
            <div className="mt-4 rounded-lg p-3 text-sm bg-paper text-ink">
              High thermal intensity, repeated observations and close proximity to industrial infrastructure increase the likelihood of this classification.
            </div>
          </Card>
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

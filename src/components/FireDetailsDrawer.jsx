import React from "react";
import { X, Factory, Building2, Route, Users, Hospital, ScanLine, Siren, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SeverityPill, StatusBadge } from "./StatusBadge.jsx";
import Field from "./Field.jsx";
import ExposureChip from "./ExposureCard.jsx";
import ConfidenceMeter from "./ConfidenceMeter.jsx";
import { Disclaimer } from "./AIInsightCard.jsx";

export default function FireDetailsDrawer({ incident, onClose, onIssueWarning }) {
  const navigate = useNavigate();
  if (!incident) return null;

  const goTo = (path) => {
    onClose();
    navigate(path, { state: { incidentId: incident.id } });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end animate-fadeIn">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Sheet */}
      <div className="relative w-full max-w-md h-full overflow-y-auto shadow-2xl bg-white border-l border-line z-10 flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-line bg-white/95 backdrop-blur-sm z-20">
            <div>
              <div className="text-[11px] font-mono font-bold text-orange tracking-wider">{incident.id}</div>
              <div className="font-bold text-base text-ink tracking-tight">{incident.name}</div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slateink hover:text-ink hover:bg-[#FAF7F2] transition-colors"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6">
            
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <SeverityPill level={incident.risk} />
              <StatusBadge status={incident.status} />
            </div>

            {/* Location & Detection */}
            <div className="p-4 rounded-xl border border-line/70 bg-[#FCFAF6]">
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3 text-slateink">
                Location & Satellite Telemetry
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Location" value={incident.location} />
                <Field label="Detection Time" value={incident.detectionTime} />
                <Field label="Satellite Feed" value={incident.satellite} />
                <Field label="AI Confidence" value={`${incident.confidence}%`} />
                <Field label="FRP (Intensity)" value={incident.frp} />
                <Field label="Brightness Temp." value={incident.brightness} />
              </div>
            </div>

            {/* AI Classification */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-slateink">
                AI Source Classification
              </div>
              <div className="rounded-xl p-4 border border-line bg-white shadow-xs">
                <div className="font-bold text-sm text-ink">{incident.type}</div>
                <div className="mt-2.5">
                  <ConfidenceMeter value={incident.confidence} />
                </div>
              </div>
            </div>

            {/* Thermal Persistence */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-slateink">
                Thermal Persistence
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-xl border border-line/70 bg-[#FCFAF6]">
                <Field label="Persistence State" value={incident.persistence} />
                <Field label="Recurrence Count" value={incident.observations} />
                <Field label="First Observed" value={incident.firstObserved} />
                <Field label="Last Observed" value={incident.lastObserved} />
                <div className="col-span-2">
                  <Field label="Industrial Proximity" value={incident.industrialProximity} />
                </div>
              </div>
            </div>

            {/* Estimated Impact */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-slateink">
                Estimated Impact Modeling
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-xl border border-line/70 bg-[#FCFAF6]">
                <Field label="Impact Direction" value={incident.impactDirection} />
                <Field label="Estimated Zone" value={incident.impactZone} />
                <Field label="Model Confidence" value={`${incident.impactConfidence}%`} />
                <Field label="Forecast Horizon" value={incident.horizon} />
              </div>
            </div>

            {/* Potentially Exposed */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5 text-slateink">
                Potentially Exposed Assets
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <ExposureChip icon={Factory} value={incident.exposure.industrial} label="Industrial" />
                <ExposureChip icon={Building2} value={incident.exposure.buildings} label="Buildings" />
                <ExposureChip icon={Route} value={incident.exposure.roads} label="Roads" />
                <ExposureChip icon={Users} value={incident.exposure.population} label="Population" />
                <ExposureChip icon={Hospital} value={incident.exposure.critical} label="Critical Infra" />
                <ExposureChip icon={ScanLine} value={incident.exposure.environment} label="Environment" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button onClick={() => goTo("/impact")} className="btn-secondary text-xs py-2.5">
                Analyze Impact
              </button>
              <button onClick={() => goTo("/decision-support")} className="btn-secondary text-xs py-2.5">
                Decision Support
              </button>
              <button
                onClick={() => onIssueWarning(incident)}
                className="btn-primary col-span-2 py-3 text-xs flex items-center justify-center gap-2 shadow-md shadow-orange/20"
              >
                <Siren size={16} />
                <span>Issue Authority Warning</span>
              </button>
            </div>

            <Disclaimer compact />
          </div>

        </div>

      </div>
    </div>
  );
}

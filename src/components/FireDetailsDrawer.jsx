import React from "react";
import { X, Factory, Building2, Route, Users, Hospital, ScanLine, Siren } from "lucide-react";
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
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full overflow-y-auto shadow-xl bg-white">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-line bg-white">
          <div>
            <div className="text-xs text-slateink">{incident.id}</div>
            <div className="font-semibold text-ink">{incident.name}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <SeverityPill level={incident.risk} />
            <StatusBadge status={incident.status} />
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 text-slateink">LOCATION & DETECTION</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Location" value={incident.location} />
              <Field label="Detection time" value={incident.detectionTime} />
              <Field label="Satellite source" value={incident.satellite} />
              <Field label="Confidence" value={`${incident.confidence}%`} />
              <Field label="FRP" value={incident.frp} />
              <Field label="Brightness temp." value={incident.brightness} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 text-slateink">AI CLASSIFICATION</div>
            <div className="rounded-lg p-3 border border-line bg-paper">
              <div className="font-semibold text-sm text-ink">{incident.type}</div>
              <div className="mt-2"><ConfidenceMeter value={incident.confidence} /></div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 text-slateink">THERMAL PERSISTENCE</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Persistence" value={incident.persistence} />
              <Field label="Observations" value={incident.observations} />
              <Field label="First observed" value={incident.firstObserved} />
              <Field label="Last observed" value={incident.lastObserved} />
              <Field label="Industrial proximity" value={incident.industrialProximity} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 text-slateink">ESTIMATED IMPACT</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Impact direction" value={incident.impactDirection} />
              <Field label="Potential impact zone" value={incident.impactZone} />
              <Field label="Analysis confidence" value={`${incident.impactConfidence}%`} />
              <Field label="Forecast horizon" value={incident.horizon} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 text-slateink">POTENTIALLY EXPOSED</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <ExposureChip icon={Factory} value={incident.exposure.industrial} label="Industrial" />
              <ExposureChip icon={Building2} value={incident.exposure.buildings} label="Buildings" />
              <ExposureChip icon={Route} value={incident.exposure.roads} label="Roads" />
              <ExposureChip icon={Users} value={incident.exposure.population} label="Population" />
              <ExposureChip icon={Hospital} value={incident.exposure.critical} label="Critical infra" />
              <ExposureChip icon={ScanLine} value={incident.exposure.environment} label="Environment" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => goTo("/impact")} className="btn-secondary">Analyze impact</button>
            <button onClick={() => goTo("/decision-support")} className="btn-secondary">Decision support</button>
            <button onClick={() => onIssueWarning(incident)} className="btn-primary col-span-2">
              <Siren size={15} /> Issue warning
            </button>
          </div>
          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}

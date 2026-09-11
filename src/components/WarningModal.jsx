import React from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { SeverityPill } from "./StatusBadge.jsx";
import Field from "./Field.jsx";

export default function WarningModal({ incident, onClose, onConfirm, confirmed }) {
  if (!incident) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl shadow-xl bg-white">
        {!confirmed ? (
          <>
            <div className="p-5 border-b border-line">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-critical" />
                <h3 className="font-semibold text-ink">
                  Issue warning — {incident.risk === "CRITICAL" ? "high-risk fire event" : "fire event"}
                </h3>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <Field label="Location" value={incident.location} />
              <Field label="Estimated impact direction" value={incident.impactDirection} />
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slateink">Risk</span>
                <SeverityPill level={incident.risk} size="sm" />
              </div>
              <div>
                <div className="text-[11px] mb-1 text-slateink">Potentially exposed</div>
                <ul className="list-disc pl-5 text-sm text-ink">
                  <li>{incident.exposure.buildings} buildings within estimated impact zone</li>
                  <li>{incident.exposure.industrial} nearby industrial facilities</li>
                  <li>~{incident.exposure.population.toLocaleString()} population potentially at risk</li>
                </ul>
              </div>
              <div className="rounded-lg p-3 bg-paper">
                <div className="text-[11px] font-semibold mb-0.5 text-slateink">Recommended action</div>
                <div className="text-sm text-ink">Issue warning to potentially affected zones and initiate human verification.</div>
              </div>
              <p className="text-xs text-slateink">This is a frontend simulation. No real warning, SMS, or call will be sent.</p>
            </div>
            <div className="p-5 pt-0 flex gap-2 justify-end">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={onConfirm} className="btn-primary">Confirm warning</button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-safeBg">
              <CheckCircle2 size={26} className="text-safe" />
            </div>
            <h3 className="font-semibold text-lg text-ink">Warning workflow initiated</h3>
            <p className="text-sm mt-1 text-slateink">Status updated to <strong>Warning Issued</strong> for {incident.id}.</p>
            <button onClick={onClose} className="btn-primary mt-5 mx-auto">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { SeverityPill } from "./StatusBadge.jsx";
import Field from "./Field.jsx";

export default function WarningModal({ incident, onClose, onConfirm, confirmed }) {
  if (!incident) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white border border-line overflow-hidden z-10">
        {!confirmed ? (
          <>
            <div className="p-6 border-b border-line bg-gradient-to-r from-orange-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-rose-600 border border-red-200 flex items-center justify-center shrink-0">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink tracking-tight">
                    Authorize Emergency Warning
                  </h3>
                  <div className="text-xs text-slateink font-mono mt-0.5">
                    Target: {incident.id} · {incident.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-line/70 bg-[#FCFAF6] space-y-2.5">
                <Field label="Target Location" value={incident.location} />
                <Field label="Estimated Spread Bearing" value={incident.impactDirection} />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slateink">Threat Classification:</span>
                  <SeverityPill level={incident.risk} size="sm" />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-slateink">
                  Potentially Exposed Assets
                </div>
                <ul className="list-disc pl-5 text-xs text-ink space-y-1 font-medium">
                  <li>{incident.exposure?.buildings || 0} structures within perimeter footprint</li>
                  <li>{incident.exposure?.industrial || 0} nearby industrial assets</li>
                  <li>~{(incident.exposure?.population || 0).toLocaleString()} residents potentially at risk</li>
                </ul>
              </div>

              <div className="rounded-xl p-3.5 bg-orange-50 border border-orange-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1 text-orange">
                  Recommended SOP Directive
                </div>
                <div className="text-xs text-ink leading-relaxed font-medium">
                  Issue urgent notification to district civil protection and dispatch nearest fire suppression asset.
                </div>
              </div>

              <p className="text-[11px] text-slateink italic">
                * Operational simulation mode: Updates local status to "Warning Issued".
              </p>
            </div>

            <div className="p-6 pt-0 flex gap-3 justify-end border-t border-line/60 bg-[#FCFAF6]">
              <button onClick={onClose} className="btn-secondary !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="btn-primary !py-2 !px-4 text-xs font-bold shadow-sm shadow-orange/30"
              >
                Confirm & Dispatch Warning
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="font-bold text-lg text-ink tracking-tight">Warning Directive Dispatched</h3>
            <p className="text-xs text-slateink mt-2 leading-relaxed">
              Official status updated to <strong className="text-ink font-semibold">Warning Issued</strong> for{" "}
              <span className="font-mono text-orange font-bold">{incident.id}</span>. Operational logging complete.
            </p>
            <button onClick={onClose} className="btn-primary mt-6 mx-auto px-6 py-2.5 text-xs font-bold">
              Return to Workstation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

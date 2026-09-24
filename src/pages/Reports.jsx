import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Share2, Printer, FileText } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";

export default function Reports() {
  const { incidents } = useApp();
  const location = useLocation();
  const [selId, setSelId] = useState(location.state?.incidentId || incidents[0]?.id);
  const sel = incidents.find((i) => i.id === selId) || incidents[0] || {};

  return (
    <div className="reports-atlas space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Audit & Compliance"
        title="Incident Briefing Reports"
        desc="Generate and export structured emergency briefings and technical summaries for district disaster management committees."
        action={
          <div className="flex gap-2">
            <a
              href="/api/v1/reports/incidents.csv"
              className="btn-secondary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </a>
            <button
              onClick={() => window.print()}
              className="btn-secondary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print Briefing</span>
            </button>
          </div>
        }
      />

      {/* Observation Selector */}
      <div className="flex flex-wrap gap-2">
        {incidents.map((i) => {
          const active = selId === i.id;
          return (
            <button
              key={i.id}
              onClick={() => setSelId(i.id)}
              className={`text-xs font-mono font-bold rounded-xl px-3 py-2 border transition-all ${
                active
                  ? "border-orange bg-orange-50 text-orange shadow-xs ring-1 ring-orange/30 font-extrabold"
                  : "border-line bg-white text-slateink hover:bg-[#FAF7F2] hover:text-ink"
              }`}
            >
              {i.id}
            </button>
          );
        })}
      </div>

      {/* Official Incident Dossier Card */}
      <Card accent="blue" hoverLift={false}>
        <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slateink">Official Incident Dossier · {sel.id}</div>
              <div className="text-lg font-bold text-ink tracking-tight">{sel.name}</div>
            </div>
          </div>
          <SeverityPill level={sel.risk} />
        </div>

        <div className="h-28 rounded-xl border border-[#1D78D6]/20 flex items-center justify-center mb-6 text-xs bg-[linear-gradient(112deg,#EDF8FF,#FFFDF8_52%,#FFF1E4)] text-slateink font-medium shadow-inner">
          🗺️ Operational geospatial map snapshot available via the Fire Intelligence Map workstation.
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6 p-5 rounded-xl border border-line/70 bg-[#FCFAF6]">
          <Field label="Location / Coordinates" value={sel.location} />
          <Field label="Detection Timestamp" value={sel.detectionTime} />
          <Field label="AI Classification" value={sel.type} />
          <Field label="Inference Certainty" value={`${sel.confidence}%`} />
          <Field label="FRP (Radiative Intensity)" value={sel.frp} />
          <Field label="Thermal Persistence State" value={sel.persistence} />
          <Field
            label="Environmental Conditions"
            value={`${sel.temp || "28°C"}, ${sel.humidity || "42%"} humidity, wind ${sel.windDir || "NE"} ${sel.windSpeed || "14 km/h"}`}
          />
          <Field
            label="Nearby Industrial Assets"
            value={`${sel.exposure?.industrial || 0} industrial, ${sel.exposure?.critical || 0} critical facilities`}
          />
          <Field label="Composite Threat Index" value={`${sel.riskScore || 0} / 100 — ${sel.risk}`} />
          <Field label="Estimated Spread Bearing" value={sel.impactDirection} />
          <Field
            label="Estimated Asset Footprint"
            value={`${sel.exposure?.buildings || 0} buildings, ~${(sel.exposure?.population || 0).toLocaleString()} residents`}
          />
          <Field label="Operational Directive Status" value={sel.status} />
        </div>

        <div className="rounded-xl p-4 mb-5 text-xs sm:text-sm bg-[#FAF7F2] border border-line/80">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-slateink">
            Recommended Action Procedures
          </div>
          <div className="text-ink font-medium leading-relaxed">
            Initiate ground UAV confirmation, prioritize continuous sensor tracking across {sel.location}, and maintain precautionary notification protocols for industrial infrastructure perimeters.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-4 border-t border-line text-slateink">
          <span>Data feeds: NASA FIRMS (VIIRS/MODIS) · OpenStreetMap · Open-Meteo</span>
          <span className="font-mono text-[11px]">Audit Timestamp: {new Date().toLocaleDateString()}</span>
        </div>
      </Card>
    </div>
  );
}

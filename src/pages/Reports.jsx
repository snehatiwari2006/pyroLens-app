import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Share2 } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";

export default function Reports() {
  const { incidents } = useApp();
  const location = useLocation();
  const [selId, setSelId] = useState(location.state?.incidentId || incidents[0].id);
  const sel = incidents.find((i) => i.id === selId);

  return (
    <div>
      <SectionHeader title="Incident reports" desc="Generate a structured summary of an incident for briefings and records."
        action={
          <div className="flex gap-2">
            <button className="btn-secondary !py-1.5 !px-3 text-xs"><Download size={13} />Download PDF</button>
            <button className="btn-secondary !py-1.5 !px-3 text-xs"><Share2 size={13} />Share</button>
          </div>
        } />
      <div className="flex flex-wrap gap-2 mb-5">
        {incidents.map((i) => (
          <button key={i.id} onClick={() => setSelId(i.id)} className="text-xs font-medium rounded-md px-2.5 py-1.5 border"
            style={{ borderColor: selId === i.id ? "#0F2A43" : "#DFE4E9", color: selId === i.id ? "#0F2A43" : "#5B6B7A", background: selId === i.id ? "#EEF2F6" : "#fff" }}>
            {i.id}
          </button>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <div>
            <div className="text-xs text-slateink">Incident report · {sel.id}</div>
            <div className="text-lg font-semibold text-ink">{sel.name}</div>
          </div>
          <SeverityPill level={sel.risk} />
        </div>
        <div className="h-40 rounded-lg border border-line flex items-center justify-center mb-5 text-xs bg-[#EAF0F4] text-slateink">
          Map snapshot placeholder
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-5">
          <Field label="Location" value={sel.location} />
          <Field label="Detection time" value={sel.detectionTime} />
          <Field label="AI classification" value={sel.type} />
          <Field label="Confidence" value={`${sel.confidence}%`} />
          <Field label="FRP" value={sel.frp} />
          <Field label="Thermal persistence" value={sel.persistence} />
          <Field label="Environmental conditions" value={`${sel.temp}, ${sel.humidity} humidity, wind ${sel.windDir} ${sel.windSpeed}`} />
          <Field label="Nearby infrastructure" value={`${sel.exposure.industrial} industrial, ${sel.exposure.critical} critical facilities`} />
          <Field label="Risk score" value={`${sel.riskScore} / 100 — ${sel.risk}`} />
          <Field label="Potential impact direction" value={sel.impactDirection} />
          <Field label="Potential exposure" value={`${sel.exposure.buildings} buildings, ~${sel.exposure.population.toLocaleString()} population`} />
          <Field label="Warning status" value={sel.status} />
        </div>
        <div className="rounded-lg p-3 mb-4 text-sm bg-paper">
          <div className="text-xs font-semibold mb-1 text-slateink">RECOMMENDED ACTIONS</div>
          <div className="text-ink">Initiate human verification, prioritize monitoring, and prepare warning workflow for potentially affected zones.</div>
        </div>
        <div className="flex justify-between text-xs pt-4 border-t border-line text-slateink">
          <span>Data sources: NASA FIRMS (mock), OSM (mock), Weather service (mock)</span>
          <span>Generated {new Date().toLocaleString()}</span>
        </div>
      </Card>
    </div>
  );
}

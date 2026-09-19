import React, { useEffect, useState } from "react";
import { Factory, Hospital, School, Building2, Route, TowerControl, TrainFront, ShieldCheck } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { getInfrastructureLayers } from "../services/osmService.js";

const ICONS = { industries: Factory, hospitals: Hospital, schools: School, residential: Building2, roads: Route, fireStations: TowerControl, railway: TrainFront, criticalInfrastructure: ShieldCheck };
const LABELS = { industries: "Industries", hospitals: "Hospitals", schools: "Schools", residential: "Residential areas", roads: "Roads", fireStations: "Fire stations", railway: "Railway", criticalInfrastructure: "Critical infrastructure" };

export default function OsmIntelligence() {
  const [infra, setInfra] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getInfrastructureLayers().then(setInfra).catch((loadError) => setError(loadError.message)); }, []);
  if (!infra) return <div className="rounded-md border border-high/30 bg-highBg px-3 py-2 text-sm text-high">{error ? `Live OSM service unavailable: ${error}` : "Loading OSM intelligence layers…"}</div>;

  return (
    <div>
      <SectionHeader title="OSM intelligence" desc={`Live Central Africa infrastructure layers used for exposure and risk assessment. Source: ${infra.source}.`} />
      {infra.error && <div className="mb-4 rounded-md border border-high/30 bg-highBg px-3 py-2 text-xs text-high">Live OSM data is temporarily unavailable: {infra.error}. No estimated infrastructure counts are shown.</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(infra.counts).map(([key, count]) => {
          const Icon = ICONS[key] || Building2;
          return (
            <Card key={key}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#F5F1EB]"><Icon size={18} className="text-ink" /></div>
                <div><div className="text-xl font-semibold text-ink">{count}</div><div className="text-xs text-slateink">{LABELS[key]}</div></div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <h3 className="font-semibold text-sm mb-2 text-ink">How this feeds intelligence</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm mt-3">
          <div className="rounded-lg p-3 bg-paper">
            <div className="font-medium mb-1 text-ink">Exposure analysis</div>
            <p className="text-xs text-slateink">Nearby buildings, roads and population are matched against the estimated impact zone.</p>
          </div>
          <div className="rounded-lg p-3 bg-paper">
            <div className="font-medium mb-1 text-ink">Risk assessment</div>
            <p className="text-xs text-slateink">Industrial density and critical infrastructure proximity raise the explainable risk score.</p>
          </div>
          <div className="rounded-lg p-3 bg-paper">
            <div className="font-medium mb-1 text-ink">Impact assessment</div>
            <p className="text-xs text-slateink">Road and rail layers inform accessibility for emergency response teams.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

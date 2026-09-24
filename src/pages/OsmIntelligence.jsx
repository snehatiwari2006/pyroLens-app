import React, { useEffect, useState } from "react";
import { Factory, Hospital, School, Building2, Route, TowerControl, TrainFront, ShieldCheck } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { getInfrastructureLayers } from "../services/osmService.js";

const ICONS = {
  industries: Factory,
  hospitals: Hospital,
  schools: School,
  residential: Building2,
  roads: Route,
  fireStations: TowerControl,
  railway: TrainFront,
  criticalInfrastructure: ShieldCheck,
};

const LABELS = {
  industries: "Industrial Sites",
  hospitals: "Hospitals & Clinics",
  schools: "Educational Facilities",
  residential: "Residential Zones",
  roads: "Transportation Corridors",
  fireStations: "Fire & Rescue Stations",
  railway: "Railway Lines",
  criticalInfrastructure: "Critical Infrastructure",
};

const ACCENTS = {
  industries: "orange",
  hospitals: "critical",
  schools: "amber",
  residential: "blue",
  roads: "teal",
  fireStations: "critical",
  railway: "navy",
  criticalInfrastructure: "safe",
};

export default function OsmIntelligence() {
  const [infra, setInfra] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInfrastructureLayers()
      .then(setInfra)
      .catch((loadError) => setError(loadError.message));
  }, []);

  if (!infra) {
    return (
      <div className="rounded-xl border border-high/30 bg-highBg p-4 text-sm text-high font-medium">
        {error ? `Live OSM service unavailable: ${error}` : "Loading OSM spatial intelligence layers…"}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="OpenStreetMap Geospatial Layers"
        title="OSM Spatial Intelligence"
        desc={`Live spatial infrastructure polygons and vector assets used for automated exposure and risk assessment. Source: ${infra.source}.`}
      />

      {infra.error && (
        <div className="rounded-xl border border-high/30 bg-highBg p-4 text-xs text-high">
          Live OSM data is temporarily unavailable: {infra.error}.
        </div>
      )}

      {/* Infrastructure Counts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Object.entries(infra.counts).map(([key, count]) => {
          const Icon = ICONS[key] || Building2;
          const accent = ACCENTS[key] || "blue";
          return (
            <Card key={key} accent={accent} hoverLift={true}>
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border border-line/80 bg-[#FCFAF6] text-ink">
                  <Icon size={19} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-ink tracking-tight">{count}</div>
                  <div className="text-xs font-medium text-slateink mt-0.5">{LABELS[key] || key}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Downstream Intelligence Integration */}
      <Card accent="orange" hoverLift={false}>
        <h3 className="font-bold text-sm text-ink mb-2 tracking-tight">Downstream Risk Intelligence Pipeline</h3>
        <p className="text-xs text-slateink mb-4">How OSM vector layers directly feed our spatial exposure models:</p>
        
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl p-4 bg-[#FCFAF6] border border-line/70">
            <div className="font-bold text-xs uppercase tracking-wider mb-1 text-orange">01. Exposure Modeling</div>
            <p className="text-xs text-slateink leading-relaxed">
              Nearby structures, transportation corridors, and residential density are intersected with the estimated thermal footprint.
            </p>
          </div>

          <div className="rounded-xl p-4 bg-[#FCFAF6] border border-line/70">
            <div className="font-bold text-xs uppercase tracking-wider mb-1 text-rose-600">02. Threat Index Weighting</div>
            <p className="text-xs text-slateink leading-relaxed">
              Industrial density and proximity to chemical storage raise the composite risk score to trigger early warning protocols.
            </p>
          </div>

          <div className="rounded-xl p-4 bg-[#FCFAF6] border border-line/70">
            <div className="font-bold text-xs uppercase tracking-wider mb-1 text-blue-600">03. Route Optimization</div>
            <p className="text-xs text-slateink leading-relaxed">
              Road and rail vectors inform ground accessibility for rapid response units avoiding active hazard perimeters.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

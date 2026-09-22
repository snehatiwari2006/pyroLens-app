export type ThermalClass = "Industrial Heat" | "New Source" | "Likely Fire" | "Artifact";

export interface ShapReason {
  feature: string;
  label: string;
  value: number;
  contribution: number;
  text: string;
}

export interface Explanation {
  event_id?: string;
  classification?: string;
  label: string;
  headline: string;
  method: string;
  model_version?: string;
  confidence?: number;
  reasons: ShapReason[];
  summary: string[];
  probabilities: Record<string, number>;
}

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  brightness_temp: number;
  confidence: number;
  frp_mw: number;
  persistence_count: number;
  persistence_score: number;
  timestamp: string;
  source: string;
  risk_score: number;
  risk_level: string;
  status: string;
  location: string;
  classification: ThermalClass | string;
  class_confidence: number;
  probabilities: Record<string, number>;
  model_version: string;
  color: string;
  explanation: Explanation;
}

export interface HotspotResponse {
  count: number;
  hotspots: Hotspot[];
  geojson: GeoJSON.FeatureCollection;
  classes: string[];
}

export interface SpreadResponse {
  origin: { lat: number; lon: number };
  weather: Record<string, unknown>;
  hours: number;
  geojson: GeoJSON.FeatureCollection;
  impact_zone_km2: number;
  model: string;
}

export interface ImpactResponse {
  event_id?: string | null;
  name?: string | null;
  origin: { lat: number; lon: number };
  buffer_km: number;
  assumptions: string[];
  metrics: {
    population_at_risk: number;
    buildings: number;
    roads: number;
    critical_infrastructure: number;
    hospitals: number;
    schools: number;
    fire_stations: number;
    industrial_sites: number;
  };
  industry: Record<string, unknown>;
  weather: Record<string, unknown>;
  spread: {
    impact_zone_km2: number;
    geojson: GeoJSON.FeatureCollection;
    model: string;
  };
  source?: string;
}

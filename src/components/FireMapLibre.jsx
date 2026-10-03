import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SEV_STYLE } from "./theme.js";
import { IMPACT_ZONE_RINGS } from "../data/impactData.js";

const MAX_RENDERED_HOTSPOTS = 600;

function priorityScore(incident) {
  const frp = Number.parseFloat(incident.frp) || 0;
  return (Number(incident.riskScore) || 0) * 1000 + (Number(incident.confidence) || 0) * 10 + frp;
}

export default function FireMapLibre({ incidents, layers, onSelect, selectedId, showImpact, height = 480 }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const selected = incidents.find((i) => i.id === selectedId);
  
  // Filter and sort incidents by priority
  const visibleIncidents = [...incidents]
    .sort((left, right) => priorityScore(right) - priorityScore(left))
    .slice(0, MAX_RENDERED_HOTSPOTS);
  if (selected && !visibleIncidents.some((incident) => incident.id === selected.id)) {
    visibleIncidents.push(selected);
  }

  // Center on selected incident or default to Africa pilot area
  const center = selected ? [selected.lng, selected.lat] : [27.0, -11.5];

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm": {
            type: "raster",
            tiles: ["https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center,
      zoom: 12,
      scrollWheelZoom: true,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");

    map.current.on("load", () => {
      setMapLoaded(true);
      addLayers();
    });

    return () => {
      map.current.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Add/update layers when data changes
  const addLayers = () => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;

    // Clear existing custom layers
    const layerIds = ["thermal-events", "persistence", "impact-zones", "satellite-imagery"];
    layerIds.forEach((id) => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
      if (mapInstance.getSource(id)) mapInstance.removeSource(id);
    });

    // Add satellite imagery layer
    if (layers.satellite) {
      const imageryDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      mapInstance.addSource("satellite-imagery", {
        type: "raster",
        tiles: [`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${imageryDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`],
        tileSize: 256,
        attribution: "NASA GIBS",
        maxzoom: 9,
      });
      mapInstance.addLayer({
        id: "satellite-imagery",
        type: "raster",
        source: "satellite-imagery",
        paint: { "raster-opacity": 0.88 },
      }, "osm");
    }

    // Add impact zone rings
    if (showImpact && selected) {
      IMPACT_ZONE_RINGS.forEach((ring) => {
        const sourceId = `impact-${ring.key}`;
        const layerId = `impact-${ring.key}`;
        
        mapInstance.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [selected.lng, selected.lat],
            },
          },
        });
        
        // Create circle using turf-like approach - we'll use a circle layer with radius
        mapInstance.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": {
              stops: [
                [0, 0],
                [12, ring.radiusKm * 1000 / 2], // approximate at zoom 12
                [22, ring.radiusKm * 1000 * 10], // at max zoom
              ],
              base: 1.5,
            },
            "circle-color": ring.color,
            "circle-opacity": ring.opacity,
            "circle-stroke-color": ring.color,
            "circle-stroke-width": 1,
            "circle-stroke-opacity": 1,
          },
        });
      });
    }

    // Add persistence circles
    if (layers.thermal) {
      const persistenceIncidents = visibleIncidents.filter((i) => i.persistenceScore > 60);
      if (persistenceIncidents.length > 0) {
        mapInstance.addSource("persistence", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: persistenceIncidents.map((i) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [i.lng, i.lat] },
              properties: { id: i.id },
            })),
          },
        });
        mapInstance.addLayer({
          id: "persistence",
          type: "circle",
          source: "persistence",
          paint: {
            "circle-radius": 7,
            "circle-color": "#D97706",
            "circle-opacity": 0,
            "circle-stroke-color": "#D97706",
            "circle-stroke-width": 1.5,
            "circle-stroke-dasharray": [4, 4],
          },
        });
      }
    }

    // Add thermal events as circles with click handlers
    if (layers.thermalEvents && visibleIncidents.length > 0) {
      mapInstance.addSource("thermal-events", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: visibleIncidents.map((i) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [i.lng, i.lat] },
            properties: {
              id: i.id,
              name: i.name,
              frp: i.frp,
              confidence: i.confidence,
              risk: i.risk,
              riskScore: i.riskScore,
              impactDirection: i.impactDirection,
              location: i.location,
            },
          })),
        },
      });

      mapInstance.addLayer({
        id: "thermal-events",
        type: "circle",
        source: "thermal-events",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 4,
            12, 8,
            16, 12,
            22, 18,
          ],
          "circle-color": [
            "match",
            ["get", "risk"],
            "CRITICAL", "#B3261E",
            "HIGH", "#C2410C",
            "MEDIUM", "#B45309",
            "MODERATE", "#B45309",
            "LOW", "#1E7A4C",
            "MONITORING", "#92400E",
            "RESOLVED", "#1E7A4C",
            "#B3261E", // default
          ],
          "circle-opacity": 0.95,
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });

      // Add click handler for thermal events
      mapInstance.on("click", "thermal-events", (e) => {
        const feature = e.features[0];
        if (feature && onSelect) {
          onSelect(feature.properties.id);
        }
      });

      // Change cursor on hover
      mapInstance.on("mouseenter", "thermal-events", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", "thermal-events", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    }
  };

  // Update layers when props change
  useEffect(() => {
    if (mapLoaded) addLayers();
  }, [layers, showImpact, selectedId, incidents, mapLoaded]);

  // Pan to selected incident
  useEffect(() => {
    if (map.current && selected) {
      map.current.flyTo({ center: [selected.lng, selected.lat], zoom: 13, duration: 1000 });
    }
  }, [selected]);

  return (
    <div className="rounded-lg overflow-hidden border border-line" style={{ height }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <div className="text-sm text-slateink">Loading MapLibre map…</div>
        </div>
      )}
    </div>
  );
}
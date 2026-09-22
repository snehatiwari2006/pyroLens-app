"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hotspot } from "../lib/types";

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

interface MapProps {
  hotspots: Hotspot[];
  spread?: GeoJSON.FeatureCollection | null;
  selectedId?: string | null;
  onSelect: (hotspot: Hotspot) => void;
}

export default function Map({ hotspots, spread, selectedId, onSelect }: MapProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLE,
      center: [27, -11.5],
      zoom: 5.4,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => {
      map.addSource("spread", { type: "geojson", data: emptyCollection() });
      map.addLayer({
        id: "spread-fill",
        type: "fill",
        source: "spread",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "fill-color": "#f97316", "fill-opacity": 0.28 },
      });
      map.addLayer({
        id: "spread-line",
        type: "line",
        source: "spread",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "line-color": "#ea580c", "line-width": 2 },
      });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = hotspots.map((hotspot) => {
      const element = document.createElement("button");
      element.type = "button";
      element.title = `${hotspot.classification}: ${hotspot.name}`;
      element.style.cssText = [
        "width:14px",
        "height:14px",
        "border-radius:999px",
        `background:${hotspot.color}`,
        "border:2px solid #fff",
        `box-shadow:0 0 0 ${hotspot.id === selectedId ? "4px" : "1px"} rgba(15,23,42,0.35)`,
        "cursor:pointer",
      ].join(";");
      element.addEventListener("click", () => onSelectRef.current(hotspot));
      return new maplibregl.Marker({ element }).setLngLat([hotspot.lon, hotspot.lat]).addTo(map);
    });
    if (hotspots.length) {
      const bounds = new maplibregl.LngLatBounds();
      hotspots.forEach((hotspot) => bounds.extend([hotspot.lon, hotspot.lat]));
      map.fitBounds(bounds, { padding: 48, maxZoom: 9, duration: 400 });
    }
  }, [hotspots, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getSource("spread")) return;
    (map.getSource("spread") as GeoJSONSource).setData(spread || emptyCollection());
  }, [spread]);

  return <div ref={container} className="h-full w-full min-h-[480px]" />;
}

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

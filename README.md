# PyroLens — Industrial Fire & Impact Intelligence Platform

Frontend-only SIH prototype: AI-based detection and classification of
industrial fires and persistent thermal sources, built with React, Vite,
Tailwind CSS, React Router, React Leaflet and Recharts. All data is
simulated — there is no backend, database, or real satellite/GIS
integration. The `src/services/` layer is written so those can be added
later without touching any page or component.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  data/          Mock datasets (incidents, industries, infrastructure, alerts,
                  thermal sources, analytics, response teams, monitoring zones)
  services/      Backend-ready service wrappers (firmsService, osmService,
                  weatherService, fireIntelligenceService, impactService,
                  riskService) — each currently returns mock data via a
                  simulated network delay, structured so a real API call
                  can be swapped in later without changing any page.
  context/       AppContext — shared incident state, warning workflow,
                  incident details drawer.
  components/    Reusable UI: Header/nav, map (React Leaflet), cards,
                  badges, risk dial, exposure chips, drawer, warning modal.
  pages/         One file per route (Home, Dashboard, Fire Intelligence Map,
                  AI Classification, Thermal Persistence, Impact Analysis,
                  Infrastructure Exposure, Decision Support, Fire Analytics,
                  Hotspot Analysis, Satellite Data Centre, OSM Intelligence,
                  Area Monitoring, Alerts & Warnings, Incidents, Emergency
                  Response, Reports, Demo Mode, Settings).
```

## Notes for judges / future backend integration

- Replace the bodies of functions in `src/services/*.js` with real calls to
  NASA FIRMS, Overpass/OSM, a weather API, and an AI/ML inference backend.
  Every page already calls through this layer (or reads from `src/data`),
  so swapping the implementation doesn't require touching the UI.
- The map (`src/components/FireMap.jsx`) uses `react-leaflet` with public
  OpenStreetMap tiles; swap the `TileLayer` URL for a GIS/satellite basemap
  when one is available.
- All "impact" and "exposure" language is intentionally phrased as an
  estimate ("potential", "potentially exposed") per the project brief —
  keep that phrasing if you extend these pages.
- The warning workflow (`WarningModal` + `AppContext.issueWarning`) is a
  frontend simulation only; no SMS/call/email is actually sent.

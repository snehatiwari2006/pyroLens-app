import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Header from "./components/Header.jsx";
import FireDetailsDrawer from "./components/FireDetailsDrawer.jsx";
import WarningModal from "./components/WarningModal.jsx";

import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FireMapPage from "./pages/FireMapPage.jsx";
import Classification from "./pages/Classification.jsx";
import ThermalPersistence from "./pages/ThermalPersistence.jsx";
import ImpactAnalysis from "./pages/ImpactAnalysis.jsx";
import InfrastructureExposure from "./pages/InfrastructureExposure.jsx";
import DecisionSupport from "./pages/DecisionSupport.jsx";
import FireAnalytics from "./pages/FireAnalytics.jsx";
import HotspotAnalysis from "./pages/HotspotAnalysis.jsx";
import SatelliteDataCentre from "./pages/SatelliteDataCentre.jsx";
import OsmIntelligence from "./pages/OsmIntelligence.jsx";
import AreaMonitoring from "./pages/AreaMonitoring.jsx";
import AlertsWarnings from "./pages/AlertsWarnings.jsx";
import Incidents from "./pages/Incidents.jsx";
import EmergencyResponse from "./pages/EmergencyResponse.jsx";
import Reports from "./pages/Reports.jsx";
import DemoMode from "./pages/DemoMode.jsx";
import Settings from "./pages/Settings.jsx";

function Shell() {
  const { drawerIncident, closeDrawer, issueWarning, warningIncident, warningConfirmed, confirmWarning, closeWarning } = useApp();

  return (
    <div className="min-h-screen bg-paper text-ink" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<FireMapPage />} />
          <Route path="/classification" element={<Classification />} />
          <Route path="/thermal-persistence" element={<ThermalPersistence />} />
          <Route path="/impact" element={<ImpactAnalysis />} />
          <Route path="/exposure" element={<InfrastructureExposure />} />
          <Route path="/decision-support" element={<DecisionSupport />} />
          <Route path="/analytics" element={<FireAnalytics />} />
          <Route path="/hotspots" element={<HotspotAnalysis />} />
          <Route path="/satellite" element={<SatelliteDataCentre />} />
          <Route path="/osm" element={<OsmIntelligence />} />
          <Route path="/area-monitoring" element={<AreaMonitoring />} />
          <Route path="/alerts" element={<AlertsWarnings />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/response" element={<EmergencyResponse />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/demo" element={<DemoMode />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>

      <footer className="border-t border-line py-6 text-center text-xs text-slateink">
        PyroLens — AI-assisted fire detection and impact intelligence. Demo data is used when live providers are not configured.
      </footer>

      <FireDetailsDrawer incident={drawerIncident} onClose={closeDrawer} onIssueWarning={issueWarning} />
      <WarningModal incident={warningIncident} onClose={closeWarning} onConfirm={confirmWarning} confirmed={warningConfirmed} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

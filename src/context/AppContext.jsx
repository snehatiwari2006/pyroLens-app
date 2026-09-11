import React, { createContext, useContext, useMemo, useState } from "react";
import { INCIDENTS as BASE_INCIDENTS } from "../data/incidents.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [statusOverrides, setStatusOverrides] = useState({});
  const [drawerIncident, setDrawerIncident] = useState(null);
  const [warningIncident, setWarningIncident] = useState(null);
  const [warningConfirmed, setWarningConfirmed] = useState(false);

  const incidents = useMemo(
    () => BASE_INCIDENTS.map((i) => (statusOverrides[i.id] ? { ...i, status: statusOverrides[i.id] } : i)),
    [statusOverrides]
  );

  const getIncident = (id) => incidents.find((i) => i.id === id);

  const openIncident = (incidentOrId) => {
    const inc = typeof incidentOrId === "string" ? getIncident(incidentOrId) : incidentOrId;
    setDrawerIncident(inc || null);
  };
  const closeDrawer = () => setDrawerIncident(null);

  const issueWarning = (incidentOrId) => {
    const inc = typeof incidentOrId === "string" ? getIncident(incidentOrId) : incidentOrId;
    setDrawerIncident(null);
    setWarningIncident(inc || null);
    setWarningConfirmed(false);
  };
  const confirmWarning = () => {
    if (!warningIncident) return;
    setStatusOverrides((s) => ({ ...s, [warningIncident.id]: "Warning Issued" }));
    setWarningConfirmed(true);
  };
  const closeWarning = () => setWarningIncident(null);

  const value = {
    incidents, getIncident,
    drawerIncident, openIncident, closeDrawer,
    warningIncident, warningConfirmed, issueWarning, confirmWarning, closeWarning,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

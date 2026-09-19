import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getIncidents } from "../services/fireIntelligenceService.js";
import { apiFetch } from "../services/api.js";
import { refreshFirmsFeed } from "../services/firmsService.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [statusOverrides, setStatusOverrides] = useState({});
  const [drawerIncident, setDrawerIncident] = useState(null);
  const [warningIncident, setWarningIncident] = useState(null);
  const [warningConfirmed, setWarningConfirmed] = useState(false);
  const [loadedIncidents, setLoadedIncidents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  useEffect(() => {
    let mounted = true;
    getIncidents().then((events) => {
      if (mounted && Array.isArray(events)) setLoadedIncidents(events);
    }).catch((error) => { if (mounted) setRefreshError(`Live event service unavailable: ${error.message}`); });
    return () => { mounted = false; };
  }, []);

  const incidents = useMemo(
    () => loadedIncidents.map((i) => (statusOverrides[i.id] ? { ...i, status: statusOverrides[i.id] } : i)),
    [loadedIncidents, statusOverrides]
  );

  const getIncident = (id) => incidents.find((i) => i.id === id);

  const refreshLiveEvents = async () => {
    setRefreshing(true);
    setRefreshError("");
    try {
      const result = await refreshFirmsFeed();
      const events = await getIncidents();
      if (Array.isArray(events)) setLoadedIncidents(events);
      return result;
    } catch (error) {
      setRefreshError(error.message || "Unable to refresh NASA FIRMS data");
      throw error;
    } finally {
      setRefreshing(false);
    }
  };

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
  const confirmWarning = async () => {
    if (!warningIncident) return;
    try {
      await apiFetch(`/events/${warningIncident.id}/alerts`, {
        method: "POST",
        body: JSON.stringify({ channels: ["dashboard"] }),
      });
    } catch {
      // Demo mode keeps the warning visible if the API is intentionally offline.
    }
    setStatusOverrides((s) => ({ ...s, [warningIncident.id]: "Warning Issued" }));
    setWarningConfirmed(true);
  };
  const closeWarning = () => setWarningIncident(null);

  const value = {
    incidents, getIncident,
    dataMode: "live",
    refreshing, refreshError, refreshLiveEvents,
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

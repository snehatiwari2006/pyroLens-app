import {
  Home as HomeIcon, LayoutDashboard, Map as MapIcon, BrainCircuit, ScanLine, Compass,
  Boxes, ShieldCheck, BarChart3, TrendingUp, SatelliteDish, Globe2, PinIcon, Siren,
  ClipboardList, Truck, FileBarChart2, PlayCircle, Settings as SettingsIcon,
} from "lucide-react";

export const NAV = [
  { group: "Overview", items: [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Fire Intelligence", items: [
    { path: "/map", label: "Fire Intelligence Map", icon: MapIcon },
    { path: "/classification", label: "AI Classification", icon: BrainCircuit },
    { path: "/thermal-persistence", label: "Thermal Persistence", icon: ScanLine },
  ]},
  { group: "Impact & Risk", items: [
    { path: "/impact", label: "Impact Analysis", icon: Compass },
    { path: "/exposure", label: "Infrastructure Exposure", icon: Boxes },
    { path: "/decision-support", label: "Decision Support", icon: ShieldCheck },
  ]},
  { group: "Analytics", items: [
    { path: "/analytics", label: "Fire Analytics", icon: BarChart3 },
    { path: "/hotspots", label: "Hotspot Analysis", icon: TrendingUp },
  ]},
  { group: "Monitoring", items: [
    { path: "/satellite", label: "Satellite Data Centre", icon: SatelliteDish },
    { path: "/osm", label: "OSM Intelligence", icon: Globe2 },
    { path: "/area-monitoring", label: "Area Monitoring", icon: PinIcon },
  ]},
  { group: "Operations", items: [
    { path: "/alerts", label: "Alerts & Warnings", icon: Siren },
    { path: "/incidents", label: "Incidents", icon: ClipboardList },
    { path: "/response", label: "Emergency Response", icon: Truck },
  ]},
  { group: "Management", items: [
    { path: "/reports", label: "Reports", icon: FileBarChart2 },
    { path: "/demo", label: "Demo Mode", icon: PlayCircle },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ]},
];

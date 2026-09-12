import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flame, Search, RefreshCw, Bell, UserCircle2, Menu, X, ChevronDown } from "lucide-react";
import { NAV } from "./navConfig.js";
import { INCIDENTS } from "../data/incidents.js";

export default function Header({ notifCount = 6 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const doSearch = (e) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const hit = INCIDENTS.find(
      (i) => i.id.toLowerCase().includes(q) || i.location.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
    );
    navigate("/incidents", { state: hit ? { incidentId: hit.id } : undefined });
    setMobileOpen(false);
  };

  const isActiveGroup = (g) => g.items.some((it) => it.path === location.pathname);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[#C2410C]">
              <Flame size={18} color="#fff" />
            </div>
            <div className="text-left">
              <div className="font-semibold leading-none text-ink">PYROLENS</div>
              <div className="text-[11px] leading-none mt-1 text-slateink">Industrial Fire & Impact Intelligence Platform</div>
            </div>
          </button>

          <form onSubmit={doSearch} className="hidden md:flex items-center flex-1 max-w-sm">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incident, location, coordinates…"
                className="w-full text-sm rounded-md border border-line pl-9 pr-3 py-2 outline-none focus:border-[#C2410C]" />
            </div>
          </form>

          <div className="flex items-center gap-1.5 shrink-0">
            <button className="p-2 rounded-md hover:bg-gray-100 hidden sm:block" title="Refresh"><RefreshCw size={17} className="text-slateink" /></button>
            <button className="p-2 rounded-md hover:bg-gray-100 relative" title="Notifications">
              <Bell size={17} className="text-slateink" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full text-[9px] text-white flex items-center justify-center bg-critical">
                  {notifCount}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 bg-safeBg text-safe">
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> Operational
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100 hidden sm:flex items-center gap-1.5">
              <UserCircle2 size={20} className="text-slateink" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block border-t border-line">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1">
          {NAV.map((g) => (
            <div key={g.group} className="relative" onMouseEnter={() => setOpenGroup(g.group)} onMouseLeave={() => setOpenGroup(null)}>
              <button className="flex items-center gap-1 px-3 py-3 text-sm font-medium"
                style={{ color: isActiveGroup(g) ? "#C2410C" : "#0F1E2E" }}>
                {g.group} <ChevronDown size={13} />
              </button>
              {openGroup === g.group && (
                <div className="absolute left-0 top-full w-64 rounded-lg border border-line shadow-lg py-1.5 z-40 bg-white">
                  {g.items.map((it) => (
                    <button key={it.path} onClick={() => { navigate(it.path); setOpenGroup(null); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-[#FAF7F2]"
                      style={{ color: location.pathname === it.path ? "#C2410C" : "#0F1E2E", background: location.pathname === it.path ? "#FFF7ED" : "transparent" }}>
                      <it.icon size={15} /> {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-line max-h-[70vh] overflow-y-auto">
          <form onSubmit={doSearch} className="px-4 py-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
                className="w-full text-sm rounded-md border border-line pl-9 pr-3 py-2" />
            </div>
          </form>
          {NAV.map((g) => (
            <div key={g.group} className="px-4 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide py-1.5 text-slateink">{g.group}</div>
              {g.items.map((it) => (
                <button key={it.path} onClick={() => { navigate(it.path); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 py-2.5 text-sm text-left"
                  style={{ color: location.pathname === it.path ? "#C2410C" : "#0F1E2E" }}>
                  <it.icon size={15} /> {it.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

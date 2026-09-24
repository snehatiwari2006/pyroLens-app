import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flame, Search, RefreshCw, Bell, UserCircle2, Menu, X, ChevronDown, Check } from "lucide-react";
import { NAV } from "./navConfig.js";
import { useApp } from "../context/AppContext.jsx";

export default function Header({ notifCount = 6 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { incidents, refreshLiveEvents, refreshing, refreshError } = useApp();
  const activeGroup = (group) => group.items.some((item) => item.path === location.pathname);

  useEffect(() => { setMobileOpen(false); setOpenGroup(null); }, [location.pathname]);

  const doSearch = (event) => {
    event.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;
    const hit = incidents.find((item) => item.id.toLowerCase().includes(query) || item.location.toLowerCase().includes(query) || item.name.toLowerCase().includes(query));
    navigate("/incidents", { state: hit ? { incidentId: hit.id } : undefined });
    setMobileOpen(false);
  };

  return (
    <header className="product-header sticky top-3 z-30 mx-3 sm:mx-5 rounded-2xl border border-line bg-white/95 shadow-[0_12px_28px_-18px_rgba(15,30,46,0.28)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 shrink-0 text-left group">
            <div className="header-brand-mark h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform"><Flame size={20} strokeWidth={2.5} /></div>
            <div><div className="flex items-center gap-1.5"><span className="font-extrabold text-base leading-none text-ink tracking-tight">PYROLENS</span><span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100/70 text-orange-800 border border-orange-200">AI</span></div><div className="text-[11px] leading-none mt-1 text-slateink font-medium">Geospatial Fire Intelligence</div></div>
          </button>

          <form onSubmit={doSearch} className="hidden md:flex items-center flex-1 max-w-sm"><div className="relative w-full"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateink/70" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search anomaly, facility, coordinates…" className="w-full text-xs sm:text-sm rounded-xl border border-line bg-[#FAF8F5]/80 pl-9 pr-3 py-2 outline-none text-ink placeholder:text-slateink/60 transition-all focus:bg-white focus:border-orange focus:ring-2 focus:ring-orange/15 shadow-sm" /></div></form>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => refreshLiveEvents().catch(() => {})} disabled={refreshing} className="p-2 rounded-lg hover:bg-[#FAF7F2] text-slateink hover:text-ink disabled:opacity-50 transition-colors hidden sm:flex border border-transparent hover:border-line" title={refreshError || "Refresh live NASA FIRMS detections"}><RefreshCw size={16} className={refreshing ? "animate-spin text-orange" : ""} /></button>
            <button onClick={() => navigate("/alerts")} className="p-2 rounded-lg hover:bg-[#FAF7F2] text-slateink hover:text-ink transition-colors relative border border-transparent hover:border-line" title="Active Alerts"><Bell size={16} />{notifCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-critical shadow-sm">{notifCount}</span>}</button>
            <button onClick={() => navigate("/settings")} className="p-2 rounded-lg hover:bg-[#FAF7F2] text-slateink hover:text-ink hidden sm:flex transition-colors border border-transparent hover:border-line" title="Settings"><UserCircle2 size={19} /></button>
            <button className="p-2 rounded-lg hover:bg-[#FAF7F2] text-ink lg:hidden border border-line" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block border-t border-line/80 bg-[#FFFEFC]/90 rounded-b-2xl"><div className="max-w-7xl mx-auto px-6 flex items-center gap-1.5">
        {NAV.map((group) => {
          const active = activeGroup(group);
          return <div key={group.group} className="relative" onMouseEnter={() => setOpenGroup(group.group)} onMouseLeave={() => setOpenGroup(null)}>
            <button className={`flex items-center gap-1.5 px-3.5 py-2.5 my-1 text-xs font-semibold tracking-wide rounded-lg transition-all ${active ? "header-nav-active text-orange bg-orange-50/80 font-bold border border-orange-200/60 shadow-sm" : "text-ink hover:text-orange hover:bg-[#FCFAF6] hover:shadow-sm"}`}><span>{group.group}</span><ChevronDown size={12} className={`transition-transform ${openGroup === group.group ? "rotate-180 text-orange" : "text-slateink"}`} /></button>
            {openGroup === group.group && <div className="absolute left-0 top-full w-64 rounded-xl border border-line/90 bg-white shadow-[0_12px_28px_-4px_rgba(15,30,46,0.1)] py-2 z-50"><div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slateink/80 border-b border-line/60 mb-1">{group.group} Workstations</div>{group.items.map((item) => { const current = location.pathname === item.path; const Icon = item.icon; return <button key={item.path} onClick={() => { navigate(item.path); setOpenGroup(null); }} className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors ${current ? "text-orange bg-orange-50 font-semibold" : "text-ink hover:bg-[#FAF7F2] hover:text-orange"}`}><span className="flex items-center gap-2.5"><Icon size={15} className={current ? "text-orange" : "text-slateink"} />{item.label}</span>{current && <Check size={13} className="text-orange" />}</button>; })}</div>}
          </div>;
        })}
      </div></div>

      {mobileOpen && <div className="lg:hidden border-t border-line bg-white max-h-[75vh] overflow-y-auto shadow-xl"><form onSubmit={doSearch} className="p-4 border-b border-line bg-[#FCFAF6]"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search anomaly, facility…" className="w-full text-xs rounded-lg border border-line bg-white pl-9 pr-3 py-2 text-ink outline-none focus:border-orange" /></div></form><div className="p-2 divide-y divide-line/60">{NAV.map((group) => <div key={group.group} className="py-2"><div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 text-slateink">{group.group}</div>{group.items.map((item) => { const Icon = item.icon; const current = location.pathname === item.path; return <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg font-medium text-left ${current ? "text-orange bg-orange-50 font-bold" : "text-ink hover:bg-[#FAF7F2]"}`}><Icon size={16} className={current ? "text-orange" : "text-slateink"} />{item.label}</button>; })}</div>)}</div></div>}
    </header>
  );
}

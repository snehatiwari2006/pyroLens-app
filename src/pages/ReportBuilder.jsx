import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useApp } from "../context/AppContext.jsx";
import { apiFetch } from "../services/api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { SeverityPill } from "../components/StatusBadge.jsx";
import { FileText, Download, Eye, Calendar, MapPin, AlertTriangle, Factory, Users, Hospital, Compass, Loader2, CheckCircle, X, ChevronDown, ChevronUp, Filter, Settings, Share2 } from "lucide-react";

const REPORT_TEMPLATES = [
  { id: "incident_brief", label: "Incident Brief", desc: "Single event detailed analysis with impact zones", icon: FileText },
  { id: "daily_summary", label: "Daily Summary", desc: "All active events in the last 24 hours", icon: Calendar },
  { id: "sector_report", label: "Sector Report", desc: "Comprehensive analysis for a geographic area", icon: MapPin },
  { id: "risk_assessment", label: "Risk Assessment", desc: "High-risk events with exposure analysis", icon: AlertTriangle },
  { id: "custom", label: "Custom Report", desc: "Build your own report with selected events", icon: Settings },
];

export default function ReportBuilder() {
  const { incidents } = useApp();
  const active = incidents.filter((i) => i.status !== "Resolved");
  
  const [selectedTemplate, setSelectedTemplate] = useState("incident_brief");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportTitle, setReportTitle] = useState("");
  const [includeSections, setIncludeSections] = useState({
    overview: true,
    impact: true,
    exposure: true,
    weather: true,
    risk: true,
    recommendations: true,
    map: true,
  });
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = useRef(null);

  // Auto-generate title based on template
  useEffect(() => {
    const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (selectedTemplate === "incident_brief" && selectedEvents.length === 1) {
        setReportTitle(`${template.label}: ${selectedEvents[0].id} - ${dateStr}`);
      } else {
        setReportTitle(`${template.label} - ${dateStr}`);
      }
    }
  }, [selectedTemplate, selectedEvents]);

  const toggleEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleSection = (section) => {
    setIncludeSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateReportHtml = () => {
    const eventsToInclude = selectedTemplate === "incident_brief" && selectedEvents.length > 0
      ? selectedEvents.map(id => incidents.find(i => i.id === id)).filter(Boolean)
      : selectedTemplate === "daily_summary"
        ? active.slice(0, 20)
        : selectedTemplate === "risk_assessment"
          ? active.filter(i => i.risk === "CRITICAL" || i.risk === "HIGH").slice(0, 20)
          : active.slice(0, 20);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; color: #1f2937; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #dc2626; font-size: 28px; font-weight: 800; margin-bottom: 8px; }
          .subtitle { color: #6b7280; font-size: 14px; }
          .meta { display: flex; justify-content: center; gap: 20px; margin-top: 16px; font-size: 12px; color: #6b7280; }
          h1 { font-size: 22px; margin: 30px 0 16px; color: #1f2937; border-left: 4px solid #dc2626; padding-left: 12px; }
          h2 { font-size: 18px; margin: 24px 0 12px; color: #374151; }
          .event-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafafa; }
          .event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .event-id { font-family: monospace; font-weight: 700; font-size: 13px; color: #dc2626; }
          .risk-badge { padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .risk-CRITICAL { background: #fef2f2; color: #b91c1c; }
          .risk-HIGH { background: #fff7ed; color: #c2410c; }
          .risk-MEDIUM { background: #fffbeb; color: #b45309; }
          .risk-LOW { background: #f0fdf4; color: #166534; }
          .field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px; }
          .field { background: white; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; }
          .field-label { color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
          .field-value { font-weight: 600; color: #1f2937; }
          .section { margin-top: 24px; page-break-inside: avoid; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
          .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 11px; color: #92400e; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PyroLens</div>
          <div class="subtitle">AI-Assisted Fire Detection & Impact Intelligence</div>
          <div class="meta">
            <span>Generated: ${new Date().toLocaleString()}</span>
            <span>Classification: ${includeSections.overview ? "Operational" : "Restricted"}</span>
          </div>
        </div>

        <h1>${reportTitle}</h1>

        ${includeSections.overview ? `
        <div class="section">
          <h2>Executive Summary</h2>
          <p>This report covers <strong>${eventsToInclude.length}</strong> thermal event(s) detected by NASA FIRMS VIIRS/MODIS sensors. 
          Events are prioritized by Fire Radiative Power (FRP), persistence score, and detection confidence.</p>
          <p><strong>Monitoring Area:</strong> Malawi Fire Monitoring Area (${active.length} total active observations)</p>
          <p><strong>Data Freshness:</strong> Live NASA FIRMS feed with 7-day historical backfill</p>
        </div>
        ` : ""}

        ${includeSections.overview ? `
        <div class="section">
          <h2>Event Overview</h2>
          ${eventsToInclude.map(event => `
            <div class="event-card">
              <div class="event-header">
                <span class="event-id">${event.id}</span>
                <span class="risk-badge risk-${event.risk}">${event.risk}</span>
              </div>
              <div class="field-grid">
                <div class="field"><div class="field-label">Name</div><div class="field-value">${event.name}</div></div>
                <div class="field"><div class="field-label">Location</div><div class="field-value">${event.location}</div></div>
                <div class="field"><div class="field-label">Coordinates</div><div class="field-value">${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}</div></div>
                <div class="field"><div class="field-label">FRP</div><div class="field-value">${event.frp}</div></div>
                <div class="field"><div class="field-label">Confidence</div><div class="field-value">${event.confidence}%</div></div>
                <div class="field"><div class="field-label">Type</div><div class="field-value">${event.type}</div></div>
                <div class="field"><div class="field-label">Persistence</div><div class="field-value">${event.persistenceScore}%</div></div>
                <div class="field"><div class="field-label">Risk Score</div><div class="field-value">${event.riskScore}/100</div></div>
              </div>
            </div>
          `).join("")}
        </div>
        ` : ""}

        ${includeSections.impact ? `
        <div class="section">
          <h2>Impact & Spread Analysis</h2>
          ${eventsToInclude.map(event => `
            <div class="event-card">
              <div class="event-header">
                <span class="event-id">${event.id}</span>
                <span class="risk-badge risk-${event.risk}">${event.risk}</span>
              </div>
              <div class="field-grid">
                <div class="field"><div class="field-label">Spread Bearing</div><div class="field-value">${event.impactDirection || "Calculating…"}</div></div>
                <div class="field"><div class="field-label">Potential Footprint</div><div class="field-value">${event.impactZone || "Pending"}</div></div>
                <div class="field"><div class="field-label">Model Certainty</div><div class="field-value">${event.impactConfidence || "—"}%</div></div>
                <div class="field"><div class="field-label">Data Basis</div><div class="field-value">Weather-informed model</div></div>
              </div>
            </div>
          `).join("")}
        </div>
        ` : ""}

        ${includeSections.exposure ? `
        <div class="section">
          <h2>Infrastructure Exposure</h2>
          ${eventsToInclude.map(event => `
            <div class="event-card">
              <div class="event-header">
                <span class="event-id">${event.id}</span>
                <span class="risk-badge risk-${event.risk}">${event.risk}</span>
              </div>
              <div class="field-grid">
                <div class="field"><div class="field-label">Buildings</div><div class="field-value">${event.exposure?.buildings || event.exposure?.residential || 0}</div></div>
                <div class="field"><div class="field-label">Roads</div><div class="field-value">${event.exposure?.roads || 0}</div></div>
                <div class="field"><div class="field-label">Industrial Sites</div><div class="field-value">${event.exposure?.industrial || event.exposure?.industrial_sites || 0}</div></div>
                <div class="field"><div class="field-label">Critical Assets</div><div class="field-value">${event.exposure?.critical || event.exposure?.critical_assets || 0}</div></div>
                <div class="field"><div class="field-label">Est. Population</div><div class="field-value">${event.exposure?.population || 0}</div></div>
                <div class="field"><div class="field-label">Source</div><div class="field-value">${event.exposure?.source || "OSM/PostGIS"}</div></div>
              </div>
            </div>
          `).join("")}
        </div>
        ` : ""}

        ${includeSections.weather ? `
        <div class="section">
          <h2>Meteorological Conditions</h2>
          ${eventsToInclude.map(event => {
            const weather = event.exposure?.weather || {};
            return `
              <div class="event-card">
                <div class="event-header">
                  <span class="event-id">${event.id}</span>
                  <span class="risk-badge risk-${event.risk}">${event.risk}</span>
                </div>
                <div class="field-grid">
                  <div class="field"><div class="field-label">Wind Direction</div><div class="field-value">${weather.wind_direction || "Unavailable"}</div></div>
                  <div class="field"><div class="field-label">Wind Speed</div><div class="field-value">${weather.wind_speed_kmh ? weather.wind_speed_kmh + " km/h" : "Unavailable"}</div></div>
                  <div class="field"><div class="field-label">Temperature</div><div class="field-value">${weather.temperature_c ? weather.temperature_c + "°C" : "Unavailable"}</div></div>
                  <div class="field"><div class="field-label">Humidity</div><div class="field-value">${weather.humidity_pct ? weather.humidity_pct + "%" : "Unavailable"}</div></div>
                  <div class="field"><div class="field-label">Source</div><div class="field-value">${weather.source || "WeatherStack"}</div></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
        ` : ""}

        ${includeSections.risk ? `
        <div class="section">
          <h2>Risk Assessment</h2>
          ${eventsToInclude.map(event => `
            <div class="event-card">
              <div class="event-header">
                <span class="event-id">${event.id}</span>
                <span class="risk-badge risk-${event.risk}">${event.risk}</span>
              </div>
              <div class="field-grid">
                <div class="field"><div class="field-label">Fire Intensity</div><div class="field-value">${event.frp_mw > 100 ? "Very High" : event.frp_mw > 50 ? "High" : "Moderate"}</div></div>
                <div class="field"><div class="field-label">Persistence</div><div class="field-value">${event.persistenceScore > 70 ? "Very High" : event.persistenceScore > 40 ? "High" : "Moderate"}</div></div>
                <div class="field"><div class="field-label">Industrial Exposure</div><div class="field-value">${(event.exposure?.industrial || event.exposure?.industrial_sites || 0) > 2 ? "High" : "Moderate"}</div></div>
                <div class="field"><div class="field-label">Population Exposure</div><div class="field-value">${(event.exposure?.population || 0) > 3000 ? "High" : (event.exposure?.population || 0) > 500 ? "Moderate" : "Low"}</div></div>
                <div class="field"><div class="field-label">Critical Infra Exposure</div><div class="field-value">${(event.exposure?.critical || event.exposure?.critical_assets || 0) > 1 ? "High" : "Moderate"}</div></div>
                <div class="field"><div class="field-label">Impact Confidence</div><div class="field-value">${event.impactConfidence > 70 ? "High" : "Moderate"}</div></div>
              </div>
            </div>
          `).join("")}
        </div>
        ` : ""}

        ${includeSections.recommendations ? `
        <div class="section">
          <h2>Recommended Actions</h2>
          <ol style="padding-left: 20px;">
            ${eventsToInclude.slice(0, 5).map((event, i) => `
              <li style="margin-bottom: 12px;">
                <strong>${event.id}</strong> (${event.risk}): 
                Initiate multi-agency verification. Deploy UAV/ground scout to ${event.location}. 
                Notify facility safety for nearby industrial infrastructure. 
                Establish 1,500m safety perimeter along ${event.impactDirection || "downwind"} bearing. 
                Authorize warning dispatch to emergency command centers.
              </li>
            `).join("")}
          </ol>
        </div>
        ` : ""}

        <div class="disclaimer">
          <strong>Disclaimer:</strong> This report is generated by PyroLens AI-assisted fire intelligence platform. 
          Impact zones are estimates based on wind-oriented geometric models and conservative terrain assumptions. 
          They are NOT confirmed damage assessments. All operational decisions must be validated against current 
          weather, ground observations, and local authority guidance. PyroLens assumes no liability for decisions 
          based on this report.
        </div>

        <div class="footer">
          PyroLens — AI-Assisted Fire Detection & Impact Intelligence | Generated ${new Date().toISOString()} | 
          Data Sources: NASA FIRMS, OpenStreetMap, WeatherStack/Open-Meteo
        </div>
      </body>
      </html>
    `;
    return html;
  };

  const handleGeneratePdf = async () => {
    setGenerating(true);
    const html = generateReportHtml();
    setPreviewHtml(html);
    setShowPreview(true);

    // Small delay to let preview render
    setTimeout(async () => {
      try {
        const element = reportRef.current;
        if (!element) throw new Error("Report element not found");

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297; // A4 height in mm

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }

        const fileName = `${reportTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setGenerating(false);
      }
    }, 500);
  };

  const handleDownloadHtml = () => {
    const html = generateReportHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Report Generation"
        title="Report Builder"
        desc="Create professional PDF briefings for thermal events. Select a template, customize sections, and export."
      />

      {/* Template Selector */}
      <Card>
        <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Select Template</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedTemplate === template.id
                  ? "border-orange-300 bg-orange-50 ring-1 ring-orange/30"
                  : "border-line bg-white/50 hover:border-orange/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-orange-100">
                  <template.icon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-ink">{template.label}</p>
                  <p className="text-xs text-slate-500">{template.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Configuration */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Event Selection */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-ink">Events to Include</h3>
            <span className="text-xs font-medium text-slateink">{selectedEvents.length} selected</span>
          </div>
          
          {selectedTemplate === "custom" && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {active.slice(0, 30).map((event) => (
                <label key={event.id} className="flex items-center gap-3 p-2 rounded-xl border border-line bg-white/50 cursor-pointer hover:bg-slate-50 transition-all">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="rounded border-line text-orange focus:ring-orange"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-ink truncate">{event.id}</p>
                    <p className="text-[10px] text-slate-500 truncate">{event.name}</p>
                  </div>
                  <SeverityPill level={event.risk} size="xs" />
                </label>
              ))}
            </div>
          )}

          {selectedTemplate !== "custom" && (
            <>
              <div className="space-y-2 text-xs text-slate-500">
                <p>Events will be auto-selected based on template:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {selectedTemplate === "incident_brief" && <li>Select one event below</li>}
                  {selectedTemplate === "daily_summary" && <li>Top 20 events from last 24h</li>}
                  {selectedTemplate === "risk_assessment" && <li>CRITICAL + HIGH risk events (max 20)</li>}
                  {selectedTemplate === "sector_report" && <li>All events in monitoring area</li>}
                </ul>
              </div>

              {selectedTemplate === "incident_brief" && selectedEvents.length === 0 && active.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-800">Select an event for the incident brief:</p>
                  <select
                    value={selectedEvents[0] || ""}
                    onChange={(e) => setSelectedEvents(e.target.value ? [e.target.value] : [])}
                    className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink outline-none focus:border-orange"
                  >
                    <option value="">Choose event...</option>
                    {active.map(event => (
                      <option key={event.id} value={event.id}>{event.id} � {event.frp} � {event.confidence}%</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Report Sections */}
        <Card className="lg:col-span-1">
          <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Report Sections</h3>
          <div className="space-y-2">
            {[
              { id: "overview", label: "Executive Summary", desc: "Event count, monitoring area, data freshness" },
              { id: "impact", label: "Impact & Spread", desc: "Spread bearing, footprint, model certainty" },
              { id: "exposure", label: "Infrastructure Exposure", desc: "Buildings, roads, industrial, population" },
              { id: "weather", label: "Meteorological Conditions", desc: "Wind, temperature, humidity, source" },
              { id: "risk", label: "Risk Assessment", desc: "Factor breakdown with severity ratings" },
              { id: "recommendations", label: "Recommended Actions", desc: "SOPs for each high-priority event" },
              { id: "map", label: "Map Visualization", desc: "Impact zones and event locations (HTML only)" },
            ].map((section) => (
              <label key={section.id} className="flex items-center gap-3 p-2 rounded-xl border border-line bg-white/50 cursor-pointer hover:bg-slate-50 transition-all">
                <input
                  type="checkbox"
                  checked={includeSections[section.id]}
                  onChange={() => toggleSection(section.id)}
                  className="rounded border-line text-orange focus:ring-orange"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-ink">{section.label}</p>
                  <p className="text-[10px] text-slate-500">{section.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Report Options */}
        <Card className="lg:col-span-1">
          <h3 className="font-bold text-sm text-ink mb-4 tracking-tight">Report Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/15"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slateink mb-1">Date Range (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="rounded-xl border border-line bg-[#FCFAF6] px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-orange"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-line/60">
              <h4 className="font-bold text-sm text-ink mb-3">Output Format</h4>
              <div className="space-y-2">
                <button
                  onClick={handleGeneratePdf}
                  disabled={generating || (selectedTemplate === "incident_brief" && selectedEvents.length === 0)}
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange/25"
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Generate & Download PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadHtml}
                  disabled={generating}
                  className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  <span>Download HTML (for editing)</span>
                </button>
                <button
                  onClick={() => { setPreviewHtml(generateReportHtml()); setShowPreview(true); }}
                  disabled={generating}
                  className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  <span>Preview in Browser</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
          <div className="w-full max-w-4xl h-[90vh] rounded-2xl border border-line bg-white shadow-xl animate-slideUp flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-line/60">
              <h3 className="font-bold text-lg text-ink">Report Preview</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadHtml} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3">
                  <Download size={14} />
                  <span>Download HTML</span>
                </button>
                <button onClick={handleGeneratePdf} disabled={generating} className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3">
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4" ref={reportRef} dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
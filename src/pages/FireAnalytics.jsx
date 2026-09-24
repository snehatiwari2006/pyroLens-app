import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { TIME_SERIES, CLASS_DIST, RISK_DIST, SEASONAL } from "../data/analytics.js";

const RANGES = ["24H", "7D", "30D", "6M", "1Y"];

export default function FireAnalytics() {
  const [range, setRange] = useState("7D");

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        eyebrow="Historical Intelligence"
        title="Fire & Thermal Analytics"
        desc="Temporal trends, multi-sensor distribution ratios, and seasonal patterns across detected thermal anomalies."
        action={
          <div className="flex gap-1.5 p-1 rounded-xl bg-white border border-line shadow-xs">
            {RANGES.map((r) => {
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${
                    active
                      ? "bg-orange text-white shadow-xs"
                      : "text-slateink hover:text-ink hover:bg-[#FAF7F2]"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Time Series */}
        <Card accent="orange" hoverLift={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-ink tracking-tight">Thermal Detections Over Time ({range})</h3>
            <span className="text-[11px] font-semibold text-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Live VIIRS Stream
            </span>
          </div>
          <div className="py-2">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={TIME_SERIES}>
                <CartesianGrid stroke="#E8E4DC" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#E8E4DC",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(15,30,46,0.08)",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="events" stroke="#0F1E2E" strokeWidth={2.5} dot={{ r: 3 }} name="All events" />
                <Line type="monotone" dataKey="industrial" stroke="#C2410C" strokeWidth={2.5} dot={{ r: 3 }} name="Industrial" />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Classification Distribution */}
        <Card accent="purple" hoverLift={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-ink tracking-tight">Classification Source Share</h3>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              AI Categorized
            </span>
          </div>
          <div className="py-2">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={CLASS_DIST} dataKey="value" nameKey="name" outerRadius={85} innerRadius={42} paddingAngle={2}>
                  {CLASS_DIST.map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#E8E4DC",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(15,30,46,0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Risk Breakdown Bar Chart */}
        <Card accent="critical" hoverLift={false}>
          <h3 className="font-bold text-sm text-ink mb-3 tracking-tight">Risk Distribution Across Active Sectors</h3>
          <div className="py-2">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={RISK_DIST}>
                <CartesianGrid stroke="#E8E4DC" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#E8E4DC",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(15,30,46,0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {RISK_DIST.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Seasonal Distribution Area Chart */}
        <Card accent="blue" hoverLift={false}>
          <h3 className="font-bold text-sm text-ink mb-3 tracking-tight">Seasonal Cycle Profile (12-Month Multi-Year)</h3>
          <div className="py-2">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={SEASONAL}>
                <CartesianGrid stroke="#E8E4DC" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#E8E4DC",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(15,30,46,0.08)",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="baseline" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} name="Baseline fire index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}

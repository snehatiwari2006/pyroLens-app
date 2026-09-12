import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import SectionHeader from "../components/SectionHeader.jsx";
import Card from "../components/Card.jsx";
import { TIME_SERIES, CLASS_DIST, RISK_DIST, SEASONAL } from "../data/analytics.js";

const RANGES = ["24H", "7D", "30D", "6M", "1Y"];

export default function FireAnalytics() {
  const [range, setRange] = useState("7D");
  return (
    <div>
      <SectionHeader title="Fire analytics" desc="Trends, distributions and regional patterns across detected thermal events."
        action={
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className="text-xs font-medium rounded-md px-2.5 py-1.5 border"
                style={{ borderColor: range === r ? "#C2410C" : "#E8E4DC", color: range === r ? "#9A3412" : "#5E6573", background: range === r ? "#FFF7ED" : "#fff" }}>{r}</button>
            ))}
          </div>
        } />
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h3 className="font-semibold text-sm mb-3 text-ink">Fire events over time ({range})</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={TIME_SERIES}>
              <CartesianGrid stroke="#E8E4DC" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke="#0F1E2E" strokeWidth={2} dot={false} name="All events" />
              <Line type="monotone" dataKey="industrial" stroke="#B3261E" strokeWidth={2} dot={false} name="Industrial" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold text-sm mb-3 text-ink">Classification distribution</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={CLASS_DIST} dataKey="value" nameKey="name" outerRadius={85}>
                {CLASS_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-sm mb-3 text-ink">Risk distribution across zones</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RISK_DIST}>
              <CartesianGrid stroke="#E8E4DC" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {RISK_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold text-sm mb-3 text-ink">Seasonal trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SEASONAL}>
              <CartesianGrid stroke="#E8E4DC" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={{ stroke: "#E8E4DC" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5E6573" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#C2410C" fill="#FFF4EB" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

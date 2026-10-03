import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function SHAPFeatureImportance({ shapValues, title = "Feature Impact on Spread Prediction" }) {
  if (!shapValues || shapValues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-slateink bg-white/50">
        SHAP explainability data not available for this prediction.
      </div>
    );
  }

  // Sort by absolute value descending
  const sorted = [...shapValues].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const topFeatures = sorted.slice(0, 8);

  const COLORS = {
    positive: "#B3261E",  // Increases spread
    negative: "#1E7A4C",  // Decreases spread
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm text-ink tracking-tight">{title}</h4>
      <p className="text-xs text-slateink">
        SHAP values show how each feature pushes the prediction away from the baseline.
        Red = increases spread risk, Green = decreases spread risk.
      </p>
      
      <div className="h-64 rounded-xl border border-line bg-white p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topFeatures.reverse()} layout="vertical" margin={{ top: 10, right: 10, left: 100, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis 
              type="category" 
              dataKey="feature" 
              tick={{ fontSize: 10 }} 
              tickLine={false} 
              axisLine={false}
              width={120}
            />
            <Tooltip 
              formatter={(value) => [value.toFixed(4), "SHAP value"]}
              labelFormatter={(feature) => feature}
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {topFeatures.reverse().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value >= 0 ? COLORS.positive : COLORS.negative} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-xs text-slateink">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: COLORS.positive }} />
          <span>Increases spread</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: COLORS.negative }} />
          <span>Decreases spread</span>
        </div>
      </div>

      <div className="text-xs text-slateink border-t border-line/60 pt-3">
        <strong>Baseline:</strong> Average model output. Each bar shows how much a feature moves the prediction.
      </div>
    </div>
  );
}

export function SHAPWaterfall({ baseValue, shapValues, finalValue }) {
  if (!shapValues || shapValues.length === 0) return null;

  const sorted = [...shapValues].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const topFeatures = sorted.slice(0, 6);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slateink">
        <span>Baseline (E[f(x)])</span>
        <span className="font-mono text-ink">{baseValue?.toFixed(3) ?? "—"}</span>
      </div>
      {topFeatures.map((feature) => (
        <div key={feature.feature} className="flex items-center gap-2 text-xs">
          <span className="flex-1 truncate text-slateink">{feature.feature}</span>
          <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden relative">
            <div 
              className="h-full rounded" 
              style={{
                width: `${Math.min(Math.abs(feature.value) * 100, 100)}%`,
                background: feature.value >= 0 ? "#B3261E" : "#1E7A4C",
                marginLeft: feature.value < 0 ? `${Math.min(Math.abs(feature.value) * 100, 100)}%` : 0,
              }}
            />
          </div>
          <span className="font-mono text-ink w-16 text-right">
            {feature.value >= 0 ? "+" : ""}{feature.value.toFixed(3)}
          </span>
        </div>
      ))}
      <div className="flex justify-between text-xs font-bold border-t border-line/60 pt-2">
        <span>Final Prediction</span>
        <span className="text-ink">{finalValue?.toFixed(3) ?? "—"}</span>
      </div>
    </div>
  );
}
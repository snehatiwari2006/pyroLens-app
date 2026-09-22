import type { Explanation, HotspotResponse, ImpactResponse, SpreadResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || `API error ${response.status} on ${path}`);
  }
  return response.json() as Promise<T>;
}

export function fetchHotspots(params?: { suspiciousOnly?: boolean; classification?: string }) {
  const query = new URLSearchParams();
  if (params?.suspiciousOnly) query.set("suspicious_only", "true");
  if (params?.classification) query.set("classification", params.classification);
  const suffix = query.toString() ? `?${query}` : "";
  return request<HotspotResponse>(`/hotspots${suffix}`);
}

export function fetchExplanation(eventId: string) {
  return request<Explanation>(`/hotspots/${encodeURIComponent(eventId)}/explain`);
}

export function predictSpread(eventId: string, hours = 3) {
  return request<SpreadResponse>("/predict-spread", {
    method: "POST",
    body: JSON.stringify({ event_id: eventId, hours }),
  });
}

export function fetchImpact(eventId: string, bufferKm = 1.5) {
  return request<ImpactResponse>(`/impact-assessment?event_id=${encodeURIComponent(eventId)}&buffer_km=${bufferKm}`);
}

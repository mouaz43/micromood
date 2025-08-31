// apps/web/src/lib/api.ts
export type MoodPoint = {
  id: string;
  mood: string;
  energy: number;
  lat: number;
  lng: number;
  text?: string | null;
  createdAt: string;
  deleteToken?: string;
};

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "";

function url(path: string) {
  return `${API_BASE}${path}`;
}

function toArray<T>(j: any): T[] {
  if (Array.isArray(j)) return j as T[];
  if (Array.isArray(j?.items)) return j.items as T[];
  if (Array.isArray(j?.data)) return j.data as T[];
  return []; // safe default
}

export async function getRecentMoods(opts: { sinceMinutes: number }): Promise<MoodPoint[]> {
  const res = await fetch(url(`/api/moods?sinceMinutes=${encodeURIComponent(opts.sinceMinutes)}`), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`fetch moods failed: ${res.status}`);
  const j = await res.json();
  return toArray<MoodPoint>(j);
}

export async function sendMood(input: {
  mood: string;
  energy: number;
  lat: number;
  lng: number;
  text?: string;
}): Promise<MoodPoint> {
  const res = await fetch(url("/api/moods"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`send mood failed: ${res.status}`);
  return res.json();
}

export async function deleteMood(id: string, token: string): Promise<{ ok: true }> {
  const res = await fetch(url(`/api/moods/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`delete mood failed: ${res.status}`);
  return res.json();
}

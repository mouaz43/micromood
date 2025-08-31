// apps/web/src/lib/api.ts

export type MoodPoint = {
  id: string;
  mood: string;
  energy: number;        // 1..5
  lat: number;
  lng: number;
  text?: string | null;
  createdAt: string;     // ISO
  deleteToken?: string;  // returned to the client that created it
};

// Base URL for API
// If you have a separate Render web service for the API, set VITE_API_URL there.
// Otherwise leave it empty to use same-origin (proxy or same domain).
const API_BASE = import.meta.env.VITE_API_URL?.trim() || "";

function url(path: string) {
  return `${API_BASE}${path}`;
}

export async function getRecentMoods(opts: { sinceMinutes: number }): Promise<MoodPoint[]> {
  const res = await fetch(url(`/api/moods?sinceMinutes=${encodeURIComponent(opts.sinceMinutes)}`), {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`fetch moods failed: ${res.status}`);
  return res.json();
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
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`send mood failed: ${res.status}`);
  return res.json();
}

// For deleting your own dot (needs the deleteToken you got when creating it)
export async function deleteMood(id: string, token: string): Promise<{ ok: true }> {
  const res = await fetch(url(`/api/moods/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`), {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`delete mood failed: ${res.status}`);
  return res.json();
}

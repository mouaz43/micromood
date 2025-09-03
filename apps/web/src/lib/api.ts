const BASE = (import.meta.env.VITE_API_BASE as string).replace(/\/+$/,'') || '';

export type Mood = 'HAPPY'|'SAD'|'STRESSED'|'CALM'|'ENERGIZED'|'TIRED';

export type Pulse = {
  id: string; lat: number; lng: number; mood: Mood; energy: number;
  text: string | null; createdAt: string;
};

export async function listPulses(sinceMinutes = 720): Promise<Pulse[]> {
  const r = await fetch(`${BASE}/moods?sinceMinutes=${sinceMinutes}`, { credentials: 'omit' });
  if (!r.ok) throw new Error(`Failed to fetch (${r.status})`);
  const j = await r.json();
  return j.data as Pulse[];
}

export async function createPulse(p: { lat: number; lng: number; mood: Mood; energy: number; text?: string }) {
  const r = await fetch(`${BASE}/moods`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(p)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ id: string; deleteToken: string; createdAt: string }>;
}

export async function removePulse(id: string, token: string) {
  const r = await fetch(`${BASE}/moods/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: true }>;
}

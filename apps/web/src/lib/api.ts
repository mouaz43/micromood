const API = import.meta.env.VITE_API_BASE;

export type Mood = 'HAPPY' | 'SAD' | 'STRESSED' | 'CALM' | 'ENERGIZED' | 'TIRED';

export type Pulse = {
  id: number | string;
  lat: number;
  lng: number;
  mood: Mood;
  energy: number;
  text?: string | null;
  createdAt: string;
};

export async function getRecentMoods(sinceMinutes = 720): Promise<Pulse[]> {
  const r = await fetch(`${API}/moods?sinceMinutes=${sinceMinutes}`, { credentials: 'omit' });
  if (!r.ok) throw new Error(`Fetch moods failed: ${r.status}`);
  const j = await r.json();
  return j.data as Pulse[];
}

export async function sendMood(p: {
  lat: number; lng: number; mood: Mood; energy: number; text?: string;
}): Promise<{ id: number | string; deleteToken: string }> {
  const r = await fetch(`${API}/moods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteMood(id: number | string, token?: string, ownerPass?: string) {
  const r = await fetch(`${API}/moods/${id}?${token ? `token=${encodeURIComponent(token)}` : ''}`, {
    method: 'DELETE',
    headers: ownerPass ? { 'x-owner-pass': ownerPass } : {}
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export type MoodIn = { mood: string; energy: number; text?: string; lat: number; lng: number; };
export type MoodOut = {
  id: number; mood: string; energy: number; text: string | null;
  lat: number; lng: number; createdAt: string;
};

const BASE = import.meta.env.VITE_API_BASE;

async function j(r: Response) {
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getRecentMoods(sinceMinutes = 1440): Promise<MoodOut[]> {
  const r = await fetch(`${BASE}/moods?sinceMinutes=${sinceMinutes}`);
  const { data } = await j(r);
  return data as MoodOut[];
}

export async function sendMood(m: MoodIn): Promise<{ id: number; deleteToken: string }> {
  const r = await fetch(`${BASE}/moods`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(m),
  });
  return j(r);
}

export async function deleteMood(id: number, token?: string, ownerCode?: string): Promise<void> {
  const init: RequestInit = { method: "DELETE", headers: {} };
  if (ownerCode) (init.headers as any)["x-owner-code"] = ownerCode;
  const url = token ? `${BASE}/moods/${id}?token=${encodeURIComponent(token)}` : `${BASE}/moods/${id}`;
  const r = await fetch(url, init);
  await j(r);
}

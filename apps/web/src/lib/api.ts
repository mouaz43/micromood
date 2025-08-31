export type MoodIn = {
  mood: string;
  energy: number;
  text?: string;
  lat: number;
  lng: number;
};

export type MoodOut = {
  id: number;
  mood: string;
  energy: number;
  text: string | null;
  lat: number;
  lng: number;
  createdAt: string;
};

const BASE = import.meta.env.VITE_API_BASE;

const asJson = async (r: Response) => {
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || r.statusText);
  }
  return r.json();
};

export async function getRecentMoods(sinceMinutes = 1440): Promise<MoodOut[]> {
  const r = await fetch(`${BASE}/moods?sinceMinutes=${sinceMinutes}`, { credentials: "omit" });
  const j = await asJson(r);
  return j.data as MoodOut[];
}

export async function sendMood(m: MoodIn): Promise<{ id: number; deleteToken: string }> {
  const r = await fetch(`${BASE}/moods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(m),
  });
  return asJson(r);
}

export async function deleteMood(id: number, token: string): Promise<void> {
  const r = await fetch(`${BASE}/moods/${id}?token=${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
  await asJson(r);
}

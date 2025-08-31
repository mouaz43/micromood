export type SendPayload = {
  mood: string;
  energy: number;
  text?: string;
  lat: number;
  lng: number;
  unlockAt?: string;
};

export type MoodPoint = {
  id: string;
  mood: string;
  energy: number;
  text?: string | null;
  lat: number;
  lng: number;
  createdAt: string;
};

const BASE = import.meta.env.VITE_API_URL!.replace(/\/+$/, "");

export async function getRecentMoods(sinceMinutes = 720): Promise<MoodPoint[]> {
  const r = await fetch(`${BASE}/moods?sinceMinutes=${sinceMinutes}`);
  if (!r.ok) throw new Error("Failed to fetch moods");
  const j = await r.json();
  return j.data as MoodPoint[];
}

export async function sendMood(payload: SendPayload): Promise<{ id: string; deleteToken: string }> {
  const r = await fetch(`${BASE}/moods`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Failed to send mood");
  return (await r.json()).data;
}

export async function deleteMood(id: string, token: string) {
  const r = await fetch(`${BASE}/moods/${id}`, {
    method: "DELETE",
    headers: { "x-delete-token": token },
  });
  if (!r.ok) throw new Error("Failed to delete");
}

export async function ownerDelete(
  b: { north: number; south: number; east: number; west: number },
  ownerKey: string
) {
  const r = await fetch(`${BASE}/owner/moods`, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      "x-owner-key": ownerKey,
    },
    body: JSON.stringify(b),
  });
  if (!r.ok) throw new Error("Owner delete failed");
  return (await r.json()).deleted as number;
}

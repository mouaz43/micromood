export type MoodPayload = {
  mood: string;            // "happy" | ... (string on wire)
  energy: number;          // 1..5
  text?: string;
  lat: number;
  lng: number;
};

const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/,"") || "/api";

export async function sendMood(p: MoodPayload): Promise<{ id: string; deleteToken?: string; }> {
  const r = await fetch(`${BASE}/moods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  // stash token locally so the owner can delete later without typing it
  if (data?.id && data?.deleteToken) {
    const map = JSON.parse(localStorage.getItem("mm_tokens") || "{}");
    map[data.id] = data.deleteToken;
    localStorage.setItem("mm_tokens", JSON.stringify(map));
  }
  return data;
}

export async function getRecentMoods(sinceMinutes = 720) {
  const r = await fetch(`${BASE}/moods?sinceMinutes=${sinceMinutes}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteMood(id: string, token?: string) {
  // prefer token from local storage if not provided
  if (!token) {
    const map = JSON.parse(localStorage.getItem("mm_tokens") || "{}");
    token = map[id];
  }
  const r = await fetch(`${BASE}/moods/${id}`, {
    method: "DELETE",
    headers: token ? { "x-delete-token": token } : {},
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

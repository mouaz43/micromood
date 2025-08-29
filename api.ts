const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type MoodPayload = {
  mood: string;
  energy: number;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
};

export async function submitMood(payload: MoodPayload) {
  const res = await fetch(`${API_URL}/api/moods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit mood');
  return res.json();
}

export async function fetchMoods(params: { bbox?: number[]; sinceMinutes?: number } = {}) {
  const q = new URLSearchParams();
  if (params.bbox && params.bbox.length === 4) q.set('bbox', params.bbox.join(','));
  if (params.sinceMinutes) q.set('sinceMinutes', String(params.sinceMinutes));
  const res = await fetch(`${API_URL}/api/moods?${q.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch moods');
  return res.json();
}
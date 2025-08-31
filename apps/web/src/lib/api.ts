const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type MoodPayload = {
  mood: string; energy: number; lat: number; lng: number;
  city?: string; country?: string; message?: string;
};
export type MoodPoint = {
  id: string; createdAt: string; lat: number; lng: number;
  mood: string; energy: number; city?: string | null; country?: string | null; message?: string | null;
};

// local delete tokens for normal-user deletes
const TOKENS_KEY = "micromood_tokens_v1";
export function loadDeleteTokens(){ try{ return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}") }catch{ return {} } }
export function saveDeleteToken(id:string, token:string){ const a=loadDeleteTokens(); a[id]=token; localStorage.setItem(TOKENS_KEY, JSON.stringify(a)) }
export function removeDeleteToken(id:string){ const a=loadDeleteTokens(); delete a[id]; localStorage.setItem(TOKENS_KEY, JSON.stringify(a)) }

export async function submitMood(payload: MoodPayload){
  const res = await fetch(`${API_URL}/api/moods`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
  if(!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ id:string; createdAt:string; deleteToken:string }>;
}
export async function fetchMoods(params: { sinceMinutes?: number } = {}){
  const q = new URLSearchParams(); if(params.sinceMinutes) q.set("sinceMinutes", String(params.sinceMinutes));
  const res = await fetch(`${API_URL}/api/moods?${q.toString()}`); if(!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ data: MoodPoint[] }>;
}
export async function deleteMoodByToken(id: string, token: string){
  const res = await fetch(`${API_URL}/api/moods/${encodeURIComponent(id)}`, { method:"DELETE", headers:{ "x-delete-token": token } });
  if(!res.ok) throw new Error(await res.text()); return res.json() as Promise<{ ok:true }>;
}
export async function deleteMoodAsOwner(id: string, adminSecret: string){
  const res = await fetch(`${API_URL}/api/moods/${encodeURIComponent(id)}`, { method:"DELETE", headers:{ "x-admin-secret": adminSecret } });
  if(!res.ok) throw new Error(await res.text()); return res.json() as Promise<{ ok:true }>;
}

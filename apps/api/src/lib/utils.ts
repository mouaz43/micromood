export type MyToken = { id: string; token: string; at: number };
const KEY = 'mm.tokens';

export function addToken(entry: MyToken) {
  const all = getTokens();
  all.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0,100)));
}

export function getTokens(): MyToken[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function findToken(id: string): string | undefined {
  return getTokens().find(x => x.id === id)?.token;
}

export function rmToken(id: string) {
  localStorage.setItem(KEY, JSON.stringify(getTokens().filter(x => x.id !== id)));
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

// apps/api/src/lib/cors.ts
import cors from 'cors';

/**
 * Parses WEB_ORIGIN env into a normalized allowlist.
 * Examples:
 *  - "*"            -> []
 *  - "https://a, https://b" -> ["https://a","https://b"]
 */
function parseAllowlist(src: string | undefined): string[] {
  if (!src || src.trim() === '*' || src.trim() === '') return [];
  return src
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Build a strict CORS middleware that:
 *  - allows same-origin and server-to-server requests (no Origin header),
 *  - if allowlist is empty => allow all,
 *  - otherwise only allows exact matches from WEB_ORIGIN (comma-separated).
 */
export function buildCors() {
  const allowlist = parseAllowlist(process.env.WEB_ORIGIN);

  // NOTE: don't import CorsOptionsDelegate type; declare the function signature explicitly.
  const origin = (
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void
  ) => {
    // No Origin (e.g., curl/server-to-server) => allow
    if (!origin) return cb(null, true);
    // Empty allowlist means "allow all"
    if (allowlist.length === 0) return cb(null, true);
    // Exact-match allowlist
    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  };

  return cors({
    origin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false,
  });
}

/* Helpful notes (kept here for clarity):
   - Set WEB_ORIGIN to your static site URL, e.g. https://micromood-1.onrender.com
   - For multiple origins: WEB_ORIGIN="https://a.com,https://b.com"
   - Leave WEB_ORIGIN empty or "*" to allow all (dev convenience).
*/

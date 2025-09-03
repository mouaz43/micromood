// apps/api/src/lib/types.ts

/** Canonical list of moods used across the app. */
export const MOODS = [
  'happy',
  'sad',
  'stressed',
  'calm',
  'energized',
  'tired',
] as const;

export type MoodName = (typeof MOODS)[number];

export interface NewPulseInput {
  lat: number;
  lng: number;
  mood: MoodName;
  energy: number; // 1–5
  text?: string | null;
  city?: string | null;
  expiresAt?: Date; // server may set this
}

export interface PulseDTO {
  id: string;
  lat: number;
  lng: number;
  mood: MoodName;
  energy: number;
  text?: string | null;
  city?: string | null;
  createdAt: string; // ISO
  expiresAt: string; // ISO
}

/** Guard helpers */
function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

/**
 * Parse and validate a request body into a NewPulseInput.
 * Throws an Error with a helpful message if invalid.
 */
export function parseNewPulse(body: any): NewPulseInput {
  const errors: string[] = [];

  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.push('lat must be a number between -90 and 90');
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.push('lng must be a number between -180 and 180');
  }

  const moodRaw = String(body?.mood ?? '').toLowerCase();
  const mood = MOODS.find((m) => m === moodRaw);
  if (!mood) {
    errors.push(`mood must be one of: ${MOODS.join(', ')}`);
  }

  const energyNum = Number(body?.energy);
  const energy = Math.max(1, Math.min(5, Number.isFinite(energyNum) ? Math.round(energyNum) : NaN));
  if (!Number.isFinite(energy)) {
    errors.push('energy must be an integer 1–5');
  }

  const text = body?.text == null ? null : String(body.text).slice(0, 150);
  const city = body?.city == null ? null : String(body.city).slice(0, 120);

  if (errors.length) {
    throw new Error(`Invalid pulse: ${errors.join('; ')}`);
  }

  // expires 24h from now (server can override)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    lat,
    lng,
    mood: mood!, // safe because validated
    energy,
    text,
    city,
    expiresAt,
  };
}

/** Shape we expect back from Prisma for a row in MoodPulse. */
export type MoodPulseRecord = {
  id: string;
  lat: number;
  lng: number;
  mood: string; // stored as string in DB
  energy: number;
  text: string | null;
  city: string | null;
  createdAt: Date;
  expiresAt: Date;
};

/** Convert a DB record to the API DTO (ISO dates, typed mood). */
export function toPulseDTO(row: MoodPulseRecord): PulseDTO {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    mood: (row.mood as MoodName),
    energy: row.energy,
    text: row.text,
    city: row.city,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
  };
}

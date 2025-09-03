import { prisma } from './prisma.js';

/**
 * Deletes expired pulses (expiresAt < now).
 * Safe to run on an interval.
 */
export async function runCleanup(): Promise<{ deleted: number }> {
  const now = new Date();
  const result = await prisma.moodPulse.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  return { deleted: result.count };
}

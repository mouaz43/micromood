import { prisma } from './prisma.js';

export async function cleanExpired() {
  const now = new Date();
  const { count } = await prisma.moodPulse.deleteMany({
    where: { expiresAt: { lte: now } },
  });
  return count;
}

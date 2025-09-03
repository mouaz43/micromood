import { PrismaClient } from '@prisma/client';

export async function purgeExpired(prisma: PrismaClient) {
  const n = await prisma.pulse.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return n.count;
}

export function scheduleJanitor(prisma: PrismaClient) {
  const everyMs = Number(process.env.CLEANUP_EVERY_MS ?? 5 * 60 * 1000);
  setInterval(() => {
    purgeExpired(prisma).catch(() => void 0);
  }, everyMs);
}

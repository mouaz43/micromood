import { PrismaClient } from '@prisma/client';

export async function cleanupExpired(prisma: PrismaClient) {
  const now = new Date();
  const result = await prisma.mood.deleteMany({
    where: { expiresAt: { lt: now } }
  });
  return result.count;
}

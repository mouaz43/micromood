import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.mood.findMany({ where: { deleteToken: null }, select: { id: true } });
  for (const r of rows) {
    await prisma.mood.update({ where: { id: r.id }, data: { deleteToken: crypto.randomUUID() } });
  }
  console.log(`Backfilled ${rows.length} mood(s)`);
}
main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.mood.findMany({
    where: { deleteToken: null },
    select: { id: true },
  });

  for (const row of rows) {
    await prisma.mood.update({
      where: { id: row.id },
      data: { deleteToken: crypto.randomUUID() },
    });
  }

  console.log(`Backfilled ${rows.length} mood(s) with deleteToken.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

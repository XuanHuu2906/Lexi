import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { MAX_EASE, MAX_INTERVAL } from '../src/review/sm2';

// Clamp legacy SRS rows onto the new, tighter scheduling limits so old words
// stop drifting weeks out of the study window:
//   • easeFactor  → capped at MAX_EASE (2.5)
//   • interval    → capped at MAX_INTERVAL (21 days)
//   • nextReviewAt → pulled in to at most now + MAX_INTERVAL days
//
// Idempotent — re-running touches only rows still over a limit.
//
// Run with:      npm run srs:clamp
// Preview only:  DRY_RUN=1 npm run srs:clamp

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() + MAX_INTERVAL * 24 * 60 * 60 * 1000);

  const easeFilter = { easeFactor: { gt: MAX_EASE } };
  const intervalFilter = { interval: { gt: MAX_INTERVAL } };
  const dueFilter = { nextReviewAt: { gt: cutoff } };

  const [easeCount, intervalCount, dueCount] = await Promise.all([
    prisma.srsData.count({ where: easeFilter }),
    prisma.srsData.count({ where: intervalFilter }),
    prisma.srsData.count({ where: dueFilter }),
  ]);

  console.log(`SRS clamp — limits: easeFactor ≤ ${MAX_EASE}, interval ≤ ${MAX_INTERVAL}d`);
  console.log(`  easeFactor > ${MAX_EASE}:        ${easeCount} row(s)`);
  console.log(`  interval  > ${MAX_INTERVAL}d:       ${intervalCount} row(s)`);
  console.log(`  nextReviewAt > +${MAX_INTERVAL}d:   ${dueCount} row(s) (→ ${cutoff.toISOString()})`);

  if (DRY_RUN) {
    console.log('\nDRY_RUN — no changes written.');
    return;
  }

  const [ease, interval, due] = await prisma.$transaction([
    prisma.srsData.updateMany({ where: easeFilter, data: { easeFactor: MAX_EASE } }),
    prisma.srsData.updateMany({ where: intervalFilter, data: { interval: MAX_INTERVAL } }),
    prisma.srsData.updateMany({ where: dueFilter, data: { nextReviewAt: cutoff } }),
  ]);

  console.log('\nUpdated:');
  console.log(`  easeFactor:   ${ease.count}`);
  console.log(`  interval:     ${interval.count}`);
  console.log(`  nextReviewAt: ${due.count}`);
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

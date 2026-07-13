"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const sm2_1 = require("../src/review/sm2");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
async function main() {
    const now = new Date();
    const cutoff = new Date(now.getTime() + sm2_1.MAX_INTERVAL * 24 * 60 * 60 * 1000);
    const easeFilter = { easeFactor: { gt: sm2_1.MAX_EASE } };
    const intervalFilter = { interval: { gt: sm2_1.MAX_INTERVAL } };
    const dueFilter = { nextReviewAt: { gt: cutoff } };
    const [easeCount, intervalCount, dueCount] = await Promise.all([
        prisma.srsData.count({ where: easeFilter }),
        prisma.srsData.count({ where: intervalFilter }),
        prisma.srsData.count({ where: dueFilter }),
    ]);
    console.log(`SRS clamp — limits: easeFactor ≤ ${sm2_1.MAX_EASE}, interval ≤ ${sm2_1.MAX_INTERVAL}d`);
    console.log(`  easeFactor > ${sm2_1.MAX_EASE}:        ${easeCount} row(s)`);
    console.log(`  interval  > ${sm2_1.MAX_INTERVAL}d:       ${intervalCount} row(s)`);
    console.log(`  nextReviewAt > +${sm2_1.MAX_INTERVAL}d:   ${dueCount} row(s) (→ ${cutoff.toISOString()})`);
    if (DRY_RUN) {
        console.log('\nDRY_RUN — no changes written.');
        return;
    }
    const [ease, interval, due] = await prisma.$transaction([
        prisma.srsData.updateMany({ where: easeFilter, data: { easeFactor: sm2_1.MAX_EASE } }),
        prisma.srsData.updateMany({ where: intervalFilter, data: { interval: sm2_1.MAX_INTERVAL } }),
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
//# sourceMappingURL=clamp-srs.js.map
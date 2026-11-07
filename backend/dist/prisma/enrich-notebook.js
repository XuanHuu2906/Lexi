"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const config_1 = require("@nestjs/config");
const ai_service_1 = require("../src/ai/ai.service");
const prisma_service_1 = require("../src/prisma/prisma.service");
const words_service_1 = require("../src/words/words.service");
async function main() {
    const args = process.argv.slice(2);
    let userId = args.find((arg) => arg.startsWith('--user-id='))?.slice(10);
    const email = args.find((arg) => arg.startsWith('--email='))?.slice(8);
    const ids = args
        .find((arg) => arg.startsWith('--ids='))
        ?.slice(6)
        .split(',')
        .filter(Boolean);
    const apply = args.includes('--apply');
    if (apply && !userId && !email)
        throw new Error('--apply requires --user-id=<account ID> or --email=<email>');
    const prisma = new prisma_service_1.PrismaService();
    try {
        if (email) {
            const user = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });
            if (!user || (userId && userId !== user.id))
                throw new Error('Account not found or identifiers disagree');
            userId = user.id;
        }
        const words = await prisma.word.findMany({
            where: {
                ...(userId ? { userId } : {}),
                ...(ids ? { id: { in: ids } } : {}),
            },
            select: {
                id: true,
                userId: true,
                term: true,
                meaning: true,
                examples: true,
                synonyms: true,
                antonyms: true,
            },
            orderBy: { id: 'asc' },
        });
        const missing = (values) => !values.some((value) => value.trim());
        const candidates = words.filter((word) => [word.examples, word.synonyms, word.antonyms].some(missing));
        console.log(JSON.stringify({
            mode: apply ? 'apply' : 'audit',
            scanned: words.length,
            accounts: [...new Set(words.map((word) => word.userId))],
            candidates: candidates.length,
            missingExamples: words.filter((word) => missing(word.examples)).length,
            missingSynonyms: words.filter((word) => missing(word.synonyms)).length,
            missingAntonyms: words.filter((word) => missing(word.antonyms)).length,
        }));
        if (!apply)
            return;
        (0, node_fs_1.mkdirSync)('docs', { recursive: true });
        const backup = (0, node_path_1.join)('docs', `notebook-enrichment-${Date.now()}.local.json`);
        (0, node_fs_1.writeFileSync)(backup, JSON.stringify({ userId, words: candidates }, null, 2), { flag: 'wx' });
        console.log(JSON.stringify({ backup }));
        const service = new words_service_1.WordsService(prisma, new ai_service_1.AiService(new config_1.ConfigService()));
        let updated = 0;
        let failed = 0;
        let unchanged = 0;
        for (let offset = 0; offset < candidates.length; offset += 3) {
            await Promise.all(candidates.slice(offset, offset + 3).map(async (word) => {
                try {
                    const result = await service.enrichMissing(word.userId, word.id);
                    if (result.updated)
                        updated++;
                    else
                        unchanged++;
                }
                catch {
                    failed++;
                }
                console.log(JSON.stringify({
                    processed: updated + unchanged + failed,
                    wordId: word.id,
                    updated,
                    unchanged,
                    failed,
                }));
            }));
        }
        if (failed)
            process.exitCode = 1;
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch(() => {
    console.error('Notebook enrichment failed. Check database/AI configuration; no credentials are logged.');
    process.exitCode = 1;
});
//# sourceMappingURL=enrich-notebook.js.map
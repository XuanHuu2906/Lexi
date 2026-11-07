import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../src/ai/ai.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { WordsService } from '../src/words/words.service';

// Audit by default. Writes require one explicit account; no global bulk edit.
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
    throw new Error(
      '--apply requires --user-id=<account ID> or --email=<email>',
    );
  const prisma = new PrismaService();
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
    const missing = (values: string[]) => !values.some((value) => value.trim());
    const candidates = words.filter((word) =>
      [word.examples, word.synonyms, word.antonyms].some(missing),
    );
    console.log(
      JSON.stringify({
        mode: apply ? 'apply' : 'audit',
        scanned: words.length,
        accounts: [...new Set(words.map((word) => word.userId))],
        candidates: candidates.length,
        missingExamples: words.filter((word) => missing(word.examples)).length,
        missingSynonyms: words.filter((word) => missing(word.synonyms)).length,
        missingAntonyms: words.filter((word) => missing(word.antonyms)).length,
      }),
    );
    if (!apply) return;
    // Keep the exact original content locally for review/recovery. This path is
    // ignored by git; never log connection strings or authentication data.
    mkdirSync('docs', { recursive: true });
    const backup = join('docs', `notebook-enrichment-${Date.now()}.local.json`);
    writeFileSync(
      backup,
      JSON.stringify({ userId, words: candidates }, null, 2),
      { flag: 'wx' },
    );
    console.log(JSON.stringify({ backup }));
    const service = new WordsService(
      prisma,
      new AiService(new ConfigService()),
    );
    let updated = 0;
    let failed = 0;
    let unchanged = 0;
    for (let offset = 0; offset < candidates.length; offset += 3) {
      await Promise.all(
        candidates.slice(offset, offset + 3).map(async (word) => {
          try {
            const result = await service.enrichMissing(word.userId, word.id);
            if (result.updated) updated++;
            else unchanged++;
          } catch {
            failed++;
          }
          console.log(
            JSON.stringify({
              processed: updated + unchanged + failed,
              wordId: word.id,
              updated,
              unchanged,
              failed,
            }),
          );
        }),
      );
    }
    // An empty antonym array can be correct. "unchanged" also covers mismatched
    // senses and concurrent edits, so never claim every empty field was fixed.
    if (failed) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error(
    'Notebook enrichment failed. Check database/AI configuration; no credentials are logged.',
  );
  process.exitCode = 1;
});

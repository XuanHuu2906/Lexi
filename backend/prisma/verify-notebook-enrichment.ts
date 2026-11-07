import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { PrismaService } from '../src/prisma/prisma.service';

type Entry = {
  id: string;
  term: string;
  meaning: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
};

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error('Supply the local backup path');
  const backup = JSON.parse(readFileSync(path, 'utf8')) as {
    userId: string;
    words: Entry[];
  };
  const prisma = new PrismaService();
  try {
    const words = await prisma.word.findMany({
      where: {
        userId: backup.userId,
        id: { in: backup.words.map((word) => word.id) },
      },
      select: {
        id: true,
        term: true,
        meaning: true,
        examples: true,
        synonyms: true,
        antonyms: true,
      },
    });
    const existing = new Map(words.map((word) => [word.id, word]));
    const violations: string[] = [];
    const filled = { examples: 0, synonyms: 0, antonyms: 0 };
    const empty = (values: string[]) => !values.some((value) => value.trim());
    for (const original of backup.words) {
      const word = existing.get(original.id);
      if (
        !word ||
        word.term !== original.term ||
        word.meaning !== original.meaning
      ) {
        violations.push(original.id);
        continue;
      }
      for (const key of ['examples', 'synonyms', 'antonyms'] as const) {
        if (
          !empty(original[key]) &&
          JSON.stringify(original[key]) !== JSON.stringify(word[key])
        ) {
          violations.push(`${original.id}:${key}`);
        }
        if (empty(original[key]) && !empty(word[key])) filled[key]++;
      }
    }
    const summary = {
      checked: words.length,
      filled,
      preservedExistingContent: violations.length === 0,
      remainingWithoutExamples: words
        .filter((word) => empty(word.examples))
        .map((word) => word.term),
      remainingWithoutSynonyms: words
        .filter((word) => empty(word.synonyms))
        .map((word) => word.term),
      remainingWithoutAntonyms: words.filter((word) => empty(word.antonyms))
        .length,
    };
    writeFileSync(
      path.replace(/\.local\.json$/, '.verified.local.json'),
      JSON.stringify({ summary, violations, words }, null, 2),
    );
    console.log(JSON.stringify(summary));
    if (violations.length) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error(
    'Could not verify notebook enrichment. Check the backup path and database configuration.',
  );
  process.exitCode = 1;
});

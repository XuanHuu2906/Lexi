import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Imports the TOEIC reference wordlist (prisma/data/toeic-vocab.csv) into the
// `toeic_words` table. Idempotent: safe to re-run after adding new rows to the
// CSV — new terms are inserted, and a term that already exists has its meaning
// (and pos) MERGED rather than overwritten, so multiple senses of the same word
// accumulate into one row instead of clobbering each other. Re-importing the
// same row is a no-op because merge de-duplicates blocks case-insensitively.
//
// Run with:  npm run db:seed:toeic
// CSV columns: word,pos,ipa,meaning

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const CSV_PATH = path.join(__dirname, 'data', 'toeic-vocab.csv');

/** Parse one CSV line into fields, honouring double-quoted values with commas. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'; // escaped quote ""
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/** Normalize a surface word into the lookup key: lowercase, trim, drop trailing "(...)". */
function normalizeTerm(word: string): string {
  return word
    .replace(/\(.*?\)/g, '') // "assurance (n, v)" -> "assurance "
    .trim()
    .toLowerCase();
}

/**
 * Union two field values, treating each as a set of ";"-separated blocks.
 * Blocks are de-duplicated case-insensitively so re-importing the same row is a
 * no-op. Existing blocks come first; new ones are appended. Used to accumulate
 * multiple senses of one word (e.g. "ngân hàng" + "bờ sông") into a single cell.
 */
function mergeField(existing: string | null, incoming: string | null): string | null {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const src of [existing, incoming]) {
    if (!src) continue;
    for (const raw of src.split(';')) {
      const block = raw.trim();
      if (!block) continue;
      const key = block.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      parts.push(block);
    }
  }
  return parts.length ? parts.join('; ') : null;
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, ''); // strip BOM
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Skip the header row (word,pos,ipa,meaning).
  const rows = lines.slice(1);

  // Collapse duplicate terms within the file, merging (not overwriting) their
  // meanings/pos so a word listed twice with different senses keeps both.
  const byTerm = new Map<
    string,
    { term: string; display: string; pos: string | null; ipa: string | null; meaning: string | null }
  >();

  let skipped = 0;
  for (const line of rows) {
    const [word = '', pos = '', ipa = '', meaning = ''] = parseCsvLine(line);
    const display = word.trim();
    const term = normalizeTerm(word);
    if (!term) {
      skipped++;
      continue;
    }
    const prev = byTerm.get(term);
    byTerm.set(term, {
      term,
      // Keep the first non-empty surface form / ipa; merge the multi-valued fields.
      display: prev?.display || display,
      pos: mergeField(prev?.pos ?? null, pos.trim() || null),
      ipa: prev?.ipa || (ipa.trim() || null),
      meaning: mergeField(prev?.meaning ?? null, meaning.trim() || null),
    });
  }

  let created = 0;
  let updated = 0;
  for (const rec of byTerm.values()) {
    // Read the existing row so we can merge into (not clobber) prior senses.
    const existing = await prisma.toeicWord.findUnique({
      where: { term: rec.term },
      select: { pos: true, ipa: true, display: true, meaning: true },
    });
    if (existing) {
      await prisma.toeicWord.update({
        where: { term: rec.term },
        data: {
          display: existing.display || rec.display,
          pos: mergeField(existing.pos, rec.pos),
          ipa: existing.ipa || rec.ipa,
          meaning: mergeField(existing.meaning, rec.meaning),
        },
      });
      updated++;
    } else {
      await prisma.toeicWord.create({ data: rec });
      created++;
    }
  }

  const total = await prisma.toeicWord.count();
  console.log(
    `TOEIC wordlist import done — parsed ${rows.length} rows, ` +
      `${byTerm.size} unique terms (${skipped} skipped). ` +
      `${created} inserted, ${updated} merged/updated. Table total: ${total}.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

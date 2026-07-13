"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const CSV_PATH = path.join(__dirname, 'data', 'toeic-vocab.csv');
function parseCsvLine(line) {
    const fields = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    cur += '"';
                    i++;
                }
                else {
                    inQuotes = false;
                }
            }
            else {
                cur += ch;
            }
        }
        else if (ch === '"') {
            inQuotes = true;
        }
        else if (ch === ',') {
            fields.push(cur);
            cur = '';
        }
        else {
            cur += ch;
        }
    }
    fields.push(cur);
    return fields;
}
function normalizeTerm(word) {
    return word
        .replace(/\(.*?\)/g, '')
        .trim()
        .toLowerCase();
}
function mergeField(existing, incoming) {
    const seen = new Set();
    const parts = [];
    for (const src of [existing, incoming]) {
        if (!src)
            continue;
        for (const raw of src.split(';')) {
            const block = raw.trim();
            if (!block)
                continue;
            const key = block.toLowerCase();
            if (seen.has(key))
                continue;
            seen.add(key);
            parts.push(block);
        }
    }
    return parts.length ? parts.join('; ') : null;
}
async function main() {
    const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows = lines.slice(1);
    const byTerm = new Map();
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
            display: prev?.display || display,
            pos: mergeField(prev?.pos ?? null, pos.trim() || null),
            ipa: prev?.ipa || (ipa.trim() || null),
            meaning: mergeField(prev?.meaning ?? null, meaning.trim() || null),
        });
    }
    let created = 0;
    let updated = 0;
    for (const rec of byTerm.values()) {
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
        }
        else {
            await prisma.toeicWord.create({ data: rec });
            created++;
        }
    }
    const total = await prisma.toeicWord.count();
    console.log(`TOEIC wordlist import done — parsed ${rows.length} rows, ` +
        `${byTerm.size} unique terms (${skipped} skipped). ` +
        `${created} inserted, ${updated} merged/updated. Table total: ${total}.`);
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
//# sourceMappingURL=seed-toeic.js.map
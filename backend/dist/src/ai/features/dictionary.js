"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDictionarySpec = buildDictionarySpec;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'term',
        'partOfSpeech',
        'phonetic',
        'meaning',
        'meaningEn',
        'examples',
        'synonyms',
        'antonyms',
        'contextNote',
    ],
    properties: {
        term: { type: 'string' },
        partOfSpeech: { type: 'string' },
        phonetic: { type: 'string' },
        meaning: { type: 'string' },
        meaningEn: { type: 'string' },
        examples: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['en', 'vi'],
                properties: { en: { type: 'string' }, vi: { type: 'string' } },
            },
        },
        synonyms: { type: 'array', items: { type: 'string' } },
        antonyms: { type: 'array', items: { type: 'string' } },
        contextNote: { type: 'string' },
    },
};
function buildDictionarySpec(term, opts = {}) {
    const level = opts.level ?? 'B1';
    return {
        system: `You are a bidirectional English–Vietnamese dictionary for a learner at CEFR level ${level}. ` +
            `The input may be an English word/phrase OR a Vietnamese word/phrase. ` +
            `If the input is Vietnamese, treat it as a request for the English equivalent: set "term" to the ` +
            `most natural English word/phrase for it, and base every other field (phonetic, part of speech, ` +
            `definition, examples, synonyms, antonyms) on that English word. ` +
            `If the input is already English, set "term" to that English word. ` +
            `Always provide: "term" (the English headword), the Vietnamese meaning, IPA phonetic, part of speech, ` +
            `a concise English definition, 2–3 example sentences (English + Vietnamese translation), ` +
            `common synonyms and antonyms, and a short usage/context note in Vietnamese. ` +
            `If the term is misspelled, use the most likely intended word and mention the correction in the context note. ` +
            `Leave a field as an empty string or empty array when not applicable.`,
        messages: [{ role: 'user', content: `Tra từ: "${term}"` }],
        schema,
        effort: 'low',
        maxTokens: 1024,
    };
}
//# sourceMappingURL=dictionary.js.map
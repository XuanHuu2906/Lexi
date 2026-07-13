"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExamplesSpec = buildExamplesSpec;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['word', 'examples'],
    properties: {
        word: { type: 'string' },
        examples: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['en', 'vi'],
                properties: { en: { type: 'string' }, vi: { type: 'string' } },
            },
        },
    },
};
function buildExamplesSpec(word, opts = {}) {
    const count = opts.count ?? 3;
    const topics = opts.topics?.length ? opts.topics.join(', ') : 'daily life';
    const ctx = opts.meaning ? ` (nghĩa: ${opts.meaning})` : '';
    return {
        system: `You write example sentences that help a Vietnamese learner remember a word. ` +
            `Produce ${count} natural example sentences using the target word, themed around the learner's favourite topics: ${topics}. ` +
            `Each sentence must include an English sentence and its Vietnamese translation. Keep them clear and level-appropriate.`,
        messages: [{ role: 'user', content: `Từ: "${word}"${ctx}` }],
        schema,
        effort: 'low',
        maxTokens: 768,
    };
}
//# sourceMappingURL=examples.js.map
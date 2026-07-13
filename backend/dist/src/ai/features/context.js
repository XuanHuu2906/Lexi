"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContextSpec = buildContextSpec;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['highlights', 'note'],
    properties: {
        highlights: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['word', 'meaning', 'reason'],
                properties: {
                    word: { type: 'string' },
                    meaning: { type: 'string' },
                    reason: { type: 'string' },
                },
            },
        },
        note: { type: 'string' },
    },
};
function buildContextSpec(passage, opts = {}) {
    const level = opts.level ?? 'B1';
    return {
        system: `You help a Vietnamese learner (CEFR ${level}) read authentic text. ` +
            `CEFR levels run A1 < A2 < B1 < B2 < C1 < C2. ` +
            `Identify the words or phrases whose difficulty is at the learner's level (${level}) or above — i.e. words ` +
            `a ${level} learner is only just ready for, or that are harder than ${level}. ` +
            `Skip anything below ${level} (words the learner already knows). ` +
            `Give each a short Vietnamese meaning and a brief reason. If nothing is at or above the level, return an ` +
            `empty highlights array and say so in "note".`,
        messages: [{ role: 'user', content: passage }],
        schema,
        effort: 'medium',
        maxTokens: 4096,
    };
}
//# sourceMappingURL=context.js.map
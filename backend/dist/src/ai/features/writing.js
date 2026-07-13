"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWritingSpec = buildWritingSpec;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['correctedText', 'issues', 'overallComment', 'score'],
    properties: {
        correctedText: { type: 'string' },
        issues: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['original', 'correction', 'explanation', 'type'],
                properties: {
                    original: { type: 'string' },
                    correction: { type: 'string' },
                    explanation: { type: 'string' },
                    type: { type: 'string' },
                },
            },
        },
        overallComment: { type: 'string' },
        score: { type: 'number' },
    },
};
function buildWritingSpec(text) {
    return {
        system: `You are an English writing tutor for Vietnamese learners. Grade the submitted passage. ` +
            `Return the fully corrected version, a list of specific issues (original span, correction, a Vietnamese ` +
            `explanation, and an issue type), an overall comment in Vietnamese, and a score from 0 to 10. ` +
            `Be encouraging and precise; do not rewrite beyond what improves correctness and natural phrasing.`,
        messages: [{ role: 'user', content: text }],
        schema,
        effort: 'medium',
        thinking: true,
        maxTokens: 2048,
    };
}
//# sourceMappingURL=writing.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuizSpec = buildQuizSpec;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['questions'],
    properties: {
        questions: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['term', 'question', 'options', 'answerIndex', 'explanation'],
                properties: {
                    term: { type: 'string' },
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    answerIndex: { type: 'integer' },
                    explanation: { type: 'string' },
                },
            },
        },
    },
};
function buildQuizSpec(words) {
    const list = words.map((w) => `${w.term} = ${w.meaning}`).join('\n');
    return {
        system: `You create a multiple-choice vocabulary quiz for a Vietnamese learner. ` +
            `For each provided word, write one question with exactly 4 options and a single correct answer ` +
            `(set "answerIndex" to the 0-based index of the correct option). Vary the question style (meaning, ` +
            `usage in a sentence, synonym). Add a short Vietnamese explanation. Return one question per word.`,
        messages: [{ role: 'user', content: `Danh sách từ:\n${list}` }],
        schema,
        effort: 'low',
        maxTokens: 2048,
    };
}
//# sourceMappingURL=quiz.js.map
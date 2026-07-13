"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDictationSentencesSpec = buildDictationSentencesSpec;
exports.buildDictationFeedbackSpec = buildDictationFeedbackSpec;
const sentencesSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['sentences'],
    properties: {
        sentences: { type: 'array', items: { type: 'string' } },
    },
};
function buildDictationSentencesSpec(opts = {}) {
    const count = opts.count ?? 8;
    const level = opts.level ?? 'B1';
    const topics = opts.topics?.length ? opts.topics.join(', ') : 'daily life';
    return {
        system: `You write English sentences for a listen-and-type (dictation) exercise. ` +
            `Produce exactly ${count} natural, self-contained sentences suitable for CEFR level ${level}, ` +
            `themed around these topics when possible: ${topics}. ` +
            `Each sentence should be comfortable to hear and transcribe: roughly 6–14 words, everyday vocabulary and grammar for the level. ` +
            `Do not number the sentences, add quotes, or include any commentary — return one sentence per array element.`,
        messages: [
            {
                role: 'user',
                content: `Sinh ${count} câu tiếng Anh cấp độ ${level} về chủ đề: ${topics}.`,
            },
        ],
        schema: sentencesSchema,
        effort: 'low',
        maxTokens: 1024,
    };
}
const feedbackSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['feedback'],
    properties: {
        feedback: { type: 'string' },
    },
};
function buildDictationFeedbackSpec(reference, attempt) {
    return {
        system: `You help a Vietnamese learner who is doing an English dictation exercise. ` +
            `Compare their typed attempt ("Attempt") against the correct sentence ("Reference"). ` +
            `Write 1–3 short sentences IN VIETNAMESE that point out the specific words they missed or got wrong, ` +
            `and give a concrete tip (spelling, grammar, or catching a final sound while listening). ` +
            `Base everything only on the two sentences given — do not invent content. Be concise and encouraging.`,
        messages: [
            {
                role: 'user',
                content: `Reference: ${reference}\nAttempt: ${attempt}`,
            },
        ],
        schema: feedbackSchema,
        effort: 'low',
        maxTokens: 400,
    };
}
//# sourceMappingURL=dictation.js.map
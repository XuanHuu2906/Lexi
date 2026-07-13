"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTutorSpec = buildTutorSpec;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['answer', 'words', 'grammar'],
    properties: {
        answer: { type: 'string' },
        words: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['term', 'meaning'],
                properties: {
                    term: { type: 'string' },
                    meaning: { type: 'string' },
                },
            },
        },
        grammar: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'rule'],
                properties: {
                    title: { type: 'string' },
                    rule: { type: 'string' },
                },
            },
        },
    },
};
const SYSTEM = 'You are Lexi, a friendly and knowledgeable tutor for a Vietnamese English learner. ' +
    'The learner may ask about anything — a concept, general knowledge, vocabulary, ' +
    'or how to express an idea. Explain clearly and concisely with concrete examples. ' +
    'Reply in the same language the learner writes in (Vietnamese question → answer in Vietnamese; ' +
    'English question → answer in English, which also gives them reading practice). ' +
    'Whenever you mention an English word or phrase worth learning, keep it in English so it sticks. ' +
    'If a question is ambiguous, ask a brief clarifying question. ' +
    'Maintain the context of the ongoing conversation.\n\n' +
    'Put the full reply (markdown allowed) in "answer". ' +
    'Then, FROM YOUR OWN ANSWER, extract the takeaways the learner should save:\n' +
    '- "words": English vocabulary/phrases worth learning that appear in your answer, each as ' +
    '{ term (the English word/phrase), meaning (a short Vietnamese gloss) }.\n' +
    '- "grammar": English grammar or usage points worth keeping, each as ' +
    '{ title (a short label), rule (a clean, GENERALISED restatement of the point, not tied to the specific example) }.\n' +
    'Only include genuinely useful, learnable items. Return EMPTY arrays when there is nothing worth saving ' +
    '(small talk, a clarifying question, or a non-language topic with no English word/grammar takeaway). ' +
    'Never invent items that are not grounded in your answer.';
function buildTutorSpec(history, question) {
    return {
        system: SYSTEM,
        messages: [
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: question },
        ],
        schema,
        effort: 'medium',
        thinking: true,
        maxTokens: 1536,
    };
}
//# sourceMappingURL=tutor.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConversationOpenSpec = buildConversationOpenSpec;
exports.buildConversationTurnSpec = buildConversationTurnSpec;
exports.buildConversationSummarySpec = buildConversationSummarySpec;
function buildConversationOpenSpec(scenario) {
    return {
        system: `You role-play a real-life English conversation to help a Vietnamese learner practise. ` +
            `Scenario: ${scenario}. Open the conversation naturally and in character with a short English line ` +
            `(one or two sentences) that invites the learner to respond. Output only that line.`,
        messages: [{ role: 'user', content: 'Please start the conversation.' }],
        effort: 'low',
        maxTokens: 256,
    };
}
const turnSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['reply', 'feedback', 'suggestion'],
    properties: {
        reply: { type: 'string' },
        feedback: { type: 'string' },
        suggestion: { type: 'string' },
    },
};
function buildConversationTurnSpec(scenario, history, userMessage) {
    return {
        system: `You role-play a real-life English conversation to help a Vietnamese learner practise. ` +
            `Scenario: ${scenario}. Stay in character and keep the conversation going with "reply". ` +
            `In "feedback", give short Vietnamese feedback on the learner's latest message (grammar, word choice, naturalness). ` +
            `In "suggestion", offer a more natural English phrasing of their message, or an empty string if it was already good.`,
        messages: [
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
        ],
        schema: turnSchema,
        effort: 'medium',
        maxTokens: 1024,
    };
}
const summarySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['strengths', 'weaknesses', 'overall'],
    properties: {
        strengths: { type: 'string' },
        weaknesses: { type: 'string' },
        overall: { type: 'string' },
    },
};
function buildConversationSummarySpec(scenario, transcript) {
    const text = transcript
        .map((m) => `${m.role === 'user' ? 'Learner' : 'Partner'}: ${m.content}`)
        .join('\n');
    return {
        system: `You are an English coach summarising a completed role-play (scenario: ${scenario}). ` +
            `From the transcript, summarise the learner's strengths and weaknesses and give an overall encouraging assessment. ` +
            `Write all three fields in Vietnamese.`,
        messages: [{ role: 'user', content: text }],
        schema: summarySchema,
        effort: 'medium',
        maxTokens: 1024,
    };
}
//# sourceMappingURL=conversation.js.map
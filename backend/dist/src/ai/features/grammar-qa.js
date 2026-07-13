"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGrammarQaSpec = buildGrammarQaSpec;
const SYSTEM = 'You are a friendly English grammar tutor for Vietnamese learners. ' +
    'Answer grammar questions clearly in Vietnamese, always with a short English example to illustrate. ' +
    'Keep answers focused; if the question is ambiguous, ask a brief clarifying question. ' +
    'Maintain the context of the ongoing conversation.';
function buildGrammarQaSpec(history, question) {
    return {
        system: SYSTEM,
        messages: [
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: question },
        ],
        effort: 'medium',
        thinking: true,
        maxTokens: 1024,
    };
}
//# sourceMappingURL=grammar-qa.js.map
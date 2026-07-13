"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPronunciationSpec = buildPronunciationSpec;
exports.buildPronunciationFeedbackSpec = buildPronunciationFeedbackSpec;
exports.buildAzureFeedbackFallback = buildAzureFeedbackFallback;
const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['score', 'transcriptHeard', 'mispronounced', 'feedback'],
    properties: {
        score: { type: 'number' },
        transcriptHeard: { type: 'string' },
        mispronounced: { type: 'array', items: { type: 'string' } },
        feedback: { type: 'string' },
    },
};
function buildPronunciationSpec(reference, recognized) {
    return {
        system: `You assess a Vietnamese learner's English pronunciation. Compare what was recognised from their speech ` +
            `("Heard") against the target sentence ("Target"). Return a 0–100 accuracy score, the recognised transcript, ` +
            `the list of words that were missed or likely mispronounced, and short Vietnamese feedback with concrete tips. ` +
            `Judge by word/sound differences between Heard and Target.`,
        messages: [
            { role: 'user', content: `Target: ${reference}\nHeard: ${recognized}` },
        ],
        schema,
        effort: 'low',
        maxTokens: 768,
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
function buildPronunciationFeedbackSpec(reference, a) {
    const problems = a.words
        .filter((w) => w.errorType !== 'None' || w.accuracy < 70)
        .map((w) => `${w.word} (accuracy ${Math.round(w.accuracy)}, ${w.errorType})`)
        .join('; ') || 'none';
    return {
        system: `You are a warm, encouraging English pronunciation coach for a Vietnamese learner. ` +
            `You are given OBJECTIVE pronunciation scores (0–100) from Azure Speech plus the list of problem words. ` +
            `Write 1–3 short sentences of feedback IN VIETNAMESE: first praise what went well, then give concrete, ` +
            `actionable tips for the problem words/sounds (which sound to fix, a quick mouth/tongue hint). ` +
            `Base everything only on the data given — do not invent or restate the numeric scores.`,
        messages: [
            {
                role: 'user',
                content: `Target sentence: ${reference}\n` +
                    `Recognised: ${a.transcript}\n` +
                    `Accuracy: ${Math.round(a.accuracy)}, Fluency: ${Math.round(a.fluency)}, ` +
                    `Completeness: ${Math.round(a.completeness)}, Overall: ${Math.round(a.pronunciation)}\n` +
                    `Problem words: ${problems}`,
            },
        ],
        schema: feedbackSchema,
        effort: 'low',
        maxTokens: 400,
    };
}
function buildAzureFeedbackFallback(a, mispronounced) {
    const parts = [
        `Điểm phát âm ${Math.round(a.pronunciation)}/100 ` +
            `(độ chính xác ${Math.round(a.accuracy)}, độ trôi chảy ${Math.round(a.fluency)}).`,
    ];
    if (mispronounced.length) {
        parts.push(`Cần luyện thêm: ${mispronounced.join(', ')}.`);
    }
    else {
        parts.push('Phát âm rất tốt, tiếp tục phát huy!');
    }
    return parts.join(' ');
}
//# sourceMappingURL=pronunciation.js.map
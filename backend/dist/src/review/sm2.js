"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_EASE = exports.MAX_INTERVAL = void 0;
exports.sm2 = sm2;
const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_INTERVAL = 1;
const SECOND_INTERVAL = 3;
const INTERVAL_MODIFIER = 0.7;
exports.MAX_INTERVAL = 21;
const MIN_EASE = 1.3;
exports.MAX_EASE = 2.5;
function sm2(prev, quality, now = new Date()) {
    const q = Math.max(0, Math.min(5, Math.round(quality)));
    let { interval, easeFactor, repetitions } = prev;
    if (q < 3) {
        repetitions = 0;
        interval = FIRST_INTERVAL;
    }
    else {
        if (repetitions === 0) {
            interval = FIRST_INTERVAL;
        }
        else if (repetitions === 1) {
            interval = SECOND_INTERVAL;
        }
        else {
            interval = Math.round(interval * easeFactor * INTERVAL_MODIFIER);
        }
        repetitions += 1;
    }
    interval = Math.min(interval, exports.MAX_INTERVAL);
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(MIN_EASE, Math.min(exports.MAX_EASE, easeFactor));
    easeFactor = Math.round(easeFactor * 100) / 100;
    const nextReviewAt = new Date(now.getTime() + interval * DAY_MS);
    return { interval, easeFactor, repetitions, nextReviewAt };
}
//# sourceMappingURL=sm2.js.map
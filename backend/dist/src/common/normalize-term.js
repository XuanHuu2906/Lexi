"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTerm = normalizeTerm;
function normalizeTerm(word) {
    return word
        .replace(/\(.*?\)/g, '')
        .trim()
        .toLowerCase();
}
//# sourceMappingURL=normalize-term.js.map
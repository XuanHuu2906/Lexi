"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LOOKUP_TERMS = void 0;
exports.parseLookupTerms = parseLookupTerms;
exports.MAX_LOOKUP_TERMS = 8;
const OPTION_LABEL = /^[([{]?(?:[A-Za-z]|\d{1,2})[)\].]?$/;
const OPTION_PREFIX = /^[([{]?(?:[A-Za-z]|\d{1,2})[)\].}]\s*/;
const VIETNAMESE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const SEPARATORS = /[\n\r,;|/\t]+/;
function cleanWord(token) {
    return token
        .replace(OPTION_PREFIX, '')
        .replace(/^[^A-Za-z]+/, '')
        .replace(/[^A-Za-z'-]+$/, '')
        .trim();
}
function letterCount(chunk) {
    return (chunk.match(/\p{L}/gu) ?? []).length;
}
function push(out, seen, term) {
    const key = term.toLowerCase();
    if (seen.has(key))
        return true;
    seen.add(key);
    out.push(term);
    return out.length < exports.MAX_LOOKUP_TERMS;
}
function parseLookupTerms(raw) {
    if (!raw)
        return [];
    const terms = [];
    const seen = new Set();
    if (VIETNAMESE.test(raw)) {
        for (const chunk of raw.split(SEPARATORS)) {
            const phrase = chunk.trim();
            if (letterCount(phrase) < 2)
                continue;
            if (!push(terms, seen, phrase))
                break;
        }
        return terms;
    }
    const tokens = raw
        .split(SEPARATORS)
        .flatMap((chunk) => chunk.trim().split(/\s+/))
        .filter(Boolean);
    const markerCount = tokens.filter((t) => OPTION_PREFIX.test(t)).length;
    if (markerCount >= 2) {
        let phrase = [];
        const flush = () => {
            const joined = phrase.join(' ').trim();
            phrase = [];
            if (letterCount(joined) < 2)
                return true;
            return push(terms, seen, joined);
        };
        for (const token of tokens) {
            if (OPTION_PREFIX.test(token)) {
                if (!flush())
                    break;
                const glued = cleanWord(token);
                if (glued)
                    phrase.push(glued);
            }
            else {
                const word = cleanWord(token);
                if (word)
                    phrase.push(word);
            }
        }
        flush();
        return terms;
    }
    const chunks = raw
        .split(SEPARATORS)
        .map((c) => c.trim())
        .filter(Boolean);
    const units = chunks.length >= 2 ? chunks : (chunks[0] ?? '').split(/\s+/).filter(Boolean);
    for (const unit of units) {
        if (OPTION_LABEL.test(unit))
            continue;
        const term = cleanWord(unit);
        if (letterCount(term) < 2)
            continue;
        if (!push(terms, seen, term))
            break;
    }
    return terms;
}
//# sourceMappingURL=parse-lookup-terms.js.map
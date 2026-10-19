import Foundation

struct TutorResult: Decodable, Sendable {
    struct SavableWord: Decodable, Sendable { let term: String; let meaning: String }
    struct SavableGrammar: Decodable, Sendable { let title: String; let rule: String }
    let answer: String
    let words: [SavableWord]
    let grammar: [SavableGrammar]

    private enum CodingKeys: String, CodingKey { case answer, words, grammar }
    init(answer: String, words: [SavableWord] = [], grammar: [SavableGrammar] = []) {
        self.answer = answer; self.words = words; self.grammar = grammar
    }
    init(from decoder: any Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        answer = try values.decode(String.self, forKey: .answer)
        words = try values.decodeIfPresent([SavableWord].self, forKey: .words) ?? []
        grammar = try values.decodeIfPresent([SavableGrammar].self, forKey: .grammar) ?? []
    }
}
struct WritingResult: Decodable, Sendable {
    struct Issue: Decodable, Sendable { let original: String; let correction: String; let explanation: String; let type: String }
    let correctedText: String
    let issues: [Issue]
    let overallComment: String
    let score: Double
}
struct GrammarQaResult: Decodable, Sendable { let answer: String }
struct PronunciationResult: Decodable, Sendable {
    let score: Double
    let transcriptHeard: String
    let mispronounced: [String]
    let feedback: String
}
struct BilingualExample: Decodable, Sendable { let en: String; let vi: String }
struct LookupResult: Decodable, Sendable {
    let term: String
    let partOfSpeech: String
    let phonetic: String
    let meaning: String
    let meaningEn: String
    let examples: [BilingualExample]
    let synonyms: [String]
    let antonyms: [String]
    let contextNote: String
}
struct BatchLookupResult: Decodable, Sendable {
    struct Item: Decodable, Sendable { let term: String; let result: LookupResult?; let error: String? }
    let items: [Item]
}
struct VerifyWordResult: Decodable, Sendable {
    let isValid: Bool
    let correctedTerm: String
    let meaningVerdict: String
    let partOfSpeech: String
    let phonetic: String
    let meaning: String
    let meaningEn: String
    let examples: [BilingualExample]
    let synonyms: [String]
    let antonyms: [String]
    let contextNote: String
}

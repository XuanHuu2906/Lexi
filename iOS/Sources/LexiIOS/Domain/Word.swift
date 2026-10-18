import Foundation

enum BackendWordStatus: String, Codable, Sendable { case new = "NEW", learning = "LEARNING", mastered = "MASTERED" }
enum WordStatus: String, Codable, Sendable { case new, due, learned }

struct SRSData: Decodable, Sendable, Equatable {
    let interval: Int
    let easeFactor: Double
    let repetitions: Int
    let lastQuality: Int?
    let lastReviewedAt: String?
    let nextReviewAt: String
}

struct BackendWordDTO: Decodable, Sendable, Equatable {
    let id: String
    let term: String
    let meaning: String
    let phonetic: String?
    let partOfSpeech: String?
    let examples: [String]
    let synonyms: [String]
    let antonyms: [String]
    let topic: String?
    let note: String?
    let status: BackendWordStatus
    let createdAt: String
    let srsData: SRSData?

    func toWord() -> Word {
        let mapped: WordStatus
        switch status { case .new: mapped = .new; case .learning: mapped = .due; case .mastered: mapped = .learned }
        return Word(id: id, word: term, meaning: meaning, phonetic: phonetic, pos: partOfSpeech,
                    status: mapped, topic: topic, examples: examples, synonyms: synonyms,
                    antonyms: antonyms, note: note, createdAt: createdAt, nextReviewAt: srsData?.nextReviewAt)
    }
}

struct Word: Sendable, Equatable, Identifiable {
    let id: String
    let word: String
    let meaning: String
    let phonetic: String?
    let pos: String?
    // 'due' is the web-compatible display status; never infer a due date from it.
    let status: WordStatus
    let topic: String?
    let examples: [String]
    let synonyms: [String]
    let antonyms: [String]
    let note: String?
    let createdAt: String
    let nextReviewAt: String?
}

struct WordInput: Sendable, Equatable {
    var word: String
    var meaning: String
    var phonetic: String? = nil
    var pos: String? = nil
    var topic: String? = nil
    var note: String? = nil
    var examples: [String]? = nil
    var synonyms: [String]? = nil
    var antonyms: [String]? = nil

    func toDTO() -> WordInputDTO {
        WordInputDTO(term: word, meaning: meaning, phonetic: phonetic, partOfSpeech: pos,
                     topic: topic, note: note, examples: examples, synonyms: synonyms, antonyms: antonyms)
    }
}

// Optional create fields are omitted, matching fromWord on web. Empty values stay empty.
struct WordInputDTO: Codable, Sendable, Equatable {
    let term: String
    let meaning: String
    let phonetic: String?
    let partOfSpeech: String?
    let topic: String?
    let note: String?
    let examples: [String]?
    let synonyms: [String]?
    let antonyms: [String]?

    func toInput() -> WordInput {
        WordInput(word: term, meaning: meaning, phonetic: phonetic, pos: partOfSpeech,
                  topic: topic, note: note, examples: examples, synonyms: synonyms, antonyms: antonyms)
    }
}

struct Paginated<Item: Decodable & Sendable>: Decodable, Sendable {
    let items: [Item]
    let total: Int
    let page: Int
    let limit: Int
}

struct WordPage: Sendable {
    let items: [Word]
    let total: Int
    let page: Int
    let limit: Int
}

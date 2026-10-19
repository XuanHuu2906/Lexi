import Foundation

enum ReviewRating: String, Encodable, Sendable { case forgot, hard, good, easy }
struct DueReviewsDTO: Decodable, Sendable {
    let items: [BackendWordDTO]
    let count: Int
    let total: Int
}
struct DueReviews: Sendable { let items: [Word]; let count: Int; let total: Int }
struct ReviewAnswerResult: Decodable, Sendable {
    let srsData: SRSData
    let status: BackendWordStatus
    let nextReviewAt: String
}

enum FlashcardMode: String, Codable, Sendable { case guess, listen, fill, match }
enum FlashcardScope: String, Codable, Sendable { case due, today }
struct FlashcardSet: Decodable, Sendable {
    struct Card: Decodable, Sendable {
        let wordId: String
        let term: String
        let meaning: String
        let phonetic: String?
        let examples: [String]
        let options: [String]?
        let answerIndex: Int?
        let cloze: String?
    }
    let mode: FlashcardMode
    let scope: FlashcardScope
    let count: Int
    let cards: [Card]
    // Client-only indicator: the backend JSON has no offline property.
    let offline: Bool

    init(mode: FlashcardMode, scope: FlashcardScope, count: Int, cards: [Card],
         offline: Bool = false) {
        self.mode = mode; self.scope = scope; self.count = count
        self.cards = cards; self.offline = offline
    }

    private enum CodingKeys: String, CodingKey { case mode, scope, count, cards }
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        mode = try container.decode(FlashcardMode.self, forKey: .mode)
        scope = try container.decode(FlashcardScope.self, forKey: .scope)
        count = try container.decode(Int.self, forKey: .count)
        cards = try container.decode([Card].self, forKey: .cards)
        offline = false
    }
}

struct QuizQuestion: Decodable, Sendable {
    let index: Int
    let term: String
    let question: String
    let options: [String]
    // Missing on generate, null when unanswered on resume, value after answering.
    let userAnswer: JSONField<Int>
    let answerIndex: Int?
    let explanation: String?
    enum CodingKeys: String, CodingKey { case index, term, question, options, userAnswer, answerIndex, explanation }
    init(from decoder: any Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        index = try c.decode(Int.self, forKey: .index)
        term = try c.decode(String.self, forKey: .term)
        question = try c.decode(String.self, forKey: .question)
        options = try c.decode([String].self, forKey: .options)
        userAnswer = try c.field(Int.self, forKey: .userAnswer)
        answerIndex = try c.decodeIfPresent(Int.self, forKey: .answerIndex)
        explanation = try c.decodeIfPresent(String.self, forKey: .explanation)
    }
}
struct GeneratedQuiz: Decodable, Sendable { let quizId: String; let total: Int; let questions: [QuizQuestion] }
enum QuizStatus: String, Decodable, Sendable { case inProgress = "IN_PROGRESS", completed = "COMPLETED" }
struct QuizState: Decodable, Sendable {
    let quizId: String
    let total: Int
    let score: Int
    let status: QuizStatus
    let questions: [QuizQuestion]
}
struct QuizResult: Decodable, Sendable {
    struct Answer: Decodable, Sendable {
        let index: Int
        let correct: Bool
        let yourAnswer: Int
        let answerIndex: Int
        let explanation: String
    }
    let quizId: String
    let score: Int
    let total: Int
    let results: [Answer]
}

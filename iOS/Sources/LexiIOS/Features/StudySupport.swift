import Foundation

protocol ReviewServing: Sendable {
    func due(limit: Int) async throws -> DueReviews
    func answer(wordID: String, rating: ReviewRating) async throws -> ReviewAnswerResult
    func flashcards(mode: FlashcardMode, scope: FlashcardScope, limit: Int) async throws -> FlashcardSet
}
extension ReviewAPI: ReviewServing {}

protocol QuizServing: Sendable {
    func generate(count: Int) async throws -> GeneratedQuiz
    func latest() async throws -> LatestQuiz
    func get(id: String) async throws -> QuizState
    func saveProgress(id: String, answers: [Int]) async throws -> SavedResult
    func submit(id: String, answers: [Int]) async throws -> QuizResult
}
extension QuizAPI: QuizServing {}
struct LatestQuiz: Decodable, Sendable { let quiz: QuizState? }

// No credentials or vocabulary are stored here. Scope by API origin AND account.
// The review marker is written BEFORE POST so a process death cannot replay it.
@MainActor
final class StudyCheckpointStore {
    struct QuizDraft: Codable {
        var id: String
        var answers: [Int]
        var dirty: Bool
        var uncertainSubmission: Bool
    }
    struct Checkpoint: Codable {
        var uncertainReviews: [String: String] = [:]
        var quiz: QuizDraft?
        // Optional for compatibility with checkpoints written before Phase 7 recovery.
        var quizGenerationPending: Bool?
        var completedFlashcards: [String: [String]]?
    }
    private let defaults: UserDefaults?
    private let key: String
    private var closed = false
    private(set) var value: Checkpoint

    init(defaults: UserDefaults? = nil, namespace: String = "memory") {
        self.defaults = defaults
        key = "lexi.study.v1." + Data(namespace.utf8).base64EncodedString()
        value = defaults?.data(forKey: key).flatMap { try? JSONDecoder().decode(Checkpoint.self, from: $0) } ?? Checkpoint()
    }

    func update(_ change: (inout Checkpoint) -> Void) {
        guard !closed else { return }
        change(&value)
        if let data = try? JSONEncoder().encode(value) { defaults?.set(data, forKey: key) }
    }

    func close(clear: Bool) {
        closed = true
        if clear { value = Checkpoint(); defaults?.removeObject(forKey: key) }
    }
}

// Only explicit rejection can safely unlock a mutation without reconciliation.
func isDefiniteRejection(_ error: any Error) -> Bool {
    switch error as? HTTPError {
    case .unauthorized, .forbidden, .notFound, .validation, .invalidRequest, .rateLimit: true
    default: false
    }
}

extension ReviewRating: CaseIterable {
    static var allCases: [Self] { [.forgot, .hard, .good, .easy] }
    var title: String {
        switch self { case .forgot: "Quên"; case .hard: "Khó"; case .good: "Nhớ"; case .easy: "Dễ" }
    }
}
extension FlashcardMode: CaseIterable {
    static var allCases: [Self] { [.guess, .listen, .fill, .match] }
    var title: String {
        switch self { case .guess: "Xem"; case .listen: "Nghe"; case .fill: "Gõ"; case .match: "Ghép" }
    }
}
extension FlashcardScope: CaseIterable {
    static var allCases: [Self] { [.due, .today] }
    var title: String { self == .due ? "Ưu tiên đến hạn" : "Thêm hôm nay" }
}

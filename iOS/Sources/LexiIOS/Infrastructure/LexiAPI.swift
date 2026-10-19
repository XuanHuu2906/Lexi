import Foundation

// Composition facade. Features receive this (or a feature protocol), never URLSession.
struct LexiAPI: HealthChecking, Sendable {
    let client: APIClient
    var auth: AuthAPI { AuthAPI(client: client) }
    var words: WordsAPI { WordsAPI(client: client) }
    var review: ReviewAPI { ReviewAPI(client: client) }
    var quiz: QuizAPI { QuizAPI(client: client) }
    var stats: StatsAPI { StatsAPI(client: client) }
    var settings: SettingsAPI { SettingsAPI(client: client) }
    var aiText: AITextAPI { AITextAPI(client: client) }
    var grammar: GrammarAPI { GrammarAPI(client: client) }
    var conversation: ConversationAPI { ConversationAPI(client: client) }
    func check() async throws -> HealthResponse { try await HealthClient(client: client).check() }
}

protocol NativeAuthenticating: Sendable {
    func login(_ credentials: MobileCredentials) async throws -> MobileAuthResult
    func register(_ credentials: MobileCredentials) async throws -> MobileAuthResult
    func refresh(refreshToken: String) async throws -> MobileRefreshResult
    func logout(refreshToken: String) async throws -> LogoutResult
}

struct AuthAPI: NativeAuthenticating {
    let client: APIClient
    func me() async throws -> ApiMe {
        try await client.send(APIEndpoint(path: ["users", "me"], retry: .safeReadOnce))
    }
    // Dedicated native JSON transport; web cookie routes keep their own contract.
    func login(_ credentials: MobileCredentials) async throws -> MobileAuthResult {
        try await client.send(APIEndpoint(path: ["auth", "mobile", "login"], method: .post,
            requiresAuth: false).json(credentials))
    }
    func register(_ credentials: MobileCredentials) async throws -> MobileAuthResult {
        try await client.send(APIEndpoint(path: ["auth", "mobile", "register"], method: .post,
            requiresAuth: false).json(credentials))
    }
    func refresh(refreshToken: String) async throws -> MobileRefreshResult {
        try await client.send(APIEndpoint(path: ["auth", "mobile", "refresh"], method: .post,
            requiresAuth: false).json(RefreshBody(refreshToken: refreshToken)))
    }
    func logout(refreshToken: String) async throws -> LogoutResult {
        // Logout must work with an expired access token; refresh credential identifies the session.
        try await client.send(APIEndpoint(path: ["auth", "mobile", "logout"], method: .post,
            requiresAuth: false).json(RefreshBody(refreshToken: refreshToken)))
    }
    private struct RefreshBody: Encodable { let refreshToken: String }
}

enum WordSort: String, Sendable { case newest, oldest }
struct WordsQuery: Sendable, Equatable {
    var search: String? = nil
    var topic: String? = nil
    var status: BackendWordStatus? = nil
    var sort: WordSort = .newest
    var page = 1
    var limit = 20

    func queryItems() throws -> [URLQueryItem] {
        guard page > 0, (1...100).contains(limit) else { throw HTTPError.invalidRequest }
        var items = [URLQueryItem(name: "sort", value: sort.rawValue),
                     URLQueryItem(name: "page", value: String(page)),
                     URLQueryItem(name: "limit", value: String(limit))]
        if let search { items.append(URLQueryItem(name: "search", value: search)) }
        if let topic { items.append(URLQueryItem(name: "topic", value: topic)) }
        if let status { items.append(URLQueryItem(name: "status", value: status.rawValue)) }
        return items
    }
}

struct DeletedResult: Decodable, Sendable { let deleted: Bool }
struct SavedResult: Decodable, Sendable { let saved: Bool }
struct QuickAddResult: Decodable, Sendable {
    struct Synonym: Decodable, Sendable { let word: String; let meaning: String; let isToeic: Bool }
    let word: BackendWordDTO
    let isToeicTerm: Bool
    let synonyms: [Synonym]
}
struct ExamplesResult: Decodable, Sendable { let generated: [BilingualExample]; let word: BackendWordDTO }

struct WordsAPI: Sendable {
    let client: APIClient
    func list(_ query: WordsQuery = WordsQuery()) async throws -> WordPage {
        let page = try await client.send(APIEndpoint<Paginated<BackendWordDTO>>(
            path: ["words"], query: query.queryItems(), retry: .safeReadOnce))
        return WordPage(items: page.items.map { $0.toWord() }, total: page.total, page: page.page, limit: page.limit)
    }
    func get(id: String) async throws -> Word {
        try await client.send(APIEndpoint<BackendWordDTO>(path: ["words", id], retry: .safeReadOnce)).toWord()
    }
    func create(_ input: WordInput) async throws -> Word {
        try await client.send(APIEndpoint<BackendWordDTO>(path: ["words"], method: .post).json(input.toDTO())).toWord()
    }
    func delete(id: String) async throws -> DeletedResult {
        try await client.send(APIEndpoint(path: ["words", id], method: .delete))
    }
    func lookup(term: String, level: CEFRLevel? = nil) async throws -> LookupResult {
        struct Body: Encodable { let term: String; let level: CEFRLevel? }
        return try await client.send(APIEndpoint(path: ["words", "lookup"], method: .post,
            requiresAuth: false, timeout: .ai).json(Body(term: term, level: level)))
    }
    func lookupBatch(text: String, level: CEFRLevel? = nil) async throws -> BatchLookupResult {
        struct Body: Encodable { let text: String; let level: CEFRLevel? }
        return try await client.send(APIEndpoint(path: ["words", "lookup-batch"], method: .post,
            requiresAuth: false, timeout: .ai).json(Body(text: text, level: level)))
    }
    func verify(term: String, meaning: String? = nil, level: CEFRLevel? = nil) async throws -> VerifyWordResult {
        struct Body: Encodable { let term: String; let meaning: String?; let level: CEFRLevel? }
        return try await client.send(APIEndpoint(path: ["words", "verify"], method: .post, timeout: .ai)
            .json(Body(term: term, meaning: meaning, level: level)))
    }
    func quickAdd(text: String, topic: String? = nil) async throws -> QuickAddResult {
        struct Body: Encodable { let text: String; let topic: String? }
        return try await client.send(APIEndpoint(path: ["words", "quick-add"], method: .post, timeout: .ai)
            .json(Body(text: text, topic: topic)))
    }
    func examples(id: String, count: Int = 3) async throws -> ExamplesResult {
        guard (1...5).contains(count) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let count: Int }
        return try await client.send(APIEndpoint(path: ["words", id, "examples"], method: .post, timeout: .ai)
            .json(Body(count: count)))
    }
}

struct ReviewAPI: Sendable {
    let client: APIClient
    func due(limit: Int = 20) async throws -> DueReviews {
        guard (1...100).contains(limit) else { throw HTTPError.invalidRequest }
        let result = try await client.send(APIEndpoint<DueReviewsDTO>(path: ["review", "due"],
            query: [URLQueryItem(name: "limit", value: String(limit))], retry: .safeReadOnce))
        return DueReviews(items: result.items.map { $0.toWord() }, count: result.count, total: result.total)
    }
    func answer(wordID: String, rating: ReviewRating) async throws -> ReviewAnswerResult {
        struct Body: Encodable { let wordId: String; let rating: ReviewRating }
        return try await client.send(APIEndpoint(path: ["review", "answer"], method: .post)
            .json(Body(wordId: wordID, rating: rating)))
    }
    func flashcards(mode: FlashcardMode, scope: FlashcardScope = .due, limit: Int = 10) async throws -> FlashcardSet {
        guard (1...50).contains(limit) else { throw HTTPError.invalidRequest }
        return try await client.send(APIEndpoint(path: ["review", "flashcards"], query: [
            URLQueryItem(name: "mode", value: mode.rawValue), URLQueryItem(name: "scope", value: scope.rawValue),
            URLQueryItem(name: "limit", value: String(limit))], retry: .safeReadOnce))
    }
}

struct QuizAPI: Sendable {
    let client: APIClient
    func latest() async throws -> LatestQuiz {
        try await client.send(APIEndpoint(path: ["quiz", "latest"], retry: .safeReadOnce))
    }
    func generate(count: Int = 10) async throws -> GeneratedQuiz {
        guard (4...20).contains(count) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let count: Int }
        return try await client.send(APIEndpoint(path: ["quiz", "generate"], method: .post, timeout: .ai).json(Body(count: count)))
    }
    func get(id: String) async throws -> QuizState {
        try await client.send(APIEndpoint(path: ["quiz", id], retry: .safeReadOnce))
    }
    func saveProgress(id: String, answers: [Int]) async throws -> SavedResult {
        struct Body: Encodable { let answers: [Int] }
        return try await client.send(APIEndpoint(path: ["quiz", id, "progress"], method: .patch).json(Body(answers: answers)))
    }
    func submit(id: String, answers: [Int]) async throws -> QuizResult {
        struct Body: Encodable { let quizId: String; let answers: [Int] }
        return try await client.send(APIEndpoint(path: ["quiz", "submit"], method: .post).json(Body(quizId: id, answers: answers)))
    }
}

struct StatsAPI: Sendable {
    let client: APIClient
    func overview(period: StatsPeriod = .all) async throws -> Stats {
        try await client.send(APIEndpoint(path: ["stats", "overview"],
            query: [URLQueryItem(name: "period", value: period.rawValue)], retry: .safeReadOnce))
    }
    func weakness() async throws -> Weakness {
        try await client.send(APIEndpoint(path: ["stats", "weakness"], retry: .safeReadOnce))
    }
    // These GET routes can write streak/badge state. Do not retry automatically.
    func streak() async throws -> Streak { try await client.send(APIEndpoint(path: ["streak"])) }
    func badges() async throws -> BadgesResult { try await client.send(APIEndpoint(path: ["badges"])) }
}

struct SettingsAPI: Sendable {
    let client: APIClient
    func update(_ input: SettingsUpdate) async throws -> Settings {
        try await client.send(APIEndpoint(path: ["users", "me", "settings"], method: .patch).json(input))
    }
}

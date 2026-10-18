import Foundation
import Testing
@testable import LexiIOS

private func fixtureValue<T: Decodable & Sendable>(_ name: String, as: T.Type = T.self) throws -> T {
    try APIJSON.decoder().decode(APIEnvelope<T>.self, from: Fixtures.body(name)).data
}

private actor WordStub: WordServing {
    var pages: [WordPage]
    var error: HTTPError?
    private(set) var queries: [WordsQuery] = []
    private(set) var creates: [WordInput] = []
    private(set) var lookups = 0
    private(set) var quickAdds = 0
    init(pages: [WordPage] = [], error: HTTPError? = nil) { self.pages = pages; self.error = error }
    func list(_ query: WordsQuery) async throws -> WordPage {
        queries.append(query)
        if let error { throw error }
        return pages.removeFirst()
    }
    func get(id: String) async throws -> Word { try fixtureValue("word_created", as: BackendWordDTO.self).toWord() }
    func create(_ input: WordInput) async throws -> Word {
        creates.append(input)
        if let error { throw error }
        return try await get(id: "fixture")
    }
    func delete(id: String) async throws -> DeletedResult {
        if let error { throw error }
        return DeletedResult(deleted: true)
    }
    func lookup(term: String, level: CEFRLevel?) async throws -> LookupResult {
        lookups += 1
        if let error { throw error }
        return try fixtureValue("lookup")
    }
    func quickAdd(text: String, topic: String?) async throws -> QuickAddResult {
        quickAdds += 1
        if let error { throw error }
        return try fixtureValue("quick_add")
    }
}

private actor ControlledWords: WordServing {
    private var pending: [String: CheckedContinuation<WordPage, any Error>] = [:]
    func isWaiting(_ search: String) -> Bool { pending[search] != nil }
    func finish(_ search: String, with page: WordPage) { pending.removeValue(forKey: search)?.resume(returning: page) }
    func list(_ query: WordsQuery) async throws -> WordPage {
        try await withCheckedThrowingContinuation { pending[query.search ?? ""] = $0 }
    }
    func get(id: String) async throws -> Word { throw HTTPError.invalidRequest }
    func create(_ input: WordInput) async throws -> Word { throw HTTPError.invalidRequest }
    func delete(id: String) async throws -> DeletedResult { throw HTTPError.invalidRequest }
    func lookup(term: String, level: CEFRLevel?) async throws -> LookupResult { throw HTTPError.invalidRequest }
    func quickAdd(text: String, topic: String?) async throws -> QuickAddResult { throw HTTPError.invalidRequest }
}

private actor DashboardStub: DashboardLoading {
    let value: DashboardSnapshot
    var failure: HTTPError?
    init() throws {
        value = try DashboardSnapshot(stats: fixtureValue("stats"), streak: fixtureValue("streak"),
            badges: fixtureValue("badges"), due: DueReviews(items: [], count: 1, total: 47))
    }
    func fail(_ error: HTTPError?) { failure = error }
    func load() async throws -> DashboardSnapshot {
        if let failure { throw failure }
        return value
    }
}

private actor ProfileStub: ProfileServing {
    var value: Settings?
    private(set) var updates: [SettingsUpdate] = []
    private(set) var reads = 0
    init(value: Settings?) { self.value = value }
    func settings() async throws -> Settings? { reads += 1; return value }
    func update(_ input: SettingsUpdate) async throws -> Settings {
        updates.append(input)
        return try fixtureValue("settings_updated")
    }
}

@MainActor
struct LearningFeatureTests {
    @Test func dashboardUsesServerDayAndTotalRatherThanDeviceTimeOrPageCount() async throws {
        let repository = try DashboardStub()
        let model = DashboardViewModel(repository: repository)
        await model.refresh()
        let data = try #require(model.snapshot)
        let server: Streak = try fixtureValue("streak")
        #expect(data.due.total == 47)
        #expect(data.due.count == 1)
        #expect(data.streak.today.wordsReviewed == server.today.wordsReviewed)
        #expect(data.streak.today.dailyGoal == server.today.dailyGoal)
        #expect(data.streak.currentStreak == server.currentStreak)
    }

    @Test func dashboardKeepsStaleDataAndRecoversAfterOffline() async throws {
        let repository = try DashboardStub()
        let model = DashboardViewModel(repository: repository)
        await model.refresh()
        await repository.fail(.network(-1009))
        await model.refresh()
        #expect(model.phase == .stale)
        #expect(model.snapshot != nil)
        #expect(model.feedback != nil)
        await repository.fail(nil)
        await model.refresh()
        #expect(model.phase == .loaded)
        #expect(model.feedback == nil)
    }

    @Test func cancellationDoesNotLeaveLoadingOrReplaceCachedData() async throws {
        let repository = try DashboardStub()
        let model = DashboardViewModel(repository: repository)
        await model.refresh()
        await repository.fail(.cancellation)
        await model.refresh()
        #expect(model.phase == .stale)
        #expect(model.feedback == nil)
    }

    @Test func paginationDeduplicatesWithoutReorderingAndUsesServerPage() async throws {
        let word = try fixtureValue("word_created", as: BackendWordDTO.self).toWord()
        let second = Word(id: "second", word: "book", meaning: "sách", phonetic: nil, pos: nil,
            status: .new, topic: nil, examples: [], synonyms: [], antonyms: [], note: nil, createdAt: "", nextReviewAt: nil)
        let api = WordStub(pages: [WordPage(items: [word], total: 4, page: 1, limit: 2),
                                  WordPage(items: [word, second], total: 4, page: 2, limit: 2)])
        let model = WordListViewModel(api: api)
        model.query.limit = 2
        await model.refresh()
        await model.nextPage()
        #expect(model.items.map(\.id) == [word.id, "second"])
        #expect(!model.hasMore)
        #expect(await api.queries.map(\.page) == [1, 2])
    }

    @Test func queryChangeClearsOldRowsAndLateResponseCannotOverwriteNewSearch() async throws {
        let api = ControlledWords()
        let model = WordListViewModel(api: api)
        let word = try fixtureValue("word_created", as: BackendWordDTO.self).toWord()
        model.query.search = "old"
        let old = Task { await model.refresh() }
        while !(await api.isWaiting("old")) { await Task.yield() }
        model.query.search = "new"
        #expect(model.items.isEmpty)
        let new = Task { await model.refresh() }
        while !(await api.isWaiting("new")) { await Task.yield() }
        await api.finish("new", with: WordPage(items: [], total: 0, page: 1, limit: 20))
        await new.value
        await api.finish("old", with: WordPage(items: [word], total: 1, page: 1, limit: 20))
        await old.value
        #expect(model.phase == .empty)
        #expect(model.items.isEmpty)
        #expect(model.total == 0)
    }

    @Test func cancelledDebounceDoesNotSendRequest() async {
        let api = WordStub()
        let model = WordListViewModel(api: api)
        let work = Task { await model.refresh(debounce: true) }
        work.cancel()
        await work.value
        #expect(await api.queries.isEmpty)
        #expect(model.phase == .idle)
    }

    @Test func invalidationDropsListAndDueBecomesStale() async throws {
        let transport = MockTransport([])
        let features = try LearningFeatures(api: LexiAPI(client: testClient(transport)))
        features.invalidate()
        #expect(features.revision == 1)
        #expect(features.words.items.isEmpty)
        #expect(features.dashboard.phase == .idle)
        let freshAccount = try LearningFeatures(api: LexiAPI(client: testClient(transport)))
        #expect(freshAccount.revision == 0)
        #expect(!freshAccount.settings.loaded)
    }

    @Test func invalidWordNeverHitsServerAndTrimmedInputPreservesEnrichment() async throws {
        let api = WordStub()
        let editor = WordEditorModel(api: api)
        #expect(await editor.save(WordInput(word: "  ", meaning: "test")) == nil)
        #expect(await api.creates.isEmpty)
        let result: LookupResult = try fixtureValue("lookup")
        var input = result.wordInput
        input.word = "  apple  "
        #expect(await editor.save(input) != nil)
        let submitted = try #require(await api.creates.first)
        #expect(submitted.word == "apple")
        #expect(submitted.pos == result.partOfSpeech)
        #expect(submitted.examples?.first == result.examples.first.map { "\($0.en) — \($0.vi)" })
    }

    @Test func lookupIsManualAndChangingTermClearsResult() async throws {
        let api = WordStub()
        let model = LookupViewModel(api: api)
        model.term = "apple"
        #expect(await api.lookups == 0)
        await model.lookup()
        #expect(model.result != nil)
        model.term = "book"
        #expect(model.result == nil)
        #expect(await api.lookups == 1)
    }

    @Test func rateLimitSurvivesQueryChangeAndPreventsEarlyRetry() async {
        let api = WordStub(error: .rateLimit(retryAfter: 60, payload: nil))
        let model = WordListViewModel(api: api)
        await model.refresh()
        model.query.search = "another"
        await model.refresh()
        #expect(await api.queries.count == 1)
        #expect(model.feedback?.canRetry() == false)
        let lookup = LookupViewModel(api: api)
        lookup.term = "apple"
        await lookup.lookup(); await lookup.lookup()
        #expect(await api.lookups == 1)
    }

    @Test func quickAddValidatesSyntaxAndDoesNotRepeatSuccessfulMutation() async {
        let api = WordStub()
        let model = WordEditorModel(api: api)
        #expect(await model.quickAdd(text: "missing separator", topic: "") == false)
        #expect(await api.quickAdds == 0)
        #expect(await model.quickAdd(text: "apple: quả táo", topic: "food"))
        #expect(model.quickResult != nil)
        #expect(await model.quickAdd(text: "apple: quả táo", topic: "food") == false)
        #expect(await api.quickAdds == 1)
    }

    @Test func deletionFailureRetainsWordAndExplainsUncertainMutation() async throws {
        let api = WordStub(error: .timeout)
        let model = WordDetailViewModel(id: "fixture", api: api)
        await model.load()
        #expect(await model.delete() == false)
        #expect(model.word != nil)
        #expect(model.feedback?.message.contains("có thể đã được lưu") == true)
    }

    @Test func nullSettingsRequireExplicitTimezoneAndSaveIsValidated() async {
        let api = ProfileStub(value: nil)
        let model = SettingsViewModel(api: api)
        await model.load()
        #expect(model.loaded)
        #expect(model.draft.timeZone.isEmpty)
        #expect(await model.save() == false)
        #expect(await api.updates.isEmpty)
        model.draft.timeZone = "Asia/Ho_Chi_Minh"
        #expect(await model.save())
    }

    @Test func settingsPreserveTimezoneAndOnlyPatchChangedFields() async throws {
        let value: Settings = try fixtureValue("settings_updated")
        let api = ProfileStub(value: value)
        let model = SettingsViewModel(api: api)
        await model.load()
        model.draft.dailyGoal = value.dailyGoal == 20 ? 21 : 20
        await model.load() // Foreground refresh must not clobber unsaved edits.
        #expect(await api.reads == 1)
        #expect(await model.save())
        let update = try #require(await api.updates.first)
        #expect(update.timeZone == nil)
        #expect(update.ttsVoice == nil)
        #expect(update.dailyGoal != nil)
        #expect(model.draft.timeZone == value.timeZone)
    }

    @Test func settingsRejectInvalidTimeZoneTimeAndGoal() {
        var draft = SettingsDraft()
        draft.timeZone = "Asia/Ho_Chi_Minh"
        #expect(draft.validation == nil)
        draft.reminderTime = "24:00"; #expect(draft.validation != nil)
        draft.reminderTime = "20:00"; draft.dailyGoal = 501; #expect(draft.validation != nil)
        draft.dailyGoal = 10; draft.timeZone = "Mars/Olympus"; #expect(draft.validation != nil)
    }

    @Test(arguments: [HTTPError.unauthorized(nil), .forbidden(nil), .notFound(nil), .conflict(nil),
                      .validation(400, nil), .timeout, .network(-1009), .rateLimit(retryAfter: 60, payload: nil)])
    func errorFeedbackNeverExposesRawJSON(_ error: HTTPError) {
        let feedback = FeatureFeedback(error)
        #expect(!feedback.message.isEmpty)
        #expect(!feedback.message.contains("statusCode"))
        #expect(!feedback.message.contains("{"))
    }
}

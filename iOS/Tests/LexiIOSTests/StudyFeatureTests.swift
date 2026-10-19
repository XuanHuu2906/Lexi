import Foundation
import Testing
@testable import LexiIOS

private func studyFixture<T: Decodable & Sendable>(_ name: String, as: T.Type = T.self) throws -> T {
    try APIJSON.decoder().decode(APIEnvelope<T>.self, from: Fixtures.body(name)).data
}

private actor ReviewStub: ReviewServing, FlashcardServing {
    var items: [Word]
    var answerError: HTTPError?
    var dueError: HTTPError?
    var flashError: HTTPError?
    var customDeck: FlashcardSet?
    var holdAnswer = false
    var continuation: CheckedContinuation<Void, Never>?
    private(set) var submissions = 0
    private(set) var dueReads = 0
    private(set) var deckReads = 0
    init() throws { items = [try studyFixture("word_created", as: BackendWordDTO.self).toWord()] }
    func setAnswerError(_ error: HTTPError?) { answerError = error }
    func setDueError(_ error: HTTPError?) { dueError = error }
    func setFlashError(_ error: HTTPError?) { flashError = error }
    func setItems(_ words: [Word]) { items = words }
    func setDeck(_ deck: FlashcardSet) { customDeck = deck }
    func hold() { holdAnswer = true }
    func release() { continuation?.resume(); continuation = nil }
    func waiting() -> Bool { continuation != nil }
    func due(limit: Int) async throws -> DueReviews {
        dueReads += 1
        if let dueError { throw dueError }
        return DueReviews(items: Array(items.prefix(limit)), count: min(items.count, limit), total: items.count)
    }
    func answer(wordID: String, rating: ReviewRating) async throws -> ReviewAnswerResult {
        submissions += 1
        if holdAnswer { await withCheckedContinuation { continuation = $0 } }
        if let answerError { throw answerError }
        items.removeAll { $0.id == wordID }
        return try studyFixture("review_answer_first_good")
    }
    func flashcards(mode: FlashcardMode, scope: FlashcardScope, limit: Int) async throws -> FlashcardSet {
        deckReads += 1
        if let flashError { throw flashError }
        return try customDeck ?? studyFixture("flashcard_" + mode.rawValue)
    }
    func flashcards(mode: FlashcardMode, scope: FlashcardScope, limit: Int, excluding: Set<String>) async throws -> FlashcardSet {
        let result = try await flashcards(mode: mode, scope: scope, limit: limit)
        // Preserve malformed fixtures so the view model can reject them.
        guard result.cards.allSatisfy({ !excluding.contains($0.wordId) }) else {
            let cards = Array(result.cards.filter { !excluding.contains($0.wordId) }.prefix(limit))
            return .init(mode: result.mode, scope: result.scope, count: cards.count, cards: cards)
        }
        return result
    }
}

private actor QuizStub: QuizServing {
    var state: QuizState
    var generateError: HTTPError?
    var submitError: HTTPError?
    var saveError: HTTPError?
    var readError: HTTPError?
    var hasQuiz = false
    private(set) var saveWasCancelled = false
    var generated: GeneratedQuiz
    var holdSave = false
    var continuation: CheckedContinuation<Void, Never>?
    private(set) var generations = 0
    private(set) var submissions = 0
    private(set) var reads = 0
    private(set) var saves: [[Int]] = []
    init() throws {
        state = try studyFixture("quiz_in_progress")
        generated = try studyFixture("quiz_generated")
    }
    func setGenerateError(_ value: HTTPError?) { generateError = value }
    func setSubmitError(_ value: HTTPError?) { submitError = value }
    func setSaveError(_ value: HTTPError?) { saveError = value }
    func setReadError(_ value: HTTPError?) { readError = value }
    func setGenerated(_ value: GeneratedQuiz) { generated = value }
    func complete() throws { state = try studyFixture("quiz_completed"); hasQuiz = true }
    func hold() { holdSave = true }
    func release() { holdSave = false; continuation?.resume(); continuation = nil }
    func waiting() -> Bool { continuation != nil }
    func generate(count: Int) async throws -> GeneratedQuiz {
        generations += 1
        hasQuiz = generateError.map { !isDefiniteRejection($0) } ?? true
        if let generateError { throw generateError }
        return generated
    }
    func latest() async throws -> LatestQuiz {
        reads += 1
        if let readError { throw readError }
        return LatestQuiz(quiz: hasQuiz ? state : nil)
    }
    func get(id: String) async throws -> QuizState {
        reads += 1
        if let readError { throw readError }
        return state
    }
    func saveProgress(id: String, answers: [Int]) async throws -> SavedResult {
        saves.append(answers)
        if holdSave { await withCheckedContinuation { continuation = $0 } }
        saveWasCancelled = Task.isCancelled
        try Task.checkCancellation()
        if let saveError { throw saveError }
        return SavedResult(saved: true)
    }
    func submit(id: String, answers: [Int]) async throws -> QuizResult {
        submissions += 1
        if let submitError { throw submitError }
        try complete()
        return try studyFixture("quiz_submitted")
    }
}

@MainActor
struct StudyFeatureTests {
    @Test func reviewRequiresRevealAndAcknowledgementAndBlocksDoubleTap() async throws {
        let api = try ReviewStub(); await api.hold()
        let store = StudyCheckpointStore()
        var revisions = 0
        let model = ReviewViewModel(api: api, store: store) { revisions += 1 }
        await model.load(); await model.submit(.good)
        #expect(await api.submissions == 0)
        model.reveal()
        let first = Task { await model.submit(.good) }
        while !(await api.waiting()) { await Task.yield() }
        #expect(model.currentIndex == 0 && model.acknowledged == 0)
        #expect(!store.value.uncertainReviews.isEmpty)
        await model.submit(.easy)
        #expect(await api.submissions == 1)
        await api.release(); await first.value
        #expect(model.completed && model.acknowledged == 1)
        #expect(model.serverDueTotal == 0)
        #expect(model.result?.nextReviewAt == "2026-10-18T00:00:00.000Z")
        #expect(revisions == 1 && store.value.uncertainReviews.isEmpty)
    }

    @Test(arguments: [HTTPError.timeout, .network(-1005), .cancellation, .decoding])
    func reviewUncertainNeverReplaysEvenAfterModelRecreation(_ error: HTTPError) async throws {
        let api = try ReviewStub(); await api.setAnswerError(error)
        let store = StudyCheckpointStore()
        let model = ReviewViewModel(api: api, store: store)
        await model.load(); model.reveal(); await model.submit(.forgot)
        #expect(model.uncertain && model.acknowledged == 0 && model.currentIndex == 0)
        await model.submit(.good)
        let reopened = ReviewViewModel(api: api, store: store)
        await reopened.load(); reopened.reveal(); await reopened.submit(.good)
        #expect(reopened.skippedUncertain == 1)
        #expect(await api.submissions == 1)
    }

    @Test func reviewReconciliationUsesChangedServerScheduleNotDeviceTimezone() async throws {
        let api = try ReviewStub()
        let original = try studyFixture("word_created", as: BackendWordDTO.self).toWord()
        let store = StudyCheckpointStore()
        store.update { $0.uncertainReviews[original.id] = "older-server-schedule" }
        await api.setItems([original, original])
        let model = ReviewViewModel(api: api, store: store)
        await model.load()
        #expect(model.cards.count == 1)
        #expect(model.current?.nextReviewAt == original.nextReviewAt)
        #expect(store.value.uncertainReviews.isEmpty)
        await api.setItems([]) // Web reviewed it; a fresh GET drives the queue.
        await model.load()
        #expect(model.completed && model.cards.isEmpty)
    }

    @Test func rejectedReviewRetainsCardAndCooldown() async throws {
        let api = try ReviewStub()
        await api.setAnswerError(.rateLimit(retryAfter: 60, payload: nil))
        let store = StudyCheckpointStore()
        let model = ReviewViewModel(api: api, store: store)
        await model.load(); model.reveal(); await model.submit(.hard)
        await model.load(); await model.submit(.hard)
        #expect(model.currentIndex == 0 && !model.uncertain)
        #expect(model.feedback?.canRetry() == false)
        #expect(store.value.uncertainReviews.isEmpty)
        #expect(await api.submissions == 1)
    }

    @Test func cancelledReadCanBeRetriedAndLateSubmitCannotUpdateClosedSession() async throws {
        let api = try ReviewStub(); await api.setDueError(.cancellation)
        let model = ReviewViewModel(api: api, store: StudyCheckpointStore())
        await model.load()
        #expect(!model.isLoading && !model.loaded && model.feedback == nil)
        await api.setDueError(nil); await model.load(); model.reveal(); await api.hold()
        let work = Task { await model.submit(.easy) }
        while !(await api.waiting()) { await Task.yield() }
        model.deactivate(); await api.release(); await work.value
        #expect(model.acknowledged == 0)
    }

    @Test(arguments: FlashcardMode.allCases)
    func flashcardModesUseFixturesAndNeverSubmitSRS(_ mode: FlashcardMode) async throws {
        let api = try ReviewStub(); let model = FlashcardsViewModel(api: api)
        await model.load(mode: mode, scope: .today)
        #expect(model.requestedScope == .today && model.deck?.scope == .due)
        if mode == .match {
            for card in try #require(model.deck).cards {
                model.selectTerm(card.wordId); model.selectMeaning(card.wordId)
            }
        } else if mode == .fill {
            model.typedAnswer = "  APPLE  "; model.checkTyped(); model.checkTyped()
            #expect(model.correctCount == 1); model.next()
        } else {
            model.choose(0); model.choose(0)
            #expect(model.correctCount == 1); model.next()
        }
        #expect(model.completed)
        #expect(await api.submissions == 0)
    }

    @Test func flashcardWrongAnswerRevealEmptyAndMalformedDeck() async throws {
        let api = try ReviewStub(); let model = FlashcardsViewModel(api: api)
        await model.load(); model.choose(1)
        #expect(model.correct == false && model.correctCount == 0)
        model.next(); model.next()
        #expect(model.current == nil)
        await api.setDeck(FlashcardSet(mode: .guess, scope: .due, count: 0, cards: []))
        await model.load(); #expect(model.completed)
        await api.setDeck(FlashcardSet(mode: .guess, scope: .due, count: 1,
            cards: [.init(wordId: "x", term: "word", meaning: "nghĩa", phonetic: nil, examples: [], options: ["one"], answerIndex: 9, cloze: nil)]))
        await model.load()
        #expect(model.deck == nil && model.feedback != nil)
    }

    @Test func flashcardsRespectCooldownAcrossModeChanges() async throws {
        let api = try ReviewStub(); await api.setFlashError(.rateLimit(retryAfter: 60, payload: nil))
        let model = FlashcardsViewModel(api: api)
        await model.load(); await model.load(mode: .fill)
        #expect(await api.deckReads == 1)
    }

    @Test func quizDoesNotGradeBeforeSubmitAndResumesServerAnswers() async throws {
        let api = try QuizStub(); let store = StudyCheckpointStore()
        let model = QuizViewModel(api: api, store: store)
        await model.open(); await model.generate(count: 4)
        #expect(model.result == nil && model.questions.allSatisfy { $0.answerIndex == nil })
        model.select(99); #expect(model.answeredCount == 0)
        for index in 0..<4 { model.select(index); model.move(1) }
        #expect(model.canSubmit)
        await model.submit(); await model.submit()
        #expect(model.result?.score == 4)
        #expect(await api.submissions == 1)
        let reopened = QuizViewModel(api: api, store: store)
        await reopened.open()
        #expect(reopened.result?.score == 4)
        #expect(reopened.answers == [0, 1, 2, 3])
        model.deactivate(); reopened.deactivate()
    }

    @Test func quizTimeoutRequiresReadAndFindsAlreadyCompletedResult() async throws {
        let api = try QuizStub(); let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); await model.generate(count: 4)
        for index in 0..<4 { model.select(index); model.move(1) }
        await api.setSubmitError(.timeout); await model.submit(); await model.submit()
        #expect(model.needsReconciliation && model.result == nil)
        try await api.complete(); await model.open()
        #expect(model.result?.score == 4 && !model.needsReconciliation)
        #expect(await api.submissions == 1)
        model.deactivate()
    }

    @Test func dirtyDraftSurvivesRecreationAndAnotherAccountStartsEmpty() async throws {
        let api = try QuizStub(); let store = StudyCheckpointStore()
        let model = QuizViewModel(api: api, store: store)
        await model.open(); await model.generate(count: 4); model.select(3); model.deactivate()
        let reopened = QuizViewModel(api: api, store: store)
        await reopened.open()
        #expect(reopened.answers[0] == 3 && reopened.dirty)
        let other = QuizViewModel(api: api, store: StudyCheckpointStore())
        #expect(other.questions.isEmpty && other.quizID == nil)
        reopened.deactivate(); other.deactivate()
    }

    @Test func autosaveCoalescesTapsAndSubmitWaitsForInFlightSave() async throws {
        let api = try QuizStub(); let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); await model.generate(count: 4)
        for option in [1, 2, 3, 0] { model.select(option) }
        for index in 1..<4 { model.move(1); model.select(index) }
        #expect(await api.saves.isEmpty)
        await api.hold()
        let save = Task { await model.saveProgress() }
        while !(await api.waiting()) { await Task.yield() }
        await model.submit()
        #expect(await api.submissions == 0)
        await api.release(); await save.value
        #expect(await api.saves == [[0, 1, 2, 3]])
        #expect(!model.dirty && model.canSubmit)
        model.deactivate()
    }

    @Test func saveErrorRetainsAnswersUntilReconciliation() async throws {
        let api = try QuizStub(); let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); await model.generate(); model.select(2)
        await api.setSaveError(.timeout); await model.saveProgress()
        #expect(model.answers[0] == 2 && model.dirty && model.needsReconciliation)
        await model.saveProgress()
        #expect(await api.saves.count == 1)
        await model.open()
        #expect(model.answers[0] == 2 && !model.needsReconciliation)
        model.deactivate()
    }

    @Test func quizGenerationRateLimitAndUncertainResponseCannotRepeat() async throws {
        let api = try QuizStub(); await api.setGenerateError(.rateLimit(retryAfter: 60, payload: nil))
        let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); await model.generate(); await model.generate()
        #expect(await api.generations == 1)
        #expect(model.feedback?.canRetry() == false)
        let second = QuizViewModel(api: api, store: StudyCheckpointStore())
        await api.setGenerateError(.timeout)
        await second.open(); await second.generate(); await second.generate()
        #expect(await api.generations == 2)
        #expect(second.needsReconciliation)
        await second.open()
        #expect(second.quizID != nil)
        model.deactivate(); second.deactivate()
    }

    @Test func malformedQuizIsRejectedWithoutDroppingAnExistingDraft() async throws {
        let api = try QuizStub()
        await api.setGenerated(GeneratedQuiz(quizId: "bad", total: 2, questions: []))
        let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); await model.generate()
        #expect(model.quizID == nil && model.feedback != nil && model.needsReconciliation)
    }

    @Test func checkpointNamespacesPersistIndependentlyAndClosedStoresIgnoreLateWrites() {
        let name = "lexi-study-tests-" + UUID().uuidString
        let defaults = UserDefaults(suiteName: name)!
        defer { defaults.removePersistentDomain(forName: name) }
        let a = StudyCheckpointStore(defaults: defaults, namespace: "api|a")
        a.update { $0.uncertainReviews["word"] = "stamp" }
        let reopened = StudyCheckpointStore(defaults: defaults, namespace: "api|a")
        let b = StudyCheckpointStore(defaults: defaults, namespace: "api|b")
        #expect(reopened.value.uncertainReviews["word"] == "stamp")
        #expect(b.value.uncertainReviews.isEmpty)
        a.close(clear: true); a.update { $0.uncertainReviews["late"] = "stamp" }
        #expect(StudyCheckpointStore(defaults: defaults, namespace: "api|a").value.uncertainReviews.isEmpty)
    }

    @Test func quizCannotGenerateUntilDiscoverySucceedsAndKeepsSavedDraftOnReadFailure() async throws {
        let api = try QuizStub(); let store = StudyCheckpointStore()
        store.update { $0.quiz = .init(id: "fixture-quiz-a", answers: [3, -1, -1, -1], dirty: true, uncertainSubmission: false) }
        let model = QuizViewModel(api: api, store: store)
        await model.generate()
        await api.setReadError(.network(-1009)); await model.open(); await model.generate()
        #expect(await api.generations == 0)
        #expect(!model.canGenerate && store.value.quiz?.answers.first == 3)
        await api.setReadError(nil); await model.open()
        #expect(model.answers.first == 3 && model.dirty)
        model.deactivate()
    }

    @Test func uncertainGenerationSurvivesRelaunchAndMissingLatestRouteDoesNotUnlockPost() async throws {
        let api = try QuizStub(); let store = StudyCheckpointStore()
        let model = QuizViewModel(api: api, store: store)
        await model.open(); await api.setGenerateError(.timeout); await model.generate()
        #expect(store.value.quizGenerationPending == true)
        model.deactivate()
        let reopened = QuizViewModel(api: api, store: store)
        await api.setReadError(.notFound(nil)); await reopened.open(); await reopened.generate()
        #expect(reopened.needsReconciliation && !reopened.canGenerate)
        #expect(store.value.quizGenerationPending == true)
        #expect(await api.generations == 1)
        await api.setReadError(nil); await reopened.open()
        #expect(reopened.quizID == "fixture-quiz-a" && !reopened.needsReconciliation)
        #expect(store.value.quizGenerationPending == nil)
        reopened.deactivate()
    }

    @Test func legacyServerAllowsFirstQuizButNotAnotherAfterUncertainGeneration() async throws {
        let api = try QuizStub(); await api.setReadError(.notFound(nil))
        let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); #expect(model.canGenerate)
        await api.setGenerateError(.timeout); await model.generate()
        await model.open(); await model.generate()
        #expect(await api.generations == 1)
        #expect(model.needsReconciliation)
        model.deactivate()
    }

    @Test func changingAnswerDuringAutosaveDoesNotCancelPatchAndEventuallySavesLatest() async throws {
        let api = try QuizStub(); let model = QuizViewModel(api: api, store: StudyCheckpointStore())
        await model.open(); await model.generate(); await api.hold()
        model.select(0)
        // Let the actual debounce timer start PATCH, then edit while the response is held.
        for _ in 0..<200 {
            if await api.waiting() { break }
            try await Task.sleep(for: .milliseconds(10))
        }
        #expect(await api.waiting())
        model.select(2)
        await api.release()
        for _ in 0..<200 {
            if await api.saves.count == 2 && !model.dirty { break }
            try await Task.sleep(for: .milliseconds(10))
        }
        #expect(await api.saveWasCancelled == false)
        #expect(await api.saves == [[0, -1, -1, -1], [2, -1, -1, -1]])
        #expect(!model.dirty && !model.needsReconciliation)
        model.deactivate()
    }

    @Test func repeatedlyReadingCompletedQuizInvalidatesStatsOnlyOnce() async throws {
        let api = try QuizStub(); try await api.complete()
        var revisions = 0
        let model = QuizViewModel(api: api, store: StudyCheckpointStore()) { revisions += 1 }
        await model.open(); await model.open()
        #expect(revisions == 1 && model.result?.score == 4)
        model.deactivate()
    }

    @Test func flashcardsCannotLoadOrScoreAfterSessionCloses() async throws {
        let api = try ReviewStub(); let model = FlashcardsViewModel(api: api)
        await model.load(); model.deactivate()
        model.choose(0); model.reveal(); model.next(); await model.load()
        #expect(!model.revealed && model.correctCount == 0 && model.index == 0)
        #expect(await api.deckReads == 1)
    }

    @Test func quiz401RefreshPreservesSubmittedAnswersAndServerResumeResult() async throws {
        let auth = AuthDouble()
        let session = SessionActor(auth: auth, store: MemoryKeychain())
        try await session.signIn(.init(email: "quiz@example.invalid", password: "Synthetic123"))
        let transport = MockTransport([
            .response(200, Data(#"{"success":true,"data":{"quiz":null}}"#.utf8)),
            .response(201, try Fixtures.body("quiz_generated")),
            .response(401, Data()),
            .response(200, try Fixtures.body("quiz_submitted")),
            .response(200, try Fixtures.body("quiz_completed")),
        ])
        var client = try testClient(transport); client.tokens = session
        let store = StudyCheckpointStore()
        let model = QuizViewModel(api: LexiAPI(client: client).quiz, store: store)
        await model.open(); await model.generate(count: 4)
        for index in 0..<4 { model.select(index); model.move(1) }
        await model.submit()
        #expect(model.result?.score == 4 && model.answers == [0, 1, 2, 3])
        #expect(await auth.refreshCalls == 1)
        let requests = await transport.requests
        #expect(requests.count == 4)
        #expect(requests[2].httpBody == requests[3].httpBody)
        #expect(requests[2].value(forHTTPHeaderField: "Authorization") == "Bearer access")
        #expect(requests[3].value(forHTTPHeaderField: "Authorization") == "Bearer access-1")
        model.deactivate()
        let reopened = QuizViewModel(api: LexiAPI(client: client).quiz, store: store)
        await reopened.open()
        #expect(reopened.result?.score == 4 && reopened.answers == [0, 1, 2, 3])
        reopened.deactivate()
    }
}

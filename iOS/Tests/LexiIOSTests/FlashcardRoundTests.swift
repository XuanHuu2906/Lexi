import Foundation
import Testing
@testable import LexiIOS

private func notebookWords(_ count: Int) -> [Word] {
    (0..<count).map { n in
        Word(id: "word-\(n)", word: "term\(n)", meaning: "meaning\(n)", phonetic: nil, pos: nil,
             status: .new, topic: nil, examples: ["I know TERM\(n)."], synonyms: ["similar\(n)"], antonyms: ["opposite\(n)"], note: nil,
             createdAt: "2026-10-19T01:00:00Z", nextReviewAt: "2026-10-18T01:00:00Z")
    }
}

private actor NotebookStub: FlashcardWordListing {
    let words: [Word]
    var failPage: Int?
    var repeatPage = false
    private(set) var pages: [Int] = []
    init(count: Int) { words = notebookWords(count) }
    func fail(on page: Int?) { failPage = page }
    func repeatFirstPage() { repeatPage = true }
    func list(_ query: WordsQuery) async throws -> WordPage {
        pages.append(query.page)
        if query.page == failPage { throw HTTPError.timeout }
        let start = repeatPage ? 0 : (query.page - 1) * query.limit
        return .init(items: Array(words.dropFirst(start).prefix(query.limit)), total: words.count,
                     page: query.page, limit: query.limit)
    }
}

@Suite @MainActor
struct FlashcardRoundTests {
    @Test(arguments: FlashcardMode.allCases)
    func interruptedSessionRestoresExactDeckAndAnswerState(_ mode: FlashcardMode) async throws {
        let name = "flashcard-resume-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: name))
        defer { defaults.removePersistentDomain(forName: name) }
        let words = NotebookStub(count: 23)
        let api = NotebookFlashcards(words: words)
        let store = StudyCheckpointStore(defaults: defaults, namespace: "api|a")
        let first = FlashcardsViewModel(api: api, store: store)
        await first.load(mode: mode)
        if mode == .match {
            let cards = try #require(first.deck).cards
            first.selectTerm(cards[0].wordId); first.selectMeaning(cards[0].wordId)
            first.selectTerm(cards[1].wordId)
        } else {
            first.reveal(); first.next()
            first.typedAnswer = "unfinished answer"
            if mode != .fill { first.choose(try #require(first.current?.answerIndex)) }
        }
        let encoder = JSONEncoder()
        encoder.outputFormatting = .sortedKeys
        let deck = try encoder.encode(try #require(first.deck))
        let order = first.meanings.map(\.wordId)
        let index = first.index
        let revealed = first.revealed
        let correctCount = first.correctCount
        let selectedTerm = first.selectedTerm
        let reads = await words.pages.count
        // Repeated view/foreground tasks must not fetch or reset progress.
        await first.resume(); await first.resume()
        #expect(first.index == index && first.revealed == revealed)
        #expect(await words.pages.count == reads)
        first.deactivate(); store.close(clear: false)
        let reopened = FlashcardsViewModel(api: api,
            store: StudyCheckpointStore(defaults: defaults, namespace: "api|a"))
        await reopened.resume(offlineOnly: true)
        #expect(try encoder.encode(try #require(reopened.deck)) == deck)
        #expect(reopened.mode == mode && reopened.index == index)
        #expect(reopened.revealed == revealed && reopened.correctCount == correctCount)
        #expect(reopened.meanings.map(\.wordId) == order && reopened.selectedTerm == selectedTerm)
        if mode == .match { #expect(reopened.matched.count == 1 && reopened.matchedMeanings.count == 1) }
        else { #expect(reopened.typedAnswer == "unfinished answer") }
        #expect(await words.pages.count == reads)
        let other = FlashcardsViewModel(api: api,
            store: StudyCheckpointStore(defaults: defaults, namespace: "api|b"))
        #expect(other.deck == nil)
        let cleanup = StudyCheckpointStore(defaults: defaults, namespace: "api|a")
        cleanup.close(clear: true)
        #expect(StudyCheckpointStore(defaults: defaults, namespace: "api|a").value.flashcard == nil)
    }

    @Test func cancelledInitialLoadCanResumeInsteadOfLeavingBlankScreen() async {
        let model = FlashcardsViewModel(api: NotebookFlashcards(words: NotebookStub(count: 23)))
        let work = Task {
            withUnsafeCurrentTask { $0?.cancel() }
            await model.resume()
        }
        await work.value
        #expect(!model.loading && model.feedback != nil)
        await model.resume()
        #expect(model.deck?.count == 10 && model.feedback == nil)
    }

    private func finish(_ model: FlashcardsViewModel) throws -> Set<String> {
        let deck = try #require(model.deck)
        if model.mode == .match {
            for card in deck.cards { model.selectTerm(card.wordId); model.selectMeaning(card.wordId) }
        } else {
            for _ in deck.cards { model.reveal(); model.next() }
        }
        #expect(model.completed)
        return Set(deck.cards.map(\.wordId))
    }

    @Test(arguments: FlashcardMode.allCases)
    func nextRoundNeverRepeatsAndLastBatchUsesOnlyRemainingWords(_ mode: FlashcardMode) async throws {
        let model = FlashcardsViewModel(api: NotebookFlashcards(words: NotebookStub(count: 23)))
        var seen = Set<String>()
        for expected in [10, 10, 3] {
            await model.load(mode: mode)
            #expect(model.deck?.count == expected)
            let ids = try finish(model)
            #expect(seen.isDisjoint(with: ids)); seen.formUnion(ids)
        }
        await model.load()
        #expect(model.roundFinished && model.deck?.count == 0)
        #expect(seen.count == 23)
        await model.load(restartRound: true)
        #expect(model.deck?.count == 10 && !model.roundFinished)
    }

    @Test func completedIDsSurviveRecreationAndStaySeparateFromAnotherAccount() async throws {
        let name = "flashcards-test-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: name))
        defer { defaults.removePersistentDomain(forName: name) }
        let store = StudyCheckpointStore(defaults: defaults, namespace: "api|user-a")
        let api = NotebookFlashcards(words: NotebookStub(count: 23))
        let first = FlashcardsViewModel(api: api, store: store)
        await first.load(); let seen = try finish(first); first.deactivate(); store.close(clear: false)
        let reopened = FlashcardsViewModel(api: api,
            store: StudyCheckpointStore(defaults: defaults, namespace: "api|user-a"))
        await reopened.load(mode: .fill)
        #expect(seen.isDisjoint(with: Set(try #require(reopened.deck).cards.map(\.wordId))))
        let other = FlashcardsViewModel(api: api,
            store: StudyCheckpointStore(defaults: defaults, namespace: "api|user-b"))
        await other.load()
        #expect(Set(try #require(other.deck).cards.map(\.wordId)) == seen)
    }

    @Test func canReachWordsBeyondFirstHundredAndFailureDoesNotResetProgress() async throws {
        let words = NotebookStub(count: 125)
        let model = FlashcardsViewModel(api: NotebookFlashcards(words: words))
        var seen = Set<String>()
        await model.load(); seen.formUnion(try finish(model))
        await words.fail(on: 2); await model.load()
        #expect(model.feedback != nil && model.deck == nil)
        await words.fail(on: nil)
        for _ in 0..<12 {
            await model.load()
            let ids = try finish(model)
            #expect(seen.isDisjoint(with: ids)); seen.formUnion(ids)
        }
        #expect(seen.count == 125)
        #expect(await words.pages.contains(2))
    }

    @Test func todayScopeDoesNotFallBackToOldWordsAfterExhaustingToday() {
        let now = APIDate.parse("2026-10-19T04:00:00Z")!
        let words = notebookWords(23)
        let deck = NotebookFlashcards.makeDeck(words: words, mode: .guess, scope: .today, limit: 10,
                                               excluding: Set(words.map(\.id)), now: now)
        #expect(deck.scope == .today && deck.count == 0)
        let fallback = NotebookFlashcards.makeDeck(words: words, mode: .guess, scope: .today, limit: 10,
                                                   excluding: [], now: now.addingTimeInterval(86400))
        #expect(fallback.scope == .due && fallback.count == 10)
    }

    @Test func optionsAndClozeRemainValidForAllModes() {
        for mode in FlashcardMode.allCases {
            let deck = NotebookFlashcards.makeDeck(words: notebookWords(13), mode: mode, scope: .due,
                                                   limit: 10, excluding: [])
            for card in deck.cards {
                #expect(card.synonyms?.count == 1 && card.antonyms?.count == 1)
                if mode == .guess || mode == .listen {
                    #expect(card.options?[try! #require(card.answerIndex)] == card.meaning)
                    #expect(Set(card.options ?? []).count == 4)
                } else if mode == .fill { #expect(card.cloze == "I know _____.") }
            }
        }
    }

    @Test func repeatedPaginationFailsInsteadOfReportingFalseExhaustion() async {
        let words = NotebookStub(count: 300); await words.repeatFirstPage()
        let model = FlashcardsViewModel(api: NotebookFlashcards(words: words))
        await model.load()
        #expect(model.deck == nil && model.feedback != nil && !model.roundFinished)
        #expect(await words.pages == [1, 2])
    }
}

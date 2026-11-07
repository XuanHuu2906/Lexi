import Foundation
import Observation

private enum OfflineDeckFailure: Error { case noSnapshot }

@MainActor @Observable
final class FlashcardsViewModel {
    private(set) var mode: FlashcardMode = .guess
    private(set) var requestedScope: FlashcardScope = .due
    private(set) var deck: FlashcardSet?
    private(set) var index = 0
    private(set) var revealed = false
    private(set) var correct: Bool?
    private(set) var correctCount = 0
    private(set) var loading = false
    private(set) var feedback: FeatureFeedback?
    private(set) var matched = Set<String>()
    private(set) var matchedMeanings = Set<String>()
    private(set) var selectedTerm: String?
    private(set) var meanings: [FlashcardSet.Card] = []
    var typedAnswer = "" { didSet { saveSession() } }
    private let api: any FlashcardServing
    private let cache: OfflineNotebookCache?
    private let store: StudyCheckpointStore
    private var completedWords: [FlashcardScope: Set<String>] = [:]
    var roundFinished: Bool { deck?.cards.isEmpty == true && !(completedWords[requestedScope] ?? []).isEmpty }
    private var operation = UUID()
    private var active = true
    var current: FlashcardSet.Card? {
        guard let cards = deck?.cards, cards.indices.contains(index) else { return nil }
        return cards[index]
    }
    var completed: Bool {
        guard let deck else { return false }
        return mode == .match ? matched.count == deck.cards.count : index >= deck.cards.count
    }

    init(api: any FlashcardServing, store: StudyCheckpointStore = StudyCheckpointStore(),
         cache: OfflineNotebookCache? = nil) {
        self.api = api; self.store = store; self.cache = cache
        for scope in FlashcardScope.allCases {
            completedWords[scope] = Set(store.value.completedFlashcards?[scope.rawValue] ?? [])
        }
        if let draft = store.value.flashcard,
           draft.deck.count == draft.deck.cards.count,
           (0...draft.deck.count).contains(draft.index),
           draft.deck.count <= 10 {
            mode = draft.deck.mode; requestedScope = draft.scope
            deck = draft.deck; index = draft.index; revealed = draft.revealed
            correct = draft.correct; correctCount = draft.correctCount
            matched = draft.matched; matchedMeanings = draft.matchedMeanings
            selectedTerm = draft.selectedTerm; meanings = draft.meanings
            typedAnswer = draft.typedAnswer
        }
    }

    /// SwiftUI may restart a view task after an interruption. Only explicit
    /// mode/scope changes or "new cards" should replace an existing deck.
    func resume(offlineOnly: Bool = false) async {
        guard active, deck == nil, !loading else { return }
        await load(offlineOnly: offlineOnly)
    }

    func load(mode: FlashcardMode? = nil, scope: FlashcardScope? = nil,
              restartRound: Bool = false, offlineOnly: Bool = false) async {
        guard active, feedback?.canRetry() != false else { return }
        if let mode { self.mode = mode }; if let scope { requestedScope = scope }
        store.update { $0.flashcard = nil }
        if restartRound { completedWords[requestedScope] = []; saveRound() }
        let id = UUID(); operation = id
        let requestedMode = self.mode
        loading = true; feedback = nil; deck = nil; resetCard()
        index = 0; correctCount = 0; matched = []; matchedMeanings = []; selectedTerm = nil; meanings = []
        defer { if operation == id { loading = false } }
        do {
            let excluded = completedWords[requestedScope] ?? []
            let response: FlashcardSet
            if offlineOnly {
                guard let snapshot = await cache?.load() else {
                    throw OfflineDeckFailure.noSnapshot
                }
                response = NotebookFlashcards.makeDeck(
                    words: snapshot.words, mode: requestedMode, scope: requestedScope,
                    limit: 10, excluding: excluded, offline: true)
            } else {
                response = try await api.flashcards(mode: requestedMode, scope: requestedScope,
                                                    limit: 10, excluding: excluded)
            }
            try Task.checkCancellation()
            guard operation == id else { return }
            guard response.mode == requestedMode, response.count == response.cards.count,
                  response.count <= 10, response.cards.allSatisfy({ !excluded.contains($0.wordId) }),
                  Set(response.cards.map(\.wordId)).count == response.cards.count,
                  response.cards.allSatisfy({ card in
                      guard !card.term.trimmed.isEmpty, !card.meaning.trimmed.isEmpty else { return false }
                      if requestedMode == .guess || requestedMode == .listen {
                          guard let options = card.options, let answer = card.answerIndex else { return false }
                          return !options.isEmpty && options.indices.contains(answer) && options.allSatisfy { !$0.trimmed.isEmpty }
                      }
                      return true
                  }) else { throw HTTPError.invalidResponse }
            deck = response; meanings = response.cards.shuffled()
            saveSession()
        } catch {
            guard operation == id else { return }
            if isCancellation(error) {
                feedback = FeatureFeedback(message: "Lượt tải thẻ bị gián đoạn. Bấm Thử lại để tiếp tục.")
                return
            }
            if error is OfflineDeckFailure {
                feedback = FeatureFeedback(message: "Chưa có Flashcards đã lưu trên thiết bị. Hãy kết nối mạng và lưu sổ từ trước.")
            } else if case .validation = error as? HTTPError {
                feedback = FeatureFeedback(message: "Chưa thể tải bộ thẻ. Hãy kiểm tra sổ từ và thử lại.")
            } else { feedback = FeatureFeedback(error) }
        }
    }

    func deactivate() { active = false; operation = UUID(); completedWords = [:] }
    func reveal() { guard active, current != nil else { return }; revealed = true; saveSession() }
    func choose(_ option: Int) {
        guard active, !revealed, let card = current, let options = card.options, options.indices.contains(option) else { return }
        finish(correct: option == card.answerIndex)
    }
    func checkTyped() {
        guard active, !revealed, let card = current, !typedAnswer.trimmed.isEmpty else { return }
        finish(correct: typedAnswer.trimmed.caseInsensitiveCompare(card.term.trimmed) == .orderedSame)
    }
    private func finish(correct: Bool) {
        self.correct = correct; revealed = true
        if correct { correctCount += 1 }
        saveSession()
    }
    func next() {
        guard active, revealed, current != nil else { return }
        index += 1; resetCard()
        rememberCompletedDeck()
        saveSession()
    }
    func selectTerm(_ id: String) {
        guard active, !matched.contains(id), deck?.cards.contains(where: { $0.wordId == id }) == true else { return }
        selectedTerm = id; correct = nil
        saveSession()
    }
    func selectMeaning(_ id: String) {
        guard active, let selectedTerm, !matchedMeanings.contains(id),
              let term = deck?.cards.first(where: { $0.wordId == selectedTerm }),
              let meaning = deck?.cards.first(where: { $0.wordId == id }) else { return }
        // Identical meanings are valid matches; retain one-to-one word IDs.
        correct = term.meaning == meaning.meaning
        if correct == true {
            matched.insert(selectedTerm); matchedMeanings.insert(id)
            self.selectedTerm = nil; correctCount += 1
            rememberCompletedDeck()
        }
        saveSession()
    }
    private func saveSession() {
        guard active, let deck else { return }
        let draft = StudyCheckpointStore.FlashcardDraft(
            deck: deck, scope: requestedScope, index: index, revealed: revealed,
            correct: correct, correctCount: correctCount, matched: matched,
            matchedMeanings: matchedMeanings, selectedTerm: selectedTerm,
            meanings: meanings, typedAnswer: typedAnswer)
        store.update { $0.flashcard = draft }
    }
    private func rememberCompletedDeck() {
        guard completed, let deck else { return }
        completedWords[requestedScope, default: []].formUnion(deck.cards.map(\.wordId))
        saveRound()
    }
    private func saveRound() {
        let ids = Array(completedWords[requestedScope] ?? []).sorted()
        store.update {
            if $0.completedFlashcards == nil { $0.completedFlashcards = [:] }
            $0.completedFlashcards?[requestedScope.rawValue] = ids
        }
    }
    private func resetCard() { revealed = false; correct = nil; typedAnswer = "" }
}

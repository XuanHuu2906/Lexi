import Foundation
import Observation

@MainActor @Observable
final class ReviewViewModel {
    private(set) var cards: [Word] = []
    private(set) var currentIndex = 0
    private(set) var isSubmitting = false
    private(set) var isLoading = false
    private(set) var revealed = false
    private(set) var loaded = false
    private(set) var result: ReviewAnswerResult?
    private(set) var acknowledged = 0
    private(set) var needsPractice = 0
    private(set) var serverDueTotal: Int?
    private(set) var feedback: FeatureFeedback?
    private(set) var uncertain = false
    private(set) var skippedUncertain = 0
    private let api: any ReviewServing
    private let store: StudyCheckpointStore
    private let changed: @MainActor () -> Void
    private var operation = UUID()
    private var active = true
    var current: Word? { cards.indices.contains(currentIndex) ? cards[currentIndex] : nil }
    var completed: Bool { loaded && current == nil && !isLoading && !uncertain }

    init(api: any ReviewServing, store: StudyCheckpointStore, changed: @escaping @MainActor () -> Void = {}) {
        self.api = api; self.store = store; self.changed = changed
    }

    func load() async {
        guard active, !isSubmitting, !isLoading, feedback?.canRetry() != false else { return }
        let id = UUID(); operation = id
        isLoading = true
        defer { if operation == id { isLoading = false } }
        do {
            let due = try await api.due(limit: 20)
            try Task.checkCancellation()
            guard active, operation == id else { return }
            var seen = Set<String>()
            skippedUncertain = 0
            cards = due.items.filter { word in
                guard seen.insert(word.id).inserted else { return false }
                if let previous = store.value.uncertainReviews[word.id] {
                    if previous == (word.nextReviewAt ?? "unknown") { skippedUncertain += 1; return false }
                    store.update { $0.uncertainReviews.removeValue(forKey: word.id) }
                }
                return true
            }
            // Keep the server's ordering and clock; never calculate SM-2 here.
            currentIndex = 0; revealed = false; loaded = true
            serverDueTotal = due.total; uncertain = false; feedback = nil
        } catch {
            guard active, operation == id, !isCancellation(error) else { return }
            feedback = FeatureFeedback(error)
        }
    }

    func reveal() { if !isSubmitting && !isLoading && !uncertain { revealed = true } }

    func submit(_ rating: ReviewRating) async {
        guard active, let word = current, revealed, !isSubmitting, !isLoading, !uncertain,
              feedback?.canRetry() != false else { return }
        isSubmitting = true; feedback = nil
        let id = operation
        store.update { $0.uncertainReviews[word.id] = word.nextReviewAt ?? "unknown" }
        defer { if operation == id { isSubmitting = false } }
        do {
            let response = try await api.answer(wordID: word.id, rating: rating)
            guard active, operation == id else { return }
            result = response
            store.update { $0.uncertainReviews.removeValue(forKey: word.id) }
            acknowledged += 1
            if rating == .forgot || rating == .hard { needsPractice += 1 }
            currentIndex += 1; revealed = false; serverDueTotal = nil
            changed()
            if current == nil {
                // A separate read failure must never undo an acknowledged POST.
                do {
                    let total = try await api.due(limit: 1).total
                    guard active, operation == id else { return }
                    serverDueTotal = total
                } catch {
                    if active, operation == id, !isCancellation(error) { feedback = FeatureFeedback(error) }
                }
            }
        } catch {
            guard active, operation == id else { return }
            if isDefiniteRejection(error) {
                store.update { $0.uncertainReviews.removeValue(forKey: word.id) }
            } else { uncertain = true; changed() }
            feedback = FeatureFeedback(error, mutation: true)
        }
    }

    func deactivate() { active = false; operation = UUID() }
}

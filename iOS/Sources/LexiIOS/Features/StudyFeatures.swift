import Foundation
import Observation

@MainActor @Observable
final class StudyFeatures {
    let review: ReviewViewModel
    let flashcards: FlashcardsViewModel
    let quiz: QuizViewModel
    private let store: StudyCheckpointStore

    init(api: LexiAPI, userID: String, changed: @escaping @MainActor () -> Void,
         cache: OfflineNotebookCache? = nil) {
        let store = StudyCheckpointStore(defaults: .standard,
            namespace: api.client.environment.apiBaseURL.absoluteString + "|" + userID)
        self.store = store
        review = ReviewViewModel(api: api.review, store: store, changed: changed)
        flashcards = FlashcardsViewModel(api: NotebookFlashcards(words: api.words, cache: cache), store: store)
        quiz = QuizViewModel(api: api.quiz, store: store, changed: changed)
    }

    func deactivate(clear: Bool) {
        review.deactivate(); flashcards.deactivate(); quiz.deactivate(); store.close(clear: clear)
    }
}

import Foundation
import Observation

@MainActor @Observable
final class QuizViewModel {
    private(set) var quizID: String?
    private(set) var questions: [QuizQuestion] = []
    private(set) var answers: [Int] = []
    private(set) var currentIndex = 0
    private(set) var result: QuizResult?
    private(set) var busy = false
    private(set) var saving = false
    private(set) var dirty = false
    private(set) var needsReconciliation = false
    private(set) var opened = false
    private(set) var feedback: FeatureFeedback?
    private(set) var notice: String?
    private let api: any QuizServing
    private let store: StudyCheckpointStore
    private let changed: @MainActor () -> Void
    private var debounce: Task<Void, Never>?
    private var version = 0
    private var active = true
    private var discoverySucceeded = false
    var current: QuizQuestion? { questions.indices.contains(currentIndex) ? questions[currentIndex] : nil }
    var answeredCount: Int { answers.filter { $0 >= 0 }.count }
    var canSubmit: Bool { !questions.isEmpty && answeredCount == questions.count && !busy && !saving && !needsReconciliation && result == nil }
    var canGenerate: Bool {
        active && discoverySucceeded && !busy && !saving && !needsReconciliation && quizID == nil
    }

    init(api: any QuizServing, store: StudyCheckpointStore, changed: @escaping @MainActor () -> Void = {}) {
        self.api = api; self.store = store; self.changed = changed
        needsReconciliation = store.value.quizGenerationPending == true || store.value.quiz?.uncertainSubmission == true
    }

    func open(id requestedID: String? = nil) async {
        guard active, !busy, !saving, feedback?.canRetry() != false else { return }
        debounce?.cancel()
        busy = true; feedback = nil
        defer { busy = false; opened = true }
        let targetID = requestedID ?? quizID ?? store.value.quiz?.id
        do {
            let draft = store.value.quiz
            let state: QuizState?
            if let id = targetID { state = try await api.get(id: id) }
            else { state = try await api.latest().quiz }
            try Task.checkCancellation()
            guard active else { return }
            if let state {
                guard targetID == nil || state.quizId == targetID else { throw HTTPError.invalidResponse }
                try apply(state, draft: draft)
                notice = state.status == .completed ? nil : "Đã tải bài đang làm. Câu trả lời được đồng bộ khi lưu thành công."
            }
            store.update { $0.quizGenerationPending = nil }
            needsReconciliation = false
            discoverySucceeded = true
        } catch {
            guard active, !isCancellation(error) else { return }
            if case .notFound = error as? HTTPError {
                if targetID != nil {
                    reset(); store.update { $0.quiz = nil }
                    notice = "Bài này không còn tồn tại. Bạn có thể tạo bài mới."
                } else if store.value.quizGenerationPending == true {
                    // A missing /latest route is not proof that POST /generate failed.
                    needsReconciliation = true
                    notice = "Chưa xác nhận được bài vừa tạo. Máy chủ cần hỗ trợ tìm bài gần nhất để tiếp tục an toàn."
                    return
                } else {
                    // Compatible with the previously deployed API, which has no /latest yet.
                    notice = "Máy chủ chưa hỗ trợ tìm bài gần nhất. Bài được tạo trên máy này vẫn có thể tiếp tục."
                }
                store.update { $0.quizGenerationPending = nil }
                needsReconciliation = false
                discoverySucceeded = true
            } else { feedback = FeatureFeedback(error) }
        }
    }

    func generate(count: Int = 10) async {
        guard canGenerate, feedback?.canRetry() != false else { return }
        busy = true; feedback = nil; notice = nil
        store.update { $0.quizGenerationPending = true }
        defer { busy = false }
        do {
            let generated = try await api.generate(count: count)
            guard active else { return }
            if !generated.quizId.isEmpty {
                // Keep the returned ID even when the payload cannot yet be displayed.
                store.update { $0.quiz = .init(id: generated.quizId, answers: [], dirty: false, uncertainSubmission: true) }
            }
            try validate(generated.questions, total: generated.total, completed: false)
            guard !generated.quizId.isEmpty else { throw HTTPError.invalidResponse }
            quizID = generated.quizId; questions = generated.questions
            answers = Array(repeating: -1, count: questions.count); currentIndex = 0
            result = nil; dirty = false; needsReconciliation = false
            store.update { $0.quizGenerationPending = nil }
            persist()
        } catch {
            guard active else { return }
            if case .validation = error as? HTTPError {
                feedback = FeatureFeedback(message: "Cần ít nhất 4 từ trong sổ từ để tạo bài kiểm tra.")
            } else { feedback = FeatureFeedback(error, mutation: true) }
            if !isDefiniteRejection(error) {
                needsReconciliation = true
                notice = "Chưa rõ bài đã được tạo chưa. Hãy kiểm tra bài gần nhất trước khi tạo lại."
            } else { store.update { $0.quizGenerationPending = nil } }
        }
    }

    func select(_ option: Int) {
        guard active, !busy, !needsReconciliation, result == nil, let question = current,
              question.options.indices.contains(option), answers.indices.contains(currentIndex) else { return }
        answers[currentIndex] = option; version += 1; dirty = true
        persist(); scheduleSave()
    }

    func move(_ offset: Int) {
        let next = currentIndex + offset
        guard questions.indices.contains(next), !busy else { return }
        currentIndex = next
    }

    private func scheduleSave() {
        debounce?.cancel()
        debounce = Task { [weak self] in
            do { try await Task.sleep(for: .milliseconds(600)) } catch { return }
            // A later tap may cancel the timer, but must not cancel an in-flight PATCH.
            self?.debounce = nil
            await self?.saveProgress()
        }
    }

    func saveProgress() async {
        guard active, let id = quizID, dirty, !saving, !busy, !needsReconciliation,
              result == nil, feedback?.canRetry() != false else { return }
        saving = true; feedback = nil
        let snapshot = answers; let revision = version
        do {
            guard try await api.saveProgress(id: id, answers: snapshot).saved else { throw HTTPError.invalidResponse }
            guard active else { saving = false; return }
            if revision == version { dirty = false }
            persist()
            notice = dirty ? "Đang lưu thay đổi tiếp theo…" : "Đã lưu tiến trình trên máy chủ."
        } catch {
            guard active else { saving = false; return }
            feedback = FeatureFeedback(error, mutation: true)
            // Read before another PATCH: another device may already have submitted.
            needsReconciliation = true
            persist()
        }
        saving = false
        if active, dirty, feedback == nil { scheduleSave() }
    }

    func submit() async {
        guard active, canSubmit, let id = quizID, feedback?.canRetry() != false else { return }
        debounce?.cancel(); busy = true; feedback = nil
        needsReconciliation = true; persist()
        defer { busy = false }
        do {
            let response = try await api.submit(id: id, answers: answers)
            guard active else { return }
            try validateResult(response)
            result = response; dirty = false; needsReconciliation = false
            persist(); changed()
        } catch {
            guard active else { return }
            feedback = FeatureFeedback(error, mutation: true)
            // Includes 400 "already submitted": GET determines the authoritative result.
            persist()
        }
    }

    func newQuiz() {
        guard result != nil, !busy, !saving else { return }
        debounce?.cancel(); reset(); store.update { $0.quiz = nil }
    }

    func deactivate() { active = false; debounce?.cancel() }

    private func apply(_ state: QuizState, draft: StudyCheckpointStore.QuizDraft?) throws {
        guard !state.quizId.isEmpty else { throw HTTPError.invalidResponse }
        try validate(state.questions, total: state.total, completed: state.status == .completed)
        let serverAnswers = state.questions.map { question -> Int in
            if case .value(let value) = question.userAnswer { return value }
            return -1
        }
        var nextAnswers = serverAnswers
        let retainDraft = state.status == .inProgress && draft?.id == state.quizId && draft?.dirty == true
        if retainDraft, let draft, draft.answers.count == state.total {
            nextAnswers = draft.answers.enumerated().map { index, value in
                state.questions[index].options.indices.contains(value) ? value : serverAnswers[index]
            }
        }
        var completedResult: QuizResult?
        if state.status == .completed {
            completedResult = QuizResult(quizId: state.quizId, score: state.score, total: state.total,
                results: state.questions.map { question in
                    let answer = question.answerIndex! // validated above
                    let given = serverAnswers[question.index]
                    return QuizResult.Answer(index: question.index, correct: answer == given,
                        yourAnswer: given, answerIndex: answer, explanation: question.explanation ?? "")
                })
            guard (0...state.total).contains(state.score) else { throw HTTPError.invalidResponse }
        }
        let newlyCompleted = completedResult != nil && (result == nil || quizID != state.quizId)
        quizID = state.quizId; questions = state.questions; answers = nextAnswers; result = completedResult
        currentIndex = nextAnswers.firstIndex(of: -1) ?? 0
        dirty = retainDraft && nextAnswers != serverAnswers
        needsReconciliation = false; version += 1; persist()
        if newlyCompleted { changed() }
    }

    private func validate(_ questions: [QuizQuestion], total: Int, completed: Bool) throws {
        guard total > 0, total == questions.count, questions.enumerated().allSatisfy({ offset, question in
            guard question.index == offset, !question.question.trimmed.isEmpty,
                  question.options.count >= 2, question.options.allSatisfy({ !$0.trimmed.isEmpty }),
                  Set(question.options).count == question.options.count else { return false }
            if case .value(let answer) = question.userAnswer,
               answer != -1 && !question.options.indices.contains(answer) { return false }
            if completed { return question.answerIndex.map { question.options.indices.contains($0) } ?? false }
            return true
        }) else { throw HTTPError.invalidResponse }
    }

    private func validateResult(_ value: QuizResult) throws {
        guard value.quizId == quizID, value.total == questions.count, (0...value.total).contains(value.score),
              value.results.count == value.total, Set(value.results.map(\.index)) == Set(questions.indices),
              value.results.allSatisfy({ row in
                  questions.indices.contains(row.index) && questions[row.index].options.indices.contains(row.answerIndex)
                    && (row.yourAnswer == -1 || questions[row.index].options.indices.contains(row.yourAnswer))
              }) else { throw HTTPError.invalidResponse }
    }

    private func persist() {
        guard let id = quizID else { return }
        store.update { $0.quiz = .init(id: id, answers: answers, dirty: dirty, uncertainSubmission: needsReconciliation) }
    }
    private func reset() {
        quizID = nil; questions = []; answers = []; currentIndex = 0; result = nil
        dirty = false; needsReconciliation = false; feedback = nil; notice = nil; version += 1
    }
}

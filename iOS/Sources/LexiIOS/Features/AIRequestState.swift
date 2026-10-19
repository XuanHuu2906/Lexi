import Foundation
import Observation

enum AIRequestState: Equatable {
    case idle, submitting, success, validationError, rateLimited, timeout, offline, serverError, cancelled
}
enum AIAction: String, Sendable {
    case tutor, grammarQA, writing, context, grammarPreview, grammarExamples
    case conversationStart, conversationReply, conversationEnd
    case grammarRead, grammarSave, grammarDelete, conversationRead
    case pronunciation, dictationGenerate, dictationExplain
    var usesAI: Bool {
        switch self { case .grammarRead, .grammarSave, .grammarDelete, .conversationRead: false; default: true }
    }
}

// Session-local aggregate counters only. No prompts, replies, IDs, or external analytics.
@MainActor @Observable
final class AIUsage {
    struct Counts { var requests = 0; var failures = 0; var rateLimits = 0 }
    private(set) var counts: [AIAction: Counts] = [:]
    func started(_ action: AIAction) { if action.usesAI { counts[action, default: Counts()].requests += 1 } }
    func failed(_ action: AIAction, rateLimited: Bool) {
        guard action.usesAI else { return }
        counts[action, default: Counts()].failures += 1
        if rateLimited { counts[action, default: Counts()].rateLimits += 1 }
    }
}

@MainActor @Observable
final class AIRequestGate {
    private(set) var state: AIRequestState = .idle
    private(set) var feedback: FeatureFeedback?
    private(set) var uncertain = false
    private(set) var closed = false
    private var generation = UUID()
    private var cancelWork: (() -> Void)?
    private var action: AIAction?
    let usage: AIUsage
    var busy: Bool { state == .submitting }
    var canStart: Bool { !closed && !busy && feedback?.canRetry() != false }

    init(usage: AIUsage = AIUsage()) { self.usage = usage }

    func validation(_ message: String) {
        guard canStart else { return }
        state = .validationError; feedback = FeatureFeedback(message: message); uncertain = false
    }

    func run<Value: Sendable>(_ action: AIAction, work: @escaping @Sendable () async throws -> Value) async -> Value? {
        guard canStart else { return nil }
        let id = UUID(); generation = id
        state = .submitting; feedback = nil; uncertain = false; self.action = action
        usage.started(action)
        let task = Task { try await work() }
        cancelWork = { task.cancel() }
        defer { if generation == id { cancelWork = nil; self.action = nil } }
        do {
            let value = try await withTaskCancellationHandler { try await task.value } onCancel: { task.cancel() }
            try Task.checkCancellation()
            guard generation == id, !closed else { return nil }
            state = .success
            return value
        } catch {
            guard generation == id, !closed else { return nil }
            uncertain = !isDefiniteRejection(error)
            switch error as? HTTPError {
            case .validation, .invalidRequest: state = .validationError
            case .rateLimit: state = .rateLimited
            case .timeout: state = .timeout
            case .network: state = .offline
            case .cancellation: state = .cancelled
            default: state = isCancellation(error) ? .cancelled : .serverError
            }
            usage.failed(action, rateLimited: state == .rateLimited)
            if isCancellation(error) {
                feedback = FeatureFeedback(message: "Đã dừng chờ. Nội dung nhập vẫn còn; yêu cầu trước có thể vẫn được xử lý. Lexi không tự gửi lại.")
            } else if case .notFound = error as? HTTPError {
                feedback = FeatureFeedback(message: "Nội dung này không còn tồn tại hoặc bạn không có quyền truy cập.")
            } else {
                feedback = FeatureFeedback(
                    error,
                    mutation: action.usesAI || action == .grammarSave || action == .grammarDelete,
                    context: action == .pronunciation ? .pronunciation : .general
                )
            }
            return nil
        }
    }

    func cancel() {
        guard busy else { return }
        cancelWork?(); cancelWork = nil; generation = UUID()
        if let action { usage.failed(action, rateLimited: false) }
        action = nil; state = .cancelled; uncertain = true
        feedback = FeatureFeedback(message: "Đã dừng chờ. Nội dung nhập vẫn còn; yêu cầu trước có thể vẫn được xử lý. Lexi không tự gửi lại.")
    }
    func deactivate() { cancel(); closed = true }
}

import Foundation
import Observation

struct AIChatMessage: Identifiable {
    let id = UUID()
    let role: ChatRole
    let content: String
    var takeaways: TutorResult? = nil
}

@MainActor @Observable
final class AIChatViewModel {
    let kind: AIChatKind
    let request: AIRequestGate
    var draft = ""
    private(set) var messages: [AIChatMessage] = []
    private(set) var pendingQuestion: String?
    private let api: any AITextServing
    private var operation = UUID()
    init(kind: AIChatKind, api: any AITextServing, usage: AIUsage = AIUsage()) {
        self.kind = kind; self.api = api; request = AIRequestGate(usage: usage)
    }
    func send() async {
        guard request.canStart else { return }
        let question = draft.trimmed
        guard question.validAIInput(limit: 1000) else { request.validation("Nhập câu hỏi từ 1 đến 1.000 ký tự."); return }
        let history = messages.suffix(50).map { ChatTurn(role: $0.role, content: $0.content) }
        let id = UUID(); operation = id
        pendingQuestion = question
        defer { if operation == id { pendingQuestion = nil } }
        guard let result = await request.run(kind == .tutor ? .tutor : .grammarQA, work: { [api, kind] in
            try await api.ask(kind: kind, question: question, history: history)
        }) else { return }
        messages.append(.init(role: .user, content: question))
        messages.append(.init(role: .assistant, content: result.answer, takeaways: result))
        if draft.trimmed == question { draft = "" }
    }
    func clear() { guard request.canStart else { return }; messages = []; draft = "" }
    func deactivate() { request.deactivate(); messages = []; draft = ""; pendingQuestion = nil }
}

@MainActor @Observable
final class WritingViewModel {
    let request: AIRequestGate
    var draft = ""
    private(set) var submittedText = ""
    private(set) var result: WritingResult?
    private(set) var undoText: String?
    private let api: any AITextServing
    init(api: any AITextServing, usage: AIUsage = AIUsage()) { self.api = api; request = AIRequestGate(usage: usage) }
    func grade() async {
        guard request.canStart else { return }
        let text = draft.trimmed
        guard text.validAIInput(limit: 5000) else { request.validation("Nhập đoạn viết từ 1 đến 5.000 ký tự."); return }
        guard let value = await request.run(.writing, work: { [api] in try await api.grade(text: text) }) else { return }
        submittedText = text; result = value; undoText = nil
    }
    func useCorrection() {
        guard request.canStart, let result else { return }
        undoText = draft; draft = result.correctedText
    }
    func undo() { guard request.canStart, let undoText else { return }; draft = undoText; self.undoText = nil }
    func deactivate() { request.deactivate(); draft = ""; submittedText = ""; result = nil; undoText = nil }
}

@MainActor @Observable
final class ContextViewModel {
    let request: AIRequestGate
    var draft = ""
    var level: CEFRLevel = .b1
    private(set) var submittedText = ""
    private(set) var result: ContextResult?
    private let api: any AITextServing
    init(api: any AITextServing, usage: AIUsage = AIUsage()) { self.api = api; request = AIRequestGate(usage: usage) }
    func analyze() async {
        guard request.canStart else { return }
        let passage = draft.trimmed; let level = level
        guard passage.validAIInput(limit: 4000) else { request.validation("Nhập đoạn đọc từ 1 đến 4.000 ký tự."); return }
        guard let value = await request.run(.context, work: { [api] in try await api.analyze(passage: passage, level: level) }) else { return }
        submittedText = passage; result = value
    }
    func deactivate() { request.deactivate(); draft = ""; submittedText = ""; result = nil }
}

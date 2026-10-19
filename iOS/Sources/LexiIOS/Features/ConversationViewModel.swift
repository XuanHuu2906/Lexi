import Foundation
import Observation

// Persist only recovery metadata. Transcripts/drafts stay in memory and are never logged.
@MainActor
final class ConversationCheckpointStore {
    struct Value: Codable {
        var id: String?
        var pending = false
        var transcriptCount = 0
    }
    private let defaults: UserDefaults?
    private let key: String
    private var closed = false
    private(set) var value: Value
    init(defaults: UserDefaults? = nil, namespace: String = "memory") {
        self.defaults = defaults; key = "lexi.conversation.v1." + Data(namespace.utf8).base64EncodedString()
        value = defaults?.data(forKey: key).flatMap { try? JSONDecoder().decode(Value.self, from: $0) } ?? Value()
    }
    func save(_ value: Value) {
        guard !closed else { return }; self.value = value
        if let data = try? JSONEncoder().encode(value) { defaults?.set(data, forKey: key) }
    }
    func close(clear: Bool) { if clear { value = Value(); defaults?.removeObject(forKey: key) }; closed = true }
}

@MainActor @Observable
final class ConversationViewModel {
    let request: AIRequestGate
    var scenario = ""
    var draft = ""
    private(set) var items: [ConversationItem] = []
    private(set) var detail: ConversationDetail?
    private(set) var needsReconciliation: Bool
    private(set) var notice: String?
    private(set) var loaded = false
    private let api: any ConversationServing
    private let store: ConversationCheckpointStore
    private var operation = UUID()
    var canReply: Bool { detail?.status == .active && !needsReconciliation && request.canStart }
    var canStart: Bool { detail == nil && loaded && !needsReconciliation && request.canStart }

    init(api: any ConversationServing, store: ConversationCheckpointStore, usage: AIUsage = AIUsage()) {
        self.api = api; self.store = store; request = AIRequestGate(usage: usage)
        needsReconciliation = store.value.pending
    }
    func load() async {
        guard request.canStart else { return }
        let token = UUID(); operation = token
        guard let rows = await request.run(.conversationRead, work: { [api] in try await api.list() }) else { return }
        guard operation == token else { return }
        items = rows; loaded = true
        if let id = detail?.id ?? store.value.id { await open(id: id) }
        else if needsReconciliation {
            notice = "Chưa rõ cuộc hội thoại đã được tạo chưa. Kiểm tra lịch sử bên dưới; Lexi không tự bắt đầu lại."
        }
    }
    func open(id: String) async {
        guard request.canStart else { return }
        guard !needsReconciliation || store.value.id == nil || store.value.id == id else { return }
        let token = UUID(); operation = token
        let previous = store.value
        guard let value = await request.run(.conversationRead, work: { [api] in
            let value = try await api.get(id: id)
            guard value.id == id else { throw HTTPError.invalidResponse }
            return value
        }) else { return }
        guard operation == token else { return }
        if detail?.id != id { draft = "" }
        if previous.pending && previous.id == id && value.transcript.count > previous.transcriptCount { draft = "" }
        detail = value; needsReconciliation = false
        store.save(.init(id: id, pending: false, transcriptCount: value.transcript.count))
        notice = previous.pending
            ? "Đã tải trạng thái hiện có trên máy chủ. Nếu lượt vừa gửi chưa xuất hiện, hãy kiểm tra lại trước khi chủ động gửi thêm."
            : nil
    }
    func start() async {
        guard canStart else { return }
        let scenario = scenario.trimmed
        guard scenario.validAIInput(limit: 200) else { request.validation("Mô tả tình huống từ 1 đến 200 ký tự."); return }
        let token = UUID(); operation = token
        markPending()
        let value = await request.run(.conversationStart, work: { [api] in
            let value = try await api.start(scenario: scenario)
            guard !value.id.isEmpty, value.status == .active, !value.opening.trimmed.isEmpty else { throw HTTPError.invalidResponse }
            return value
        })
        guard operation == token, !request.closed else { return }
        guard let value else { mutationFailed(); return }
        detail = .init(id: value.id, scenario: value.scenario, status: value.status,
                       transcript: [.init(role: .assistant, content: value.opening)], feedback: nil, createdAt: "")
        acknowledged(); draft = ""
    }
    func reply() async {
        guard canReply, let detail else { return }
        let message = draft.trimmed
        guard message.validAIInput(limit: 2000) else { request.validation("Nhập câu trả lời từ 1 đến 2.000 ký tự."); return }
        let token = UUID(); operation = token
        markPending()
        let value = await request.run(.conversationReply, work: { [api] in
            let value = try await api.reply(id: detail.id, message: message)
            guard !value.reply.trimmed.isEmpty else { throw HTTPError.invalidResponse }
            return value
        })
        guard operation == token, !request.closed else { return }
        guard let value else { mutationFailed(); return }
        self.detail?.transcript.append(.init(role: .user, content: message))
        self.detail?.transcript.append(.init(role: .assistant, content: value.reply, feedback: value.feedback, suggestion: value.suggestion))
        if draft.trimmed == message { draft = "" }
        acknowledged()
    }
    func end() async {
        guard canReply, let id = detail?.id else { return }
        let token = UUID(); operation = token
        markPending()
        let value = await request.run(.conversationEnd, work: { [api] in try await api.end(id: id) })
        guard operation == token, !request.closed else { return }
        guard let value else { mutationFailed(); return }
        detail?.status = .completed; detail?.feedback = value.summary
        acknowledged()
    }
    func showHistory() {
        guard request.canStart else { return }
        detail = nil; draft = ""
        // Retain an uncertain marker, so leaving the screen cannot silently unlock POST.
        if !needsReconciliation { store.save(.init()) }
    }
    func allowNewAfterInspection() {
        guard request.canStart, loaded, detail == nil, store.value.id == nil else { return }
        needsReconciliation = false; store.save(.init()); notice = nil
    }
    private func markPending() {
        needsReconciliation = true
        loaded = false
        store.save(.init(id: detail?.id, pending: true, transcriptCount: detail?.transcript.count ?? 0))
    }
    private func acknowledged() {
        needsReconciliation = false; notice = nil
        store.save(.init(id: detail?.id, pending: false, transcriptCount: detail?.transcript.count ?? 0))
    }
    private func mutationFailed() {
        guard !request.closed else { return }
        if !request.uncertain { acknowledged() }
        else { notice = "Chưa xác nhận được thao tác. Tải lại lịch sử/trạng thái trước khi tiếp tục; Lexi không gửi lại tự động." }
    }
    func deactivate(clear: Bool) {
        operation = UUID()
        request.deactivate(); store.close(clear: clear); detail = nil; items = []; draft = ""; scenario = ""
    }
}

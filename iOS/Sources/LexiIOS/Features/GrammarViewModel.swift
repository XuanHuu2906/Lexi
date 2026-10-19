import Foundation
import Observation

@MainActor @Observable
final class GrammarViewModel {
    let request: AIRequestGate
    let read: AIRequestGate
    var search = ""
    private(set) var items: [GrammarRule] = []
    private(set) var total = 0
    private(set) var page = 0
    private(set) var selected: GrammarRule?
    private(set) var preview: GrammarPreview?
    private(set) var needsReconciliation = false
    private(set) var loaded = false
    private var loadedSearch = ""
    private let api: any GrammarServing
    private var operation = UUID()
    var hasMore: Bool { items.count < total && page > 0 }

    init(api: any GrammarServing, usage: AIUsage = AIUsage()) {
        self.api = api; request = AIRequestGate(usage: usage); read = AIRequestGate(usage: usage)
    }
    func load(more: Bool = false) async {
        guard !request.busy else { return }
        if read.busy { if more { return }; read.cancel() }
        let query = search.trimmed
        if more && (loadedSearch != query || !hasMore) { return }
        let next = more ? page + 1 : 1
        let id = UUID(); operation = id
        if loadedSearch != query { items = []; page = 0; total = 0; loaded = false }
        guard let value = await read.run(.grammarRead, work: { [api] in
            let value = try await api.list(search: query, page: next)
            guard value.page == next, value.limit > 0, value.total >= 0 else { throw HTTPError.invalidResponse }
            return value
        }) else { return }
        guard operation == id, search.trimmed == query else { return }
        var seen = Set<String>()
        items = (more ? items + value.items : value.items).filter { seen.insert($0.id).inserted }
        total = value.total; page = value.page; loadedSearch = query; loaded = true
        // A successful explicit read allows the user to inspect the library before retrying.
        needsReconciliation = false
    }
    func open(id: String) async {
        guard !request.busy else { return }
        read.cancel(); selected = nil
        let token = UUID(); operation = token
        let value = await read.run(.grammarRead, work: { [api] in
            let value = try await api.get(id: id)
            guard value.id == id else { throw HTTPError.invalidResponse }
            return value
        })
        guard operation == token else { return }
        selected = value
        if selected != nil { needsReconciliation = false }
    }
    func normalize(_ rule: String) async -> GrammarInput? {
        guard request.canStart, !needsReconciliation else { return nil }
        guard rule.validAIInput(limit: 4000) else { request.validation("Nhập ghi chú từ 1 đến 4.000 ký tự."); return nil }
        preview = nil
        guard let value = await request.run(.grammarPreview, work: { [api] in try await api.preview(rule: rule) }) else { return nil }
        preview = value
        guard value.isValid, value.input.isValid else {
            request.validation("Lexi chưa nhận ra quy tắc hợp lệ. Hãy sửa ghi chú hoặc nhập công thức và giải thích bên dưới.")
            return nil
        }
        return value.input
    }
    func save(_ input: GrammarInput, id: String?) async -> Bool {
        guard request.canStart, !needsReconciliation else { return false }
        guard input.isValid else { request.validation("Cần công thức, giải thích; tiêu đề tối đa 200 ký tự."); return false }
        read.cancel(); let token = UUID(); operation = token; needsReconciliation = true
        let value = await request.run(.grammarSave, work: { [api] in
            if let id { return try await api.update(id: id, input: input) }
            return try await api.create(input)
        })
        guard operation == token, !request.closed else { return false }
        guard let value else { needsReconciliation = request.uncertain; return false }
        needsReconciliation = false
        selected = value; loaded = false
        return true
    }
    func delete(id: String) async -> Bool {
        guard request.canStart, !needsReconciliation else { return false }
        read.cancel(); let token = UUID(); operation = token; needsReconciliation = true
        let value = await request.run(.grammarDelete, work: { [api] in
            do {
                let result = try await api.delete(id: id)
                guard result.deleted else { throw HTTPError.invalidResponse }
            } catch HTTPError.notFound { /* Already removed on another client. */ }
            return true
        })
        guard operation == token, !request.closed else { return false }
        guard value != nil else { needsReconciliation = request.uncertain; return false }
        needsReconciliation = false
        items.removeAll { $0.id == id }; selected = nil; loaded = false
        return true
    }
    func examples(id: String) async {
        guard request.canStart, !needsReconciliation else { return }
        read.cancel(); let token = UUID(); operation = token; needsReconciliation = true
        let value = await request.run(.grammarExamples, work: { [api] in
            let value = try await api.examples(id: id)
            guard value.rule.id == id else { throw HTTPError.invalidResponse }
            return value
        })
        guard operation == token, !request.closed else { return }
        guard let value else { needsReconciliation = request.uncertain; return }
        needsReconciliation = false
        selected = value.rule; loaded = false
    }
    func deactivate() { operation = UUID(); request.deactivate(); read.deactivate(); items = []; selected = nil; preview = nil; search = "" }
}

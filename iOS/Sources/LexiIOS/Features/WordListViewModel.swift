import Foundation
import Observation

protocol WordServing: Sendable {
    func list(_ query: WordsQuery) async throws -> WordPage
    func get(id: String) async throws -> Word
    func create(_ input: WordInput) async throws -> Word
    func delete(id: String) async throws -> DeletedResult
    func lookup(term: String, level: CEFRLevel?) async throws -> LookupResult
    func quickAdd(text: String, topic: String?) async throws -> QuickAddResult
}
extension WordsAPI: WordServing {}

@MainActor @Observable
final class WordListViewModel {
    var query = WordsQuery() {
        didSet { if query != oldValue { invalidate() } }
    }
    private(set) var items: [Word] = []
    private(set) var total = 0
    private(set) var page = 0
    private(set) var phase: LoadPhase = .idle
    private(set) var loadingMore = false
    private(set) var feedback: FeatureFeedback?
    private var operation = UUID()
    private let api: any WordServing
    var hasMore: Bool { page > 0 && page * query.limit < total }

    init(api: any WordServing) { self.api = api }

    func invalidate() {
        operation = UUID()
        items = []; total = 0; page = 0; loadingMore = false; phase = .idle
        // Preserve a server cooldown even if the filter changes.
        if feedback?.retryAt == nil { feedback = nil }
    }

    func refresh(debounce: Bool = false) async {
        guard feedback?.canRetry() != false else { return }
        let id = UUID(); operation = id
        let requested = query
        phase = .loading; loadingMore = false; feedback = nil
        defer { if operation == id, phase == .loading { phase = items.isEmpty ? .idle : .stale } }
        do {
            if debounce { try await Task.sleep(for: .milliseconds(350)) }
            var first = requested; first.page = 1
            let result = try await api.list(first)
            try Task.checkCancellation()
            guard operation == id, query == requested else { return }
            guard result.page == 1, result.limit == requested.limit else { throw HTTPError.invalidResponse }
            items = deduplicated(result.items); total = result.total; page = result.page
            phase = items.isEmpty ? .empty : .loaded
        } catch {
            guard operation == id, !isCancellation(error) else { return }
            feedback = FeatureFeedback(error); phase = items.isEmpty ? .failed : .stale
        }
    }

    func nextPage() async {
        guard hasMore, !loadingMore, phase == .loaded, feedback?.canRetry() != false else { return }
        let id = operation; var requested = query; requested.page = page + 1
        loadingMore = true; feedback = nil
        defer { if operation == id { loadingMore = false } }
        do {
            let result = try await api.list(requested)
            try Task.checkCancellation()
            guard operation == id else { return }
            guard result.page == requested.page, result.limit == requested.limit else { throw HTTPError.invalidResponse }
            items = deduplicated(items + result.items)
            page = result.page; total = result.total
        } catch {
            guard operation == id, !isCancellation(error) else { return }
            feedback = FeatureFeedback(error)
        }
    }

    private func deduplicated(_ words: [Word]) -> [Word] {
        var seen = Set<String>()
        return words.filter { seen.insert($0.id).inserted }
    }
}

@MainActor @Observable
final class WordEditorModel {
    private(set) var busy = false
    private(set) var feedback: FeatureFeedback?
    private(set) var quickResult: QuickAddResult?
    private let api: any WordServing
    init(api: any WordServing) { self.api = api }

    func save(_ input: WordInput) async -> Word? {
        guard !busy, feedback?.canRetry() != false else { return nil }
        guard !input.word.trimmed.isEmpty, input.word.trimmed.utf16.count <= 100, !input.meaning.trimmed.isEmpty else {
            feedback = FeatureFeedback(message: "Nhập từ (tối đa 100 ký tự) và nghĩa của từ."); return nil
        }
        var value = input; value.word = value.word.trimmed; value.meaning = value.meaning.trimmed
        busy = true; feedback = nil; defer { busy = false }
        do { return try await api.create(value) }
        catch { feedback = FeatureFeedback(error, mutation: true); return nil }
    }

    func quickAdd(text: String, topic: String) async -> Bool {
        guard !busy, quickResult == nil, feedback?.canRetry() != false else { return false }
        let parts = text.split(separator: ":", maxSplits: 1, omittingEmptySubsequences: false)
        guard text.utf16.count <= 300, parts.count == 2,
              !String(parts[0]).trimmed.isEmpty, String(parts[0]).trimmed.utf16.count <= 100,
              !String(parts[1]).trimmed.isEmpty else {
            feedback = FeatureFeedback(message: "Nhập dạng từ: nghĩa, tối đa 300 ký tự; phần từ tối đa 100 ký tự."); return false
        }
        busy = true; feedback = nil; defer { busy = false }
        do { quickResult = try await api.quickAdd(text: text.trimmed, topic: topic.nonempty); return true }
        catch { feedback = FeatureFeedback(error, mutation: true); return false }
    }
}

@MainActor @Observable
final class WordDetailViewModel {
    private(set) var word: Word?
    private(set) var busy = false
    private(set) var deleting = false
    private(set) var feedback: FeatureFeedback?
    let id: String
    private let api: any WordServing
    init(id: String, api: any WordServing) { self.id = id; self.api = api }

    func load() async {
        guard !busy, !deleting, feedback?.canRetry() != false else { return }
        busy = true; feedback = nil; defer { busy = false }
        do { let result = try await api.get(id: id); try Task.checkCancellation(); word = result }
        catch { if !isCancellation(error) { feedback = FeatureFeedback(error) } }
    }

    func delete() async -> Bool {
        guard !busy, !deleting, feedback?.canRetry() != false else { return false }
        deleting = true; feedback = nil; defer { deleting = false }
        do {
            guard try await api.delete(id: id).deleted else { throw HTTPError.invalidResponse }
            word = nil; return true
        } catch { feedback = FeatureFeedback(error, mutation: true); return false }
    }
}

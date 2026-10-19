import Foundation
import Testing
@testable import LexiIOS

private func offlineFixture(_ count: Int) -> [Word] {
    (0..<count).map { i in
        Word(id: "cache-\(i)", word: "word\(i)", meaning: "nghĩa \(i)",
             phonetic: nil, pos: nil, status: i.isMultiple(of: 2) ? .new : .due,
             topic: i.isMultiple(of: 2) ? "food" : "travel", examples: [],
             synonyms: [], antonyms: [], note: nil,
             createdAt: "2026-10-19T01:00:00Z", nextReviewAt: nil)
    }
}

private actor OfflineListingSpy: WordServing, FlashcardWordListing {
    let words: [Word]
    var error: HTTPError?
    var omitLastPage = false
    private(set) var reads = 0
    init(words: [Word], error: HTTPError? = nil) { self.words = words; self.error = error }
    func fail(_ error: HTTPError?) { self.error = error }
    func simulateMissingLastPage() { omitLastPage = true }
    func list(_ query: WordsQuery) async throws -> WordPage {
        reads += 1
        if let error { throw error }
        let items = omitLastPage && query.page > 1 ? []
            : Array(words.dropFirst((query.page - 1) * query.limit).prefix(query.limit))
        return WordPage(items: items,
                        total: words.count, page: query.page, limit: query.limit)
    }
    func get(id: String) async throws -> Word { throw HTTPError.invalidRequest }
    func create(_ input: WordInput) async throws -> Word { throw HTTPError.invalidRequest }
    func delete(id: String) async throws -> DeletedResult { throw HTTPError.invalidRequest }
    func lookup(term: String, level: CEFRLevel?) async throws -> LookupResult { throw HTTPError.invalidRequest }
    func quickAdd(text: String, topic: String?) async throws -> QuickAddResult { throw HTTPError.invalidRequest }
}

@Suite @MainActor
struct OfflineNotebookTests {
    private func directory() -> URL {
        FileManager.default.temporaryDirectory.appendingPathComponent("lexi-offline-test-" + UUID().uuidString)
    }

    @Test func cacheIsPrivatePerAccountAndClearedOnLogout() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let a = OfflineNotebookCache(namespace: "https://api.test|user-A", directory: root)
        let b = OfflineNotebookCache(namespace: "https://api.test|user-B", directory: root)
        let anotherBackend = OfflineNotebookCache(namespace: "https://other.test|user-A", directory: root)
        try await a.save(offlineFixture(12))
        #expect(await a.load()?.words.count == 12)
        #expect(await b.load() == nil)
        #expect(await anotherBackend.load() == nil)
        await a.close(clear: true)
        #expect(await a.load() == nil)
        let newSession = OfflineNotebookCache(namespace: "https://api.test|user-A", directory: root)
        #expect(await newSession.load() == nil)
        await #expect(throws: OfflineNotebookCache.CacheFailure.closed) {
            try await a.save(offlineFixture(1))
        }
    }

    @Test func TTLRejectsExpiredFutureOrCorruptDataAndBudgetNeverTruncates() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "test|ttl", directory: root)
        let now = try #require(APIDate.parse("2026-10-19T12:00:00Z"))
        try await cache.save(offlineFixture(10), now: now)
        #expect(await cache.load(now: now.addingTimeInterval(1)) != nil)
        #expect(await cache.load(now: now.addingTimeInterval(OfflineNotebookCache.timeToLive + 1)) == nil)
        #expect(await cache.load(now: now.addingTimeInterval(-10)) == nil)
        await #expect(throws: OfflineNotebookCache.CacheFailure.tooLarge) {
            try await cache.save(offlineFixture(OfflineNotebookCache.maximumWords + 1))
        }
        #expect(await cache.load(now: now.addingTimeInterval(1))?.words.count == 10)
        let file = try #require(FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: nil).first)
        try Data("corrupt snapshot".utf8).write(to: file)
        #expect(await cache.load(now: now.addingTimeInterval(1)) == nil)
    }

    @Test func cachedListCanFilterAndPageButCannotMasqueradeAsFreshServerData() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "api|offline-list", directory: root)
        try await cache.save(offlineFixture(45))
        let api = OfflineListingSpy(words: offlineFixture(45), error: .network(-1009))
        let model = WordListViewModel(api: api, cache: cache)
        await model.refresh()
        #expect(model.isOffline && model.phase == .stale && model.offlineSavedAt != nil)
        #expect(model.items.count == 20 && model.total == 45 && model.hasMore)
        await model.nextPage()
        #expect(model.items.count == 40)
        await model.nextPage()
        #expect(model.items.count == 45 && !model.hasMore)
        #expect(await api.reads == 1) // Paging cached words never sends more requests.
        model.query.topic = "food"
        await model.refresh()
        #expect(model.isOffline && model.total == 23)
        #expect(model.items.allSatisfy { $0.topic == "food" })
        await api.fail(nil)
        await model.refresh()
        #expect(!model.isOffline && model.phase == .loaded)
    }

    @Test func unauthorizedNeverReadsCacheOrMisrepresentsAuthentication() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "api|auth", directory: root)
        try await cache.save(offlineFixture(3))
        let api = OfflineListingSpy(words: offlineFixture(3), error: .unauthorized(nil))
        let model = WordListViewModel(api: api, cache: cache)
        await model.refresh()
        #expect(!model.isOffline && model.phase == .failed && model.items.isEmpty)
        #expect(model.feedback != nil)
        await api.fail(.network(-1009))
        await model.refresh()
        #expect(model.isOffline && !model.items.isEmpty)
        await api.fail(.forbidden(nil))
        await model.refresh()
        #expect(!model.isOffline && model.items.isEmpty && model.phase == .failed)
    }

    @Test func flashcardsFallbackOnlyForConnectivityAndOnlyAfterFullDownload() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "api|flashcards", directory: root)
        let api = OfflineListingSpy(words: offlineFixture(125))
        let flashcards = NotebookFlashcards(words: api, cache: cache)
        let online = try await flashcards.flashcards(mode: .guess, scope: .due, limit: 10, excluding: [])
        #expect(!online.offline && online.count == 10)
        #expect(await cache.load()?.words.count == 125)
        await api.fail(.timeout)
        let offline = try await flashcards.flashcards(mode: .guess, scope: .due, limit: 10, excluding: [])
        #expect(offline.offline && offline.count == 10)
        await api.fail(.unauthorized(nil))
        await #expect(throws: HTTPError.unauthorized(nil)) {
            _ = try await flashcards.flashcards(mode: .guess, scope: .due, limit: 10, excluding: [])
        }
    }

    @Test func oversizedNotebookStopsBeforeReadingAllPagesAndNeverSavesPartialCache() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "api|oversized", directory: root)
        let api = OfflineListingSpy(words: offlineFixture(OfflineNotebookCache.maximumWords + 1))
        let model = WordListViewModel(api: api, cache: cache,
                                      notebook: NotebookFlashcards(words: api, cache: cache))
        await model.saveForOffline()
        #expect(model.offlineMessage?.contains("giới hạn") == true)
        #expect(await cache.load() == nil)
        #expect(await api.reads == 1)
    }

    @Test func missingFinalServerPageCannotBeMisreportedAsEntireOfflineNotebook() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "api|truncated", directory: root)
        let api = OfflineListingSpy(words: offlineFixture(125))
        await api.simulateMissingLastPage()
        let notebook = NotebookFlashcards(words: api, cache: cache)
        await #expect(throws: HTTPError.invalidResponse) {
            _ = try await notebook.fetchNotebook()
        }
        #expect(await cache.load() == nil)
    }

    @Test func interruptedFullDownloadDoesNotOverwriteEarlierGoodCache() async throws {
        let root = directory()
        defer { try? FileManager.default.removeItem(at: root) }
        let cache = OfflineNotebookCache(namespace: "api|partial", directory: root)
        try await cache.save(offlineFixture(5))
        let api = OfflineListingSpy(words: offlineFixture(125), error: .timeout)
        let notebook = NotebookFlashcards(words: api, cache: cache)
        let model = WordListViewModel(api: api, cache: cache, notebook: notebook)
        await model.saveForOffline()
        #expect(model.offlineMessage?.contains("Chưa thể") == true)
        #expect(await cache.load()?.words.count == 5)
        await api.fail(nil)
        await model.saveForOffline()
        #expect(await cache.load()?.words.count == 125)
    }
}

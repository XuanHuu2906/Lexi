import Foundation
#if canImport(CryptoKit)
import CryptoKit
#endif

// Cache only the server-fetched notebook, never AI text/audio, tokens or SRS writes.
// The namespace contains the API origin + account ID, but no account data appears
// in the on-disk filename. On Apple platforms use SHA-256 for the stable key.
actor OfflineNotebookCache {
    struct Snapshot: Codable, Sendable {
        let schema: Int
        let savedAt: Date
        let words: [Word]
    }

    static let maximumWords = 1_000
    static let maximumBytes = 2 * 1024 * 1024
    static let timeToLive: TimeInterval = 30 * 24 * 60 * 60

    private let file: URL
    private var closed = false

    init(namespace: String, directory: URL? = nil) {
        let root = directory ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("LexiOfflineV1", isDirectory: true)
        #if canImport(CryptoKit)
        let digest = SHA256.hash(data: Data(namespace.utf8))
        let identifier = digest.map { String(format: "%02x", $0) }.joined()
        #else
        // Linux-only test fallback; iOS/macOS always use CryptoKit.
        let identifier = String(namespace.utf8.reduce(UInt64(14_695_981_039_346_656_037)) {
            ($0 ^ UInt64($1)) &* 1_099_511_628_211
        }, radix: 16)
        #endif
        file = root.appendingPathComponent(identifier + ".json")
    }

    func save(_ words: [Word], now: Date = .now) throws {
        guard !closed else { return }
        // Never cache an incomplete response as a complete notebook.
        guard words.count <= Self.maximumWords,
              Set(words.map(\.id)).count == words.count,
              words.allSatisfy({ !$0.id.isEmpty && !$0.word.isEmpty && !$0.meaning.isEmpty }) else {
            throw CacheFailure.tooLarge
        }
        let data = try JSONEncoder().encode(Snapshot(schema: 1, savedAt: now, words: words))
        guard data.count <= Self.maximumBytes else { throw CacheFailure.tooLarge }
        let directory = file.deletingLastPathComponent()
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        #if os(iOS)
        try FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: directory.path)
        #endif
        try data.write(to: file, options: [.atomic])
        #if os(iOS)
        try FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: file.path)
        #endif
    }

    func load(now: Date = .now) -> Snapshot? {
        guard !closed,
              let size = try? file.resourceValues(forKeys: [.fileSizeKey]).fileSize,
              size > 0, size <= Self.maximumBytes,
              let data = try? Data(contentsOf: file),
              let snapshot = try? JSONDecoder().decode(Snapshot.self, from: data),
              snapshot.schema == 1, snapshot.savedAt <= now,
              now.timeIntervalSince(snapshot.savedAt) <= Self.timeToLive,
              snapshot.words.count <= Self.maximumWords,
              Set(snapshot.words.map(\.id)).count == snapshot.words.count else { return nil }
        return snapshot
    }

    func close(clear: Bool) {
        closed = true
        if clear { try? FileManager.default.removeItem(at: file) }
    }

    enum CacheFailure: Error { case tooLarge }
}

// Offline lists are read-only and are NEVER used to calculate authoritative due totals.
// Search/sort/filter here only affect the already downloaded notebook.
enum OfflineNotebookQuery {
    static func filter(_ words: [Word], query: WordsQuery) -> [Word] {
        let search = query.search?.trimmingCharacters(in: .whitespacesAndNewlines)
        let selected = words.filter { word in
            if let search, !search.isEmpty,
               !word.word.localizedCaseInsensitiveContains(search),
               !word.meaning.localizedCaseInsensitiveContains(search) { return false }
            if let topic = query.topic, word.topic != topic { return false }
            if let status = query.status {
                let matches: Bool
                switch status {
                case .new: matches = word.status == .new
                case .learning: matches = word.status == .due
                case .mastered: matches = word.status == .learned
                }
                if !matches { return false }
            }
            return true
        }
        return selected.sorted { a, b in
            if a.createdAt != b.createdAt {
                return query.sort == .newest ? a.createdAt > b.createdAt : a.createdAt < b.createdAt
            }
            return a.id < b.id
        }
    }
}

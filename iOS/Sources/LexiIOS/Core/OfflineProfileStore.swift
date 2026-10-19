import Foundation

/// Minimal server-verified profile stored in the device-only Keychain.
/// A locally saved refresh credential MUST also exist before any offline restore.
/// This is not server authorization and never unlocks writes or stale SRS ratings.
struct OfflineProfileStore: Sendable {
    struct Record: Codable, Sendable {
        let version: Int
        let verifiedAt: Date
        let profile: ApiMe
    }

    static let validity: TimeInterval = 7 * 24 * 60 * 60
    private let keychain: any KeychainStore

    init(keychain: any KeychainStore) { self.keychain = keychain }

    func save(_ profile: ApiMe, at now: Date) throws {
        let record = Record(version: 1, verifiedAt: now, profile: profile)
        let data = try JSONEncoder().encode(record)
        guard data.count <= 16 * 1024 else { return }
        try keychain.save(data.base64EncodedString())
    }

    func load(at now: Date) throws -> ApiMe? {
        guard let value = try keychain.read(),
              let data = Data(base64Encoded: value),
              data.count <= 16 * 1024,
              let record = try? JSONDecoder().decode(Record.self, from: data),
              record.version == 1,
              !record.profile.id.isEmpty,
              record.verifiedAt <= now,
              now.timeIntervalSince(record.verifiedAt) <= Self.validity else { return nil }
        return record.profile
    }

    func clear() throws { try keychain.delete() }
}

import Foundation
import Testing
@testable import LexiIOS

/// Security regression: the user never has to inspect the app's private
/// directory to know whether A's data can survive an A -> logout -> B switch.
@Suite @MainActor
struct AccountCacheIsolationTests {
    private let apiOrigin = "https://api.example.invalid"

    private func fixtureWord(_ id: String, owner: String) -> Word {
        Word(id: id, word: "private-\(owner)", meaning: "confidential-\(owner)",
             phonetic: nil, pos: nil, status: .new, topic: owner,
             examples: [], synonyms: [], antonyms: [], note: nil,
             createdAt: "2026-10-19T00:00:00Z", nextReviewAt: nil)
    }

    private func makeVM(token: MemoryKeychain, identity: MemoryKeychain,
                        responses: [MockTransport.Step], directory: URL,
                        defaults: UserDefaults) throws -> SessionViewModel {
        let environment = try AppEnvironment(baseURL: apiOrigin, flavor: .staging)
        let session = SessionActor(auth: AuthDouble(), store: token)
        let client = APIClient(environment: environment, transport: MockTransport(responses),
                               tokens: session)
        return SessionViewModel(
            session: session, api: AuthAPI(client: client),
            offlineProfile: OfflineProfileStore(keychain: identity),
            offlineCacheDirectory: directory, checkpointDefaults: defaults)
    }

    @Test func logoutDeletesActiveCacheAndOldStudyCheckpointBeforeAccountSwitch() async throws {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("lexi-account-isolation-" + UUID().uuidString)
        let suiteName = "lexi-account-checkpoints-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer {
            try? FileManager.default.removeItem(at: root)
            defaults.removePersistentDomain(forName: suiteName)
        }
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let profileStore = MemoryKeychain()

        let bodyA = try Fixtures.body("user_with_relations")
        let bodyB = Data(String(decoding: bodyA, as: UTF8.self)
            .replacingOccurrences(of: "fixture-user-a", with: "fixture-user-b")
            .replacingOccurrences(of: "learner-a@example.invalid", with: "learner-b@example.invalid").utf8)
        let model = try makeVM(token: token, identity: profileStore,
            responses: [.response(200, bodyA), .response(200, bodyB)],
            directory: root, defaults: defaults)
        await model.restore()
        let ownerA = try #require(model.navigation.ownerID)
        #expect(ownerA == "fixture-user-a")
        let apiNamespace = try AppEnvironment(baseURL: apiOrigin, flavor: .staging)
            .apiBaseURL.absoluteString
        let namespaceA = apiNamespace + "|" + ownerA
        let cacheA = OfflineNotebookCache(namespace: namespaceA, directory: root)
        try await cacheA.save([fixtureWord("A", owner: "A")])
        model.registerNotebook(cacheA, userID: ownerA)
        let checkpointA = StudyCheckpointStore(defaults: defaults, namespace: namespaceA)
        checkpointA.update { $0.uncertainReviews["srs-user-A"] = "private-review" }
        var stoppedFeatures = false
        model.registerFeatureCleanup(userID: ownerA) {
            stoppedFeatures = true
            checkpointA.close(clear: true)
        }

        await model.logout()
        #expect(stoppedFeatures)
        #expect(try token.read() == nil)
        #expect(try profileStore.read() == nil)
        #expect(model.navigation.ownerID == nil && model.navigation.paths.isEmpty)
        #expect(await cacheA.load() == nil)
        let reopenedA = OfflineNotebookCache(namespace: namespaceA, directory: root)
        #expect(await reopenedA.load() == nil)
        await #expect(throws: OfflineNotebookCache.CacheFailure.closed) {
            try await cacheA.save([fixtureWord("late", owner: "A")])
        }
        // Even a late study callback must not recreate a UserDefaults record.
        checkpointA.update { $0.uncertainReviews["late-private-write"] = "must-not-persist" }
        let checkpointAfter = StudyCheckpointStore(defaults: defaults, namespace: namespaceA)
        #expect(checkpointAfter.value.uncertainReviews.isEmpty)

        await model.signIn(email: "learner-b@example.invalid",
                           password: "synthetic-password", register: false)
        let ownerB = try #require(model.navigation.ownerID)
        #expect(ownerB == "fixture-user-b")
        let namespaceB = apiNamespace + "|" + ownerB
        let cacheB = OfflineNotebookCache(namespace: namespaceB, directory: root)
        #expect(await cacheB.load() == nil)
        try await cacheB.save([fixtureWord("B", owner: "B")])
        #expect(await cacheB.load()?.words.first?.word == "private-B")
        #expect(await reopenedA.load() == nil)
        #expect(try OfflineProfileStore(keychain: profileStore).load(at: .now)?.id == ownerB)
    }

    @Test func logoutClearsOtherOrphanedAccountSnapshotsFromOldVersions() async throws {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("lexi-purge-orphans-" + UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let cacheA = OfflineNotebookCache(namespace: "backend|user-A", directory: root)
        let cacheOld = OfflineNotebookCache(namespace: "backend|orphan-old", directory: root)
        try await cacheA.save([fixtureWord("A", owner: "A")])
        try await cacheOld.save([fixtureWord("old", owner: "Old")])
        try OfflineNotebookCache.purgeAll(directory: root)
        #expect(await OfflineNotebookCache(namespace: "backend|user-A", directory: root).load() == nil)
        #expect(await OfflineNotebookCache(namespace: "backend|orphan-old", directory: root).load() == nil)
        // Never keep a detached writer alive after purge: close both before
        // purging in real session code, where registerNotebook tracks the active one.
        await cacheA.close(clear: false)
        await cacheOld.close(clear: false)
    }

    @Test func terminal401PurgesNotebookAndCheckpointEvenWithoutSwiftUIOnDisappear() async throws {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("lexi-auth-revoked-" + UUID().uuidString)
        let suiteName = "lexi-revoked-checkpoint-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer {
            try? FileManager.default.removeItem(at: root)
            defaults.removePersistentDomain(forName: suiteName)
        }
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let identity = MemoryKeychain()
        let session = SessionActor(auth: AuthDouble(), store: token)
        let transport = MockTransport([
            .response(200, try Fixtures.body("user_with_relations")),
            .response(401, Data()), .response(401, Data())
        ])
        let environment = try AppEnvironment(baseURL: apiOrigin, flavor: .staging)
        let client = APIClient(environment: environment, transport: transport, tokens: session)
        let model = SessionViewModel(session: session, api: AuthAPI(client: client),
            offlineProfile: OfflineProfileStore(keychain: identity),
            offlineCacheDirectory: root, checkpointDefaults: defaults)
        let observer = Task { await model.observeInvalidations() }
        defer { observer.cancel() }
        await model.restore()
        let ownerA = try #require(model.navigation.ownerID)
        let namespaceA = environment.apiBaseURL.absoluteString + "|" + ownerA
        let cacheA = OfflineNotebookCache(namespace: namespaceA, directory: root)
        try await cacheA.save([fixtureWord("A", owner: "A")])
        model.registerNotebook(cacheA, userID: ownerA)
        let checkpointA = StudyCheckpointStore(defaults: defaults, namespace: namespaceA)
        checkpointA.update { $0.uncertainReviews["revoked-private-word"] = "pending" }

        await #expect(throws: HTTPError.unauthorized(nil)) {
            let _: EmptyResponse = try await client.send(
                APIEndpoint(path: ["words"]))
        }
        for _ in 0..<2_000 {
            if model.message?.contains("Phiên đã kết thúc") == true { break }
            await Task.yield()
        }
        #expect(model.navigation.ownerID == nil && model.navigation.paths.isEmpty)
        #expect(try token.read() == nil)
        #expect(try identity.read() == nil)
        #expect(await OfflineNotebookCache(namespace: namespaceA, directory: root).load() == nil)
        #expect(StudyCheckpointStore(defaults: defaults, namespace: namespaceA)
            .value.uncertainReviews.isEmpty)
        await #expect(throws: OfflineNotebookCache.CacheFailure.closed) {
            try await cacheA.save([fixtureWord("late", owner: "A")])
        }
    }

    @Test func failedOfflineProfileDeletionPreventsAccountSwitchAndIsNotReportedAsCleanLogout() async throws {
        let root = FileManager.default.temporaryDirectory
            .appendingPathComponent("lexi-profile-failure-" + UUID().uuidString)
        let suiteName = "lexi-profile-failure-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer {
            try? FileManager.default.removeItem(at: root)
            defaults.removePersistentDomain(forName: suiteName)
        }
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let identity = MemoryKeychain()
        let model = try makeVM(token: token, identity: identity,
            responses: [.response(200, try Fixtures.body("user_with_relations"))],
            directory: root, defaults: defaults)
        await model.restore()
        #expect(model.navigation.ownerID == "fixture-user-a")
        identity.failures(delete: true)
        await model.logout()
        #expect(model.navigation.ownerID == nil)
        if case .unavailable = model.state {} else {
            Issue.record("Failed Keychain cleanup must not claim a clean logout")
        }
        #expect(model.message?.contains("Chưa xóa hết") == true)
        #expect(try token.read() == nil)
        await model.signIn(email: "other@example.invalid",
                           password: "synthetic-password", register: false)
        #expect(model.navigation.ownerID == nil)
        #expect(model.message?.contains("Keychain") == true)

        identity.failures()
        await model.logout() // Retry device cleanup without an authenticated shell.
        #expect(try identity.read() == nil)
        #expect(model.navigation.ownerID == nil)
    }
}

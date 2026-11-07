import Foundation
import Testing
@testable import LexiIOS

@Suite @MainActor
struct PrivacySecurityTests {
    @Test func consentIsExplicitVersionedAndIsolatedByAccountAndBackend() throws {
        let name = "lexi-privacy-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: name))
        defer { defaults.removePersistentDomain(forName: name) }
        let privacy = PrivacyPreferences(origin: "https://a.invalid", defaults: defaults)
        #expect(throws: PrivacyError.consentRequired) { try privacy.authorize(.textAI) }
        #expect(privacy.requested == .textAI)
        privacy.allow(.textAI, true)
        try privacy.authorize(.textAI)
        #expect(throws: PrivacyError.consentRequired) { try privacy.authorize(.speech) }
        privacy.activate(userID: "a")
        #expect(!privacy.textAllowed && !privacy.speechAllowed && privacy.requested == nil)
        privacy.allow(.speech, true)
        privacy.activate(userID: "b")
        #expect(!privacy.speechAllowed)
        privacy.activate(userID: "a")
        #expect(privacy.speechAllowed)
        let other = PrivacyPreferences(origin: "https://b.invalid", defaults: defaults)
        other.activate(userID: "a")
        #expect(!other.speechAllowed)
        privacy.clear(userID: "a")
        privacy.activate(userID: "a")
        #expect(!privacy.speechAllowed)
    }

    @Test func deniedOrDisabledAIStopsBeforeAnyNetworkRequestAndRevocationTakesEffect() async throws {
        let name = "lexi-ai-gate-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: name))
        defer { defaults.removePersistentDomain(forName: name) }
        let privacy = PrivacyPreferences(origin: "https://a.invalid", defaults: defaults)
        let transport = MockTransport([.response(200, try Fixtures.body("lookup"))])
        var client = try testClient(transport)
        client.privacy = privacy
        let words = WordsAPI(client: client)
        await #expect(throws: PrivacyError.consentRequired) { try await words.lookup(term: "apple") }
        #expect(await transport.requests.isEmpty)
        privacy.allow(.textAI, true)
        _ = try await words.lookup(term: "apple")
        privacy.allow(.textAI, false)
        await #expect(throws: PrivacyError.consentRequired) { try await words.lookup(term: "apple") }
        #expect(await transport.requests.count == 1)
        let disabled = PrivacyPreferences(origin: "https://a.invalid", defaults: defaults, aiEnabled: false)
        disabled.allow(.textAI, true)
        client.privacy = disabled
        await #expect(throws: PrivacyError.featureDisabled) { try await WordsAPI(client: client).lookup(term: "apple") }
        #expect(await transport.requests.count == 1)
    }

    @Test func manualWordOptOutIsSentExplicitlyWithoutRequiringAIConsent() async throws {
        let name = "lexi-manual-save-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: name))
        defer { defaults.removePersistentDomain(forName: name) }
        let privacy = PrivacyPreferences(origin: "https://a.invalid", defaults: defaults)
        let transport = MockTransport([.response(201, try Fixtures.body("word_created"))])
        var client = try testClient(transport); client.privacy = privacy
        _ = try await WordsAPI(client: client).create(WordInput(word: "apple", meaning: "quả táo"))
        let request = try #require(await transport.requests.first)
        let data = try #require(request.httpBody)
        let body = try #require(JSONSerialization.jsonObject(with: data) as? [String: Any])
        #expect(body["enrich"] as? Bool == false)
        #expect(privacy.requested == nil)
    }

    @Test func confirmedDeletionClearsCredentialsProfileStudyAndConsent() async throws {
        let name = "lexi-delete-" + UUID().uuidString
        let defaults = try #require(UserDefaults(suiteName: name))
        defer { defaults.removePersistentDomain(forName: name) }
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let profile = MemoryKeychain()
        let auth = AuthDouble()
        let actor = SessionActor(auth: auth, store: token)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .response(200, Data(#"{"success":true,"data":{"deleted":true}}"#.utf8))])
        var client = try testClient(transport); client.tokens = actor
        let privacy = PrivacyPreferences(origin: client.environment.apiBaseURL.absoluteString, defaults: defaults)
        let model = SessionViewModel(session: actor, api: AuthAPI(client: client),
            offlineProfile: OfflineProfileStore(keychain: profile), checkpointDefaults: defaults, privacy: privacy)
        await model.restore()
        let owner = try #require(model.navigation.ownerID)
        privacy.allow(.textAI, true)
        let store = StudyCheckpointStore(defaults: defaults,
            namespace: client.environment.apiBaseURL.absoluteString + "|" + owner)
        store.update { $0.completedFlashcards = ["due": ["private-word"]] }
        model.registerFeatureCleanup(userID: owner) { store.close(clear: true) }
        #expect(await model.deleteAccount(password: "synthetic-password", confirmed: true))
        #expect(try token.read() == nil && profile.read() == nil)
        #expect(model.navigation.ownerID == nil && store.value.completedFlashcards == nil)
        privacy.activate(userID: owner); #expect(!privacy.textAllowed)
        let requests = await transport.requests
        #expect(requests.count == 2 && requests[1].httpMethod == "DELETE")
        #expect(requests[1].value(forHTTPHeaderField: "Cookie") == nil)
        let data = try #require(requests[1].httpBody)
        let payload = try #require(JSONSerialization.jsonObject(with: data) as? [String: String])
        #expect(payload == ["password": "synthetic-password", "confirmation": "DELETE"])
        #expect(await auth.revoked.isEmpty)
    }

    @Test func uncertainDeletionRequiresReadBeforeAnotherExplicitAttempt() async throws {
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let actor = SessionActor(auth: AuthDouble(), store: token)
        let body = try Fixtures.body("user_with_relations")
        let transport = MockTransport([.response(200, body), .failure(.timedOut), .response(200, body)])
        var client = try testClient(transport); client.tokens = actor
        let model = SessionViewModel(session: actor, api: AuthAPI(client: client))
        await model.restore()
        #expect(await model.deleteAccount(password: "synthetic-password", confirmed: false) == false)
        #expect(await transport.requests.count == 1)
        #expect(await model.deleteAccount(password: "synthetic-password", confirmed: true) == false)
        #expect(model.deletionUncertain && model.navigation.ownerID != nil)
        #expect(await model.deleteAccount(password: "synthetic-password", confirmed: true) == false)
        #expect(await transport.requests.count == 2)
        await model.checkDeletionStatus()
        #expect(!model.deletionUncertain && model.navigation.ownerID != nil)
        #expect(await transport.requests.count == 3)
    }

    @Test(arguments: [403, 404, 429])
    func deletionRejectionNeverClaimsSuccessOrClearsData(_ status: Int) async throws {
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let actor = SessionActor(auth: AuthDouble(), store: token)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .response(status, Data(), ["Retry-After": "60"])])
        var client = try testClient(transport); client.tokens = actor
        let model = SessionViewModel(session: actor, api: AuthAPI(client: client))
        await model.restore()
        #expect(await model.deleteAccount(password: "synthetic-password", confirmed: true) == false)
        #expect(!model.deletionUncertain && model.deletionFeedback != nil)
        #expect(model.navigation.ownerID != nil)
        #expect(try token.read() != nil)
    }

    @Test func deletionAcknowledgedButKeychainFailureRemainsVisible() async throws {
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let actor = SessionActor(auth: AuthDouble(), store: token)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .response(200, Data(#"{"success":true,"data":{"deleted":true}}"#.utf8))])
        var client = try testClient(transport); client.tokens = actor
        let model = SessionViewModel(session: actor, api: AuthAPI(client: client))
        await model.restore(); token.failures(delete: true)
        #expect(await model.deleteAccount(password: "synthetic-password", confirmed: true))
        if case .unavailable = model.state {} else { Issue.record("Cleanup failure must remain visible") }
        #expect(model.navigation.ownerID == nil && model.message?.contains("chưa dọn hết") == true)
    }
}

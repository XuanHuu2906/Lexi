import Foundation
import Testing
@testable import LexiIOS

@MainActor
struct OfflineSessionTests {
    private func model(session: SessionActor, transport: MockTransport,
                       profile: OfflineProfileStore, clock: SessionClock) throws -> SessionViewModel {
        let client = APIClient(
            environment: try AppEnvironment(baseURL: "https://api.example.invalid", flavor: .staging),
            transport: transport, tokens: session, clock: clock)
        return SessionViewModel(session: session, api: AuthAPI(client: client),
                                clock: clock, offlineProfile: profile)
    }

    @Test func coldStartWithSavedCredentialAndVerifiedKeychainProfileAllowsReadOnlyOffline() async throws {
        let clock = SessionClock()
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let identity = MemoryKeychain()
        let profile = OfflineProfileStore(keychain: identity)
        let auth = AuthDouble()
        let firstSession = SessionActor(auth: auth, store: token, clock: clock)
        let first = try model(session: firstSession,
            transport: MockTransport([.response(200, try Fixtures.body("user_with_relations"))]),
            profile: profile, clock: clock)
        await first.restore()
        if case .authenticated = first.state {} else { Issue.record("Expected verified online profile") }
        let account = try #require(try profile.load(at: clock.now()))
        #expect(account.id == first.navigation.ownerID)

        await auth.configure(error: .network(-1009))
        // A brand-new actor and VM mimic an app process being restarted offline.
        let secondSession = SessionActor(auth: auth, store: token, clock: clock)
        let second = try model(session: secondSession, transport: MockTransport([]),
                               profile: profile, clock: clock)
        await second.restore()
        if case .authenticated = second.state {} else { Issue.record("Cached account should open offline") }
        #expect(second.offlineSession)
        #expect(second.navigation.ownerID == account.id)
        #expect(second.navigation.selectedTab == .vocabulary)
        #expect(second.navigation.paths.isEmpty)
        #expect(second.message?.contains("chỉ đọc") == true)

        await auth.configure()
        // A successful reconnect must re-fetch /users/me and clear offline restrictions.
        let reconnect = try model(session: secondSession,
            transport: MockTransport([.response(200, try Fixtures.body("user_with_relations"))]),
            profile: profile, clock: clock)
        await reconnect.restore()
        #expect(!reconnect.offlineSession)
    }

    @Test func offlineProfileNeverUnlocksWithoutKeychainSession() async throws {
        let clock = SessionClock()
        let identity = MemoryKeychain()
        let profile = OfflineProfileStore(keychain: identity)
        let user: ApiMe = try Fixtures.decode(ApiMe.self, "user_with_relations")
        try profile.save(user, at: clock.now())
        let token = MemoryKeychain()
        let auth = AuthDouble()
        let session = SessionActor(auth: auth, store: token, clock: clock)
        let sut = try model(session: session, transport: MockTransport([]),
                            profile: profile, clock: clock)
        await sut.restore()
        if case .signedOut = sut.state {} else { Issue.record("Missing refresh token means signed out") }
        #expect(!sut.offlineSession)
        #expect(sut.navigation.ownerID == nil)
        #expect(try profile.load(at: clock.now()) == nil)
    }

    @Test func staleProfileCannotUnlockColdOfflineSession() async throws {
        let clock = SessionClock()
        let identity = MemoryKeychain()
        let profile = OfflineProfileStore(keychain: identity)
        let user: ApiMe = try Fixtures.decode(ApiMe.self, "user_with_relations")
        try profile.save(user, at: clock.now())
        clock.advance(OfflineProfileStore.validity + 1)
        let auth = AuthDouble()
        await auth.configure(error: .network(-1009))
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let sut = try model(session: SessionActor(auth: auth, store: token, clock: clock),
                            transport: MockTransport([]), profile: profile, clock: clock)
        await sut.restore()
        if case .unavailable = sut.state {} else { Issue.record("Expired profile must not open user data") }
        #expect(sut.navigation.ownerID == nil)
        #expect(!sut.offlineSession)
    }

    @Test func revokedCredentialNeverUnlocksOfflineEvenIfProfileRemains() async throws {
        let clock = SessionClock()
        let identity = MemoryKeychain()
        let profile = OfflineProfileStore(keychain: identity)
        let user: ApiMe = try Fixtures.decode(ApiMe.self, "user_with_relations")
        try profile.save(user, at: clock.now())
        let auth = AuthDouble()
        await auth.configure(error: .unauthorized(nil))
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let sut = try model(session: SessionActor(auth: auth, store: token, clock: clock),
                            transport: MockTransport([]), profile: profile, clock: clock)
        await sut.restore()
        #expect(!sut.offlineSession && sut.navigation.ownerID == nil)
        #expect(try token.read() == nil)
        #expect(try profile.load(at: clock.now()) == nil)
    }

    @Test func logoutWhileOfflineDeletesCredentialAndVerifiedProfile() async throws {
        let clock = SessionClock()
        let auth = AuthDouble()
        let token = MemoryKeychain(String(repeating: "a", count: 64))
        let identity = MemoryKeychain()
        let profile = OfflineProfileStore(keychain: identity)
        let online = try model(session: SessionActor(auth: auth, store: token, clock: clock),
            transport: MockTransport([.response(200, try Fixtures.body("user_with_relations"))]),
            profile: profile, clock: clock)
        await online.restore()
        #expect(try profile.load(at: clock.now()) != nil)
        await online.logout()
        #expect(try token.read() == nil)
        #expect(try profile.load(at: clock.now()) == nil)
        #expect(online.navigation.ownerID == nil && !online.offlineSession)
    }
}

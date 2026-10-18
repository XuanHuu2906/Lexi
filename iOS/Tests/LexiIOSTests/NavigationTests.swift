import Foundation
import Testing
@testable import LexiIOS

@MainActor
struct NavigationTests {
    @Test func guestLookupSurvivesLoginButLogoutClearsIt() async throws {
        let session = SessionActor(auth: AuthDouble(), store: MemoryKeychain())
        let model = try fixture(session: session, transport: MockTransport([.response(200, try Fixtures.body("user_with_relations"))]))
        let lookup = try Fixtures.decode(LookupResult.self, "lookup")
        model.pendingLookup = lookup.wordInput
        await model.signIn(email: "fixture@example.invalid", password: "synthetic-password", register: false)
        if case .authenticated = model.state {} else { Issue.record("Expected successful login") }
        #expect(model.pendingLookup?.word == lookup.term)
        #expect(model.pendingLookup?.meaning == lookup.meaning)
        await model.logout()
        #expect(model.pendingLookup == nil)
    }
    private func fixture(session: SessionActor, transport: MockTransport, clock: SessionClock = SessionClock()) throws -> SessionViewModel {
        let client = APIClient(environment: try AppEnvironment(baseURL: "https://api.example.invalid", flavor: .staging),
                               transport: transport, tokens: session, clock: clock)
        return SessionViewModel(session: session, api: AuthAPI(client: client), clock: clock)
    }

    @Test func tabHistoryAndIdentitySurviveProfileRefreshWithoutTabRequests() async throws {
        let auth = AuthDouble(), clock = SessionClock()
        let session = SessionActor(auth: auth, store: MemoryKeychain(String(repeating: "a", count: 64)), clock: clock)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .response(200, try Fixtures.body("user_with_relations"))])
        let model = try fixture(session: session, transport: transport, clock: clock)
        await model.restore()
        let identity = model.navigation.generation
        model.navigation.selectedTab = .review
        model.navigation.paths[.review] = [.flashcards, .quiz(id: "synthetic-quiz")]
        model.navigation.selectedTab = .vocabulary
        model.navigation.paths[.vocabulary] = [.word(id: "synthetic-word")]
        for tab in MainTab.allCases { model.navigation.selectedTab = tab }
        #expect(await transport.requests.count == 1)
        clock.advance(61)
        await model.restore()
        #expect(model.navigation.generation == identity)
        #expect(model.navigation.selectedTab == .settings)
        #expect(model.navigation.paths[.review] == [.flashcards, .quiz(id: "synthetic-quiz")])
        #expect(model.navigation.paths[.vocabulary] == [.word(id: "synthetic-word")])
        #expect(await transport.requests.count == 2)
    }

    @Test func logoutClearsPersonalNavigationEvenWhenRemoteRevocationFails() async throws {
        let auth = AuthDouble()
        let session = SessionActor(auth: auth, store: MemoryKeychain(String(repeating: "a", count: 64)))
        let model = try fixture(session: session, transport: MockTransport([.response(200, try Fixtures.body("user_with_relations"))]))
        await model.restore()
        let identity = model.navigation.generation
        model.navigation.selectedTab = .vocabulary
        model.navigation.paths[.vocabulary] = [.word(id: "private-word")]
        await auth.configure(logoutFails: true)
        await model.logout()
        if case .signedOut = model.state {} else { Issue.record("Logout must leave the authenticated tree") }
        #expect(model.navigation.ownerID == nil)
        #expect(model.navigation.paths.isEmpty)
        #expect(model.navigation.selectedTab == .home)
        #expect(model.navigation.generation != identity)
        #expect(model.message != nil)
    }

    @Test func terminal401InvalidationResetsEveryTab() async throws {
        let auth = AuthDouble()
        let session = SessionActor(auth: auth, store: MemoryKeychain(String(repeating: "a", count: 64)))
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .response(401, Data()), .response(401, Data())])
        let model = try fixture(session: session, transport: transport)
        await model.restore()
        for tab in MainTab.allCases { model.navigation.paths[tab] = [.word(id: "private-id")] }
        let observation = Task { await model.observeInvalidations() }
        defer { observation.cancel() }
        let client = APIClient(environment: try AppEnvironment(baseURL: "https://api.example.invalid", flavor: .staging),
                               transport: transport, tokens: session)
        await #expect(throws: HTTPError.unauthorized(nil)) {
            try await client.send(APIEndpoint<EmptyResponse>(path: ["words"]))
        }
        for _ in 0..<1000 {
            if model.navigation.ownerID == nil { break }
            await Task.yield()
        }
        if case .signedOut = model.state {} else { Issue.record("Terminal 401 must return to authentication") }
        #expect(model.navigation.paths.isEmpty)
        #expect(model.navigation.ownerID == nil)
        #expect(model.navigation.selectedTab == .home)
    }

    @Test func offlineRestorationDropsPersonalUIAndRetriesIntoFreshShell() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        let session = SessionActor(auth: auth, store: store)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .failure(.notConnectedToInternet),
                                       .response(200, try Fixtures.body("user_with_relations"))])
        let model = try fixture(session: session, transport: transport)
        await model.restore()
        let identity = model.navigation.generation
        model.navigation.paths[.learn] = [.tutor]
        await model.restore(force: true)
        if case .unavailable = model.state {} else { Issue.record("Offline restore must offer retry") }
        #expect(model.navigation.paths.isEmpty)
        #expect(model.navigation.ownerID == nil)
        #expect(try store.read() != nil)
        await model.restore(force: true)
        if case .authenticated = model.state {} else { Issue.record("Retry must restore the shell") }
        #expect(model.navigation.generation != identity)
        #expect(model.navigation.paths.isEmpty)
    }

    @Test func accountChangeAndSameAccountReloginDiscardPreviousNavigation() {
        let navigation = AppNavigation()
        navigation.activate(userID: "user-a")
        navigation.paths[.vocabulary] = [.word(id: "a-only")]
        navigation.selectedTab = .vocabulary
        let first = navigation.generation
        navigation.activate(userID: "user-b")
        #expect(navigation.generation != first)
        #expect(navigation.ownerID == "user-b")
        #expect(navigation.paths.isEmpty)
        #expect(navigation.selectedTab == .home)
        let second = navigation.generation
        navigation.paths[.settings] = [.about]
        navigation.reset()
        navigation.activate(userID: "user-b")
        #expect(navigation.generation != second)
        #expect(navigation.paths.isEmpty)
    }

    @Test func switchingAuthFormDoesNotRemoveServerCooldown() async throws {
        let auth = AuthDouble()
        await auth.configure(error: .rateLimit(retryAfter: 60, payload: nil))
        let session = SessionActor(auth: auth, store: MemoryKeychain(String(repeating: "a", count: 64)))
        let model = try fixture(session: session, transport: MockTransport([]))
        await model.restore()
        let retryAfter = try #require(model.retryAfter)
        model.clearFeedback()
        #expect(model.message == nil)
        #expect(model.retryAfter == retryAfter)
        await model.restore(force: true)
        #expect(await auth.refreshCalls == 1)
    }
}

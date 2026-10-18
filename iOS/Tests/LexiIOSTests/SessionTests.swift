import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import Testing
@testable import LexiIOS

// Lock protects every mutable field; synchronous methods exercise the same
// non-suspending Keychain boundary as Security.framework.
final class MemoryKeychain: KeychainStore, @unchecked Sendable {
    private let lock = NSLock()
    private var value: String?
    private var failSave = false
    private var failDelete = false
    init(_ value: String? = nil) { self.value = value }
    func read() throws -> String? { lock.withLock { value } }
    func save(_ token: String) throws {
        try lock.withLock {
            if failSave { throw KeychainError.unavailable }
            value = token
        }
    }
    func delete() throws {
        try lock.withLock {
            if failDelete { throw KeychainError.unavailable }
            value = nil
        }
    }
    func failures(save: Bool = false, delete: Bool = false) { lock.withLock { failSave = save; failDelete = delete } }
}
final class SessionClock: APIClock, @unchecked Sendable {
    private let lock = NSLock()
    private var date = Date(timeIntervalSince1970: 1000)
    func now() -> Date { lock.withLock { date } }
    func advance(_ seconds: Double) { lock.withLock { date.addTimeInterval(seconds) } }
    func sleep(seconds: TimeInterval) async throws { try Task.checkCancellation() }
}

actor AuthDouble: NativeAuthenticating {
    private(set) var refreshCalls = 0
    private(set) var loginCalls = 0
    private(set) var revoked: [String] = []
    var error: HTTPError?
    var logoutFails = false
    var sameAccessToken = false
    private var blocked = false
    private var release: CheckedContinuation<Void, Never>?
    private var started: [CheckedContinuation<Void, Never>] = []
    func configure(error: HTTPError? = nil, blocked: Bool = false, logoutFails: Bool = false, sameAccessToken: Bool = false) {
        self.error = error; self.blocked = blocked; self.logoutFails = logoutFails; self.sameAccessToken = sameAccessToken
    }
    func waitForRefresh() async {
        if refreshCalls > 0 { return }
        await withCheckedContinuation { started.append($0) }
    }
    func unblock() { blocked = false; release?.resume(); release = nil }
    func login(_ credentials: MobileCredentials) async throws -> MobileAuthResult {
        loginCalls += 1
        let user = ApiUser(id: credentials.email, email: credentials.email, provider: "local", emailVerified: false,
                           role: "USER", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z")
        return MobileAuthResult(user: user, accessToken: "access", refreshToken: String(repeating: "a", count: 64), accessExpiresIn: 900)
    }
    func register(_ credentials: MobileCredentials) async throws -> MobileAuthResult { try await login(credentials) }
    func refresh(refreshToken: String) async throws -> MobileRefreshResult {
        refreshCalls += 1
        for waiter in started { waiter.resume() }; started.removeAll()
        if blocked { await withCheckedContinuation { release = $0 } }
        if let error { throw error }
        return MobileRefreshResult(accessToken: sameAccessToken ? "access" : "access-\(refreshCalls)",
            refreshToken: String(format: "%064x", refreshCalls), accessExpiresIn: 900)
    }
    func logout(refreshToken: String) async throws -> LogoutResult {
        if logoutFails { throw HTTPError.network(-1009) }
        revoked.append(refreshToken)
        return LogoutResult(message: "Logged out")
    }
}

actor UnauthorizedWave: HTTPTransport {
    private var waiters: [CheckedContinuation<Void, Never>] = []
    private(set) var requests = 0
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        requests += 1
        let firstWave = requests <= 5
        if requests < 5 { await withCheckedContinuation { waiters.append($0) } }
        else if requests == 5 { waiters.forEach { $0.resume() }; waiters.removeAll() }
        let url = try #require(request.url)
        return (Data(#"{"success":true,"data":{}}"#.utf8),
            try #require(HTTPURLResponse(url: url, statusCode: firstWave ? 401 : 200, httpVersion: nil, headerFields: nil)))
    }
}

actor HoldingTransport: HTTPTransport {
    private var waiting: CheckedContinuation<Void, Never>?
    private var started: CheckedContinuation<Void, Never>?
    private var hasStarted = false
    func waitForRequest() async {
        if hasStarted { return }
        await withCheckedContinuation { started = $0 }
    }
    func unblock() { waiting?.resume(); waiting = nil }
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        hasStarted = true; started?.resume(); started = nil
        await withCheckedContinuation { waiting = $0 }
        let url = try #require(request.url)
        return (Data(#"{"success":true,"data":{}}"#.utf8),
            try #require(HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)))
    }
}

struct SessionTests {
    let credentials = MobileCredentials(email: "synthetic@example.invalid", password: "Synthetic123")
    func client(_ session: SessionActor, _ transport: any HTTPTransport) throws -> APIClient {
        APIClient(environment: try AppEnvironment(baseURL: "https://api.example.invalid", flavor: .staging), transport: transport, tokens: session)
    }

    @Test func coldStartRotatesSavedCredentialAndCachesAccessInMemory() async throws {
        let store = MemoryKeychain(String(repeating: "a", count: 64)), auth = AuthDouble()
        let clock = SessionClock()
        let session = SessionActor(auth: auth, store: store, clock: clock)
        #expect(try await session.accessToken() == "access-1")
        #expect(try await session.accessToken() == "access-1")
        #expect(await auth.refreshCalls == 1)
        #expect(try store.read() == String(format: "%064x", 1))
        clock.advance(880)
        #expect(try await session.accessToken() == "access-2")
        #expect(await auth.refreshCalls == 2)
        // Recreating the actor models process termination (access is gone).
        let restarted = SessionActor(auth: auth, store: store, clock: clock)
        #expect(try await restarted.accessToken() == "access-3")
    }

    @Test func five401sRefreshOnceEvenWhenNewJWTHasIdenticalBytes() async throws {
        let store = MemoryKeychain(), auth = AuthDouble()
        await auth.configure(sameAccessToken: true)
        let session = SessionActor(auth: auth, store: store)
        try await session.signIn(credentials)
        let transport = UnauthorizedWave(), api = try client(session, transport)
        try await withThrowingTaskGroup(of: EmptyResponse.self) { group in
            for _ in 0..<5 { group.addTask { try await api.send(APIEndpoint(path: ["words"], method: .post)) } }
            for try await _ in group {}
        }
        #expect(await auth.refreshCalls == 1)
        #expect(await transport.requests == 10)
    }

    @Test func second401EndsSessionWithoutThirdAttempt() async throws {
        let store = MemoryKeychain(), auth = AuthDouble()
        let sut = SessionActor(auth: auth, store: store)
        try await sut.signIn(credentials)
        let transport = MockTransport([.response(401, Data()), .response(401, Data()), .response(200, Data())])
        let api = try client(sut, transport)
        await #expect(throws: HTTPError.unauthorized(nil)) { try await api.send(APIEndpoint<EmptyResponse>(path: ["words"])) }
        #expect(await transport.requests.count == 2)
        #expect(await auth.refreshCalls == 1)
        #expect(try store.read() == nil)
        #expect(await auth.revoked.count == 1)
    }

    @Test func refreshNetworkFailurePreservesSessionForRetry() async throws {
        let raw = String(repeating: "a", count: 64), auth = AuthDouble()
        let store = MemoryKeychain(raw)
        let sut = SessionActor(auth: auth, store: store)
        await auth.configure(error: .network(-1009))
        await #expect(throws: HTTPError.network(-1009)) { try await sut.credential() }
        #expect(try store.read() == raw)
        await auth.configure()
        #expect(try await sut.accessToken() == "access-2")
    }

    @Test(arguments: [HTTPError.unauthorized(nil), .forbidden(nil), .conflict(nil)])
    func terminalRefreshFailuresClearSavedCredential(_ failure: HTTPError) async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        await auth.configure(error: failure)
        let session = SessionActor(auth: auth, store: store)
        await #expect(throws: failure) { try await session.credential() }
        #expect(try store.read() == nil)
    }

    @Test func rotationWriteFailureClearsOldTokenAndRevokesReplacement() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        store.failures(save: true)
        let session = SessionActor(auth: auth, store: store)
        await #expect(throws: SessionError.storage) { try await session.credential() }
        #expect(try store.read() == nil)
        #expect(await auth.revoked == [String(format: "%064x", 1)])
        await #expect(throws: SessionError.signedOut) { try await session.credential() }
    }

    @Test func failedKeychainDeletionBlocksRestorationUntilExplicitCleanup() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        store.failures(save: true, delete: true)
        let session = SessionActor(auth: auth, store: store)
        await #expect(throws: SessionError.storage) { try await session.credential() }
        await #expect(throws: SessionError.storage) { try await session.credential() }
        #expect(await auth.refreshCalls == 1)
        store.failures()
        #expect(await session.logout().localCleared)
        #expect(try store.read() == nil)
    }

    @Test func logoutDuringRefreshRevokesLateReplacement() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        await auth.configure(blocked: true)
        let session = SessionActor(auth: auth, store: store)
        let refresh = Task { try await session.credential() }
        await auth.waitForRefresh()
        let logout = Task { await session.logout() }
        // Wait until the actor has synchronously invalidated the local session.
        for _ in 0..<1000 { if try store.read() == nil { break }; await Task.yield() }
        #expect(try store.read() == nil)
        await auth.unblock()
        await #expect(throws: SessionError.changed) { try await refresh.value }
        let report = await logout.value
        #expect(report.localCleared && report.remoteRevoked)
        #expect(Set(await auth.revoked) == [String(repeating: "a", count: 64), String(format: "%064x", 1)])
        #expect(try store.read() == nil)
    }

    @Test func remoteLogoutFailureIsReportedWithoutKeepingLocalSession() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        await auth.configure(logoutFails: true)
        let session = SessionActor(auth: auth, store: store)
        let report = await session.logout()
        #expect(report.localCleared && !report.remoteRevoked)
        #expect(try store.read() == nil)
    }

    @Test func accountSwitchRejectsLateResponseFromPreviousUser() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(), transport = HoldingTransport()
        let session = SessionActor(auth: auth, store: store)
        try await session.signIn(credentials)
        let api = try client(session, transport)
        let request = Task { try await api.send(APIEndpoint<EmptyResponse>(path: ["words"])) }
        await transport.waitForRequest()
        _ = await session.logout()
        try await session.signIn(MobileCredentials(email: "second@example.invalid", password: "Synthetic123"))
        await transport.unblock()
        await #expect(throws: SessionError.changed) { try await request.value }
        #expect(try await session.hasSavedSession())
    }

    @Test func publicRequestsNeverRefreshOrAttachSessionToken() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        let session = SessionActor(auth: auth, store: store)
        let transport = MockTransport([.response(401, Data())]), api = try client(session, transport)
        await #expect(throws: HTTPError.unauthorized(nil)) {
            try await api.send(APIEndpoint<EmptyResponse>(path: ["auth", "mobile", "login"], method: .post, requiresAuth: false))
        }
        #expect(await auth.refreshCalls == 0)
        #expect(await transport.requests.first?.value(forHTTPHeaderField: "Authorization") == nil)
    }

    @Test func cancellationDoesNotCancelSharedRefreshForOtherCallers() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        await auth.configure(blocked: true)
        let session = SessionActor(auth: auth, store: store)
        let transport = MockTransport([.response(200, Data(#"{"success":true,"data":{}}"#.utf8))])
        let api = try client(session, transport)
        let cancelled = Task { try await api.send(APIEndpoint<EmptyResponse>(path: ["words"])) }
        await auth.waitForRefresh()
        cancelled.cancel()
        let survivor = Task { try await api.send(APIEndpoint<EmptyResponse>(path: ["words"])) }
        await auth.unblock()
        await #expect(throws: HTTPError.cancellation) { try await cancelled.value }
        _ = try await survivor.value
        #expect(await auth.refreshCalls == 1)
        #expect(await transport.requests.count == 1)
    }

    @MainActor @Test func viewModelValidatesInputAndThrottlesResume() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(), clock = SessionClock()
        let session = SessionActor(auth: auth, store: store, clock: clock)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations")),
                                       .response(200, try Fixtures.body("user_with_relations"))])
        let vm = SessionViewModel(session: session, api: AuthAPI(client: try client(session, transport)), clock: clock)
        await vm.restore()
        if case .signedOut = vm.state {} else { Issue.record("No saved session must show login") }
        await vm.signIn(email: "invalid", password: "Synthetic123", register: false)
        await vm.signIn(email: credentials.email, password: "short", register: true)
        await vm.signIn(email: credentials.email, password: String(repeating: "短", count: 30), register: true)
        #expect(await auth.loginCalls == 0)
        await vm.signIn(email: credentials.email, password: credentials.password, register: false)
        if case .authenticated = vm.state {} else { Issue.record("Expected profile after login and me") }
        for _ in 0..<5 { await vm.restore() }
        #expect(await transport.requests.count == 1)
        #expect(await auth.refreshCalls == 0)
        clock.advance(61)
        await vm.restore()
        #expect(await transport.requests.count == 2)
        #expect(await auth.refreshCalls == 0)
        await vm.logout()
        if case .signedOut = vm.state {} else { Issue.record("Expected signed out") }
        #expect(try store.read() == nil)
    }

    @MainActor @Test func offlineRestorationOffersRetryAndKeepsCredential() async throws {
        let auth = AuthDouble(), store = MemoryKeychain(String(repeating: "a", count: 64))
        await auth.configure(error: .network(-1009))
        let session = SessionActor(auth: auth, store: store)
        let transport = MockTransport([.response(200, try Fixtures.body("user_with_relations"))])
        let vm = SessionViewModel(session: session, api: AuthAPI(client: try client(session, transport)))
        await vm.restore()
        if case .unavailable = vm.state {} else { Issue.record("Offline must offer restore, not login") }
        #expect(try store.read() != nil)
        #expect(vm.message?.contains("kết nối") == true)
        await auth.configure()
        await vm.restore(force: true)
        if case .authenticated = vm.state {} else { Issue.record("Expected restored profile") }
    }
}

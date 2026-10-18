import Foundation

enum SessionError: Error, Equatable, Sendable {
    case signedOut, changed, busy, storage, invalidTokens, remoteRevocationFailed
}
struct LogoutReport: Sendable {
    let localCleared: Bool
    let remoteRevoked: Bool
}

actor SessionActor: TokenProvider {
    private let auth: any NativeAuthenticating
    private let store: any KeychainStore
    private let clock: any APIClock
    private var sessionID = UUID()
    private var access: String?
    private var revision: UInt64 = 0
    private var expiresAt = Date.distantPast
    private var storageBlocked = false
    private var refreshFlight: (id: UUID, task: Task<AccessCredential, any Error>)?
    private var loginFlight: (id: UUID, task: Task<MobileAuthResult, any Error>)?
    nonisolated let invalidations: AsyncStream<UUID>
    private let events: AsyncStream<UUID>.Continuation

    init(auth: any NativeAuthenticating, store: any KeychainStore, clock: any APIClock = SystemAPIClock()) {
        self.auth = auth; self.store = store; self.clock = clock
        (invalidations, events) = AsyncStream.makeStream(bufferingPolicy: .bufferingNewest(16))
    }
    deinit { events.finish() }

    func hasSavedSession() throws -> Bool {
        guard !storageBlocked else { throw SessionError.storage }
        return try store.read() != nil
    }
    func currentID() -> UUID { sessionID }
    func accessToken() async throws -> String? { try await credential().token }

    func credential() async throws -> AccessCredential {
        if let access, expiresAt.timeIntervalSince(clock.now()) > 30 {
            return AccessCredential(token: access, sessionID: sessionID, revision: revision)
        }
        return try await rotatedCredential()
    }
    func validate(_ credential: AccessCredential) async throws { try ensureCurrent(credential) }
    private func ensureCurrent(_ credential: AccessCredential) throws {
        guard credential.sessionID == sessionID, access != nil else { throw SessionError.changed }
    }
    func refresh(rejected: AccessCredential) async throws -> AccessCredential {
        try ensureCurrent(rejected)
        if let access, revision != rejected.revision {
            return AccessCredential(token: access, sessionID: sessionID, revision: revision)
        }
        return try await rotatedCredential()
    }
    func reject(_ credential: AccessCredential) async throws {
        try ensureCurrent(credential)
        let report = await logout()
        if !report.localCleared { throw SessionError.storage }
        if !report.remoteRevoked { throw SessionError.remoteRevocationFailed }
    }

    func signIn(_ credentials: MobileCredentials, register: Bool = false) async throws {
        guard loginFlight == nil else { throw SessionError.busy }
        // UI only offers sign-in after logout/failed restoration. Refuse an implicit
        // account switch that would silently abandon a saved refresh credential.
        guard try !hasSavedSession(), access == nil else { throw SessionError.busy }
        try clearLocal()
        let id = sessionID
        let started = clock.now()
        let auth = self.auth
        let task = Task {
            if register { return try await auth.register(credentials) }
            return try await auth.login(credentials)
        }
        loginFlight = (id, task)
        defer { if loginFlight?.id == id { loginFlight = nil } }
        let result = try await task.value
        guard id == sessionID else {
            try await revokeOrThrow(result.refreshToken)
            throw SessionError.changed
        }
        try await install(access: result.accessToken, refresh: result.refreshToken,
                          lifetime: result.accessExpiresIn, started: started)
    }

    private func rotatedCredential() async throws -> AccessCredential {
        guard !storageBlocked else { throw SessionError.storage }
        if let flight = refreshFlight { return try await flight.task.value }
        guard let refresh = try store.read() else { throw SessionError.signedOut }
        let id = sessionID
        let task = Task { try await self.performRefresh(refresh, id: id) }
        refreshFlight = (id, task)
        return try await task.value
    }

    private func performRefresh(_ refresh: String, id: UUID) async throws -> AccessCredential {
        defer { if refreshFlight?.id == id { refreshFlight = nil } }
        let started = clock.now()
        let result: MobileRefreshResult
        do { result = try await auth.refresh(refreshToken: refresh) }
        catch {
            guard id == sessionID else { throw SessionError.changed }
            // Connectivity, cancellation, 429 and 5xx preserve the saved session.
            if let http = error as? HTTPError {
                switch http {
                case .unauthorized, .forbidden, .conflict: try clearLocal()
                default: break
                }
            }
            throw error
        }
        guard id == sessionID else {
            try await revokeOrThrow(result.refreshToken)
            throw SessionError.changed
        }
        try await install(access: result.accessToken, refresh: result.refreshToken,
                          lifetime: result.accessExpiresIn, started: started)
        return AccessCredential(token: result.accessToken, sessionID: id, revision: revision)
    }

    private func install(access: String, refresh: String, lifetime: Int, started: Date) async throws {
        guard !access.isEmpty, refresh.count == 64,
              refresh.allSatisfy({ "0123456789abcdef".contains($0) }), lifetime > 0 else {
            var cleared = true
            do { try clearLocal() } catch { cleared = false }
            if !refresh.isEmpty { try await revokeOrThrow(refresh) }
            if !cleared { throw SessionError.storage }
            throw SessionError.invalidTokens
        }
        do { try store.save(refresh) }
        catch {
            // Never keep using the consumed token after a failed rotation write.
            // Clearing memory happens even when deletion itself fails.
            do { try clearLocal() } catch { storageBlocked = true }
            try await revokeOrThrow(refresh)
            throw SessionError.storage
        }
        self.access = access
        revision &+= 1
        expiresAt = started.addingTimeInterval(TimeInterval(lifetime))
    }

    // Invalidate epoch before any await. Every API response is checked against its
    // originating epoch so a late response cannot leak account A into account B.
    private func clearLocal() throws {
        let old = sessionID
        sessionID = UUID(); access = nil; expiresAt = .distantPast
        refreshFlight = nil; loginFlight = nil
        events.yield(old)
        do { try store.delete(); storageBlocked = false }
        catch { storageBlocked = true; throw SessionError.storage }
    }

    func logout() async -> LogoutReport {
        let pendingRefresh = refreshFlight?.task
        let pendingLogin = loginFlight?.task
        var localCleared = true
        var remoteRevoked = true
        var raw: String?
        do { raw = try store.read() } catch { remoteRevoked = false }
        do { try clearLocal() } catch { localCleared = false }
        if let raw {
            do { _ = try await auth.logout(refreshToken: raw) } catch { remoteRevoked = false }
        }
        // Rotation may already have reached the server when the user logs out.
        // Let it finish and revoke its replacement instead of dropping the result.
        if let pendingRefresh {
            do {
                let result = try await pendingRefresh.value
                // Normally performRefresh detects the changed epoch and revokes.
                if result.sessionID == sessionID { remoteRevoked = false }
            } catch SessionError.changed { /* replacement was revoked */ }
            catch { remoteRevoked = false }
        }
        if let pendingLogin {
            do { try await revokeOrThrow(try await pendingLogin.value.refreshToken) }
            catch { remoteRevoked = false }
        }
        return LogoutReport(localCleared: localCleared, remoteRevoked: remoteRevoked)
    }

    private func revokeOrThrow(_ refresh: String) async throws {
        do { _ = try await auth.logout(refreshToken: refresh) }
        catch { throw SessionError.remoteRevocationFailed }
    }
}

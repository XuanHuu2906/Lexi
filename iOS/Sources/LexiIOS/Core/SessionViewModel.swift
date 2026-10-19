import Foundation
import Observation

@MainActor @Observable
final class SessionViewModel {
    enum State { case launching, signedOut, authenticated(ApiMe), unavailable }
    private(set) var state: State = .launching {
        didSet {
            if case .authenticated(let me) = state { navigation.activate(userID: me.id) }
            else { navigation.reset() }
        }
    }
    let navigation = AppNavigation()
    // Guest lookup is kept in memory only until login and explicit save/cancel.
    var pendingLookup: WordInput?
    private(set) var busy = false
    private(set) var message: String?
    private(set) var offlineSession = false
    private(set) var retryAfter: Date?
    private let session: SessionActor
    private let api: AuthAPI
    private let clock: any APIClock
    private let offlineProfile: OfflineProfileStore?
    private let offlineCacheDirectory: URL?
    private let checkpointDefaults: UserDefaults
    private var activeNotebook: (owner: String, cache: OfflineNotebookCache)?
    private var operation = UUID()
    private var profileSessionID: UUID?
    private var lastCheck: Date?

    init(session: SessionActor, api: AuthAPI, clock: any APIClock = SystemAPIClock(),
         offlineProfile: OfflineProfileStore? = nil, offlineCacheDirectory: URL? = nil,
         checkpointDefaults: UserDefaults = .standard) {
        self.session = session; self.api = api; self.clock = clock
        self.offlineProfile = offlineProfile
        self.offlineCacheDirectory = offlineCacheDirectory
        self.checkpointDefaults = checkpointDefaults
    }

    /// Register the *same* writer actor as the authenticated shell. It must
    /// close before any logout purge to prevent an in-flight save resurrecting
    /// a deleted account's notebook.
    func registerNotebook(_ cache: OfflineNotebookCache, userID: String) {
        guard navigation.ownerID == userID else { return }
        activeNotebook = (userID, cache)
    }

    /// Failure is visible to the caller. Do not claim that logout removed
    /// private data when iOS file protection or disk errors prevented it.
    private func purgePersonalData(ownerID: String?) async -> Bool {
        var succeeded = true
        if let activeNotebook {
            self.activeNotebook = nil
            do { try await activeNotebook.cache.purge() }
            catch { succeeded = false }
        }
        do { try OfflineNotebookCache.purgeAll(directory: offlineCacheDirectory) }
        catch { succeeded = false }
        if let ownerID {
            let namespace = api.client.environment.apiBaseURL.absoluteString + "|" + ownerID
            StudyCheckpointStore(defaults: checkpointDefaults, namespace: namespace).close(clear: true)
        }
        return succeeded
    }

    func clearFeedback() {
        guard !busy else { return }
        message = nil // Keep server cooldown when switching login/register forms.
    }

    func observeInvalidations() async {
        for await id in session.invalidations {
            guard !Task.isCancelled else { return }
            if profileSessionID == id {
                let accountID = navigation.ownerID
                pendingLookup = nil
                profileSessionID = nil
                offlineSession = false
                state = .signedOut
                let cacheCleared = await purgePersonalData(ownerID: accountID)
                var profileCleared = true
                do { try offlineProfile?.clear() } catch { profileCleared = false }
                message = cacheCleared && profileCleared
                    ? "Phiên đã kết thúc. Vui lòng đăng nhập lại."
                    : "Phiên đã kết thúc, nhưng chưa xóa hết dữ liệu trên iPhone. Mở khóa thiết bị và thử đăng xuất để dọn dữ liệu."
            }
        }
    }

    func restore(force: Bool = false) async {
        guard !busy else { return }
        if !force, let lastCheck, clock.now().timeIntervalSince(lastCheck) < 60 { return }
        if let retryAfter, retryAfter > clock.now() { return }
        if case .signedOut = state, !force { return }
        lastCheck = clock.now()
        let id = UUID(); operation = id
        busy = true; message = nil
        defer { if operation == id { busy = false } }
        do {
            guard try await session.hasSavedSession() else {
                let accountID = navigation.ownerID
                offlineSession = false
                state = .signedOut
                _ = await purgePersonalData(ownerID: accountID)
                try? offlineProfile?.clear()
                return
            }
            // Proactively refresh only when needed; a fresh access token stays in memory.
            _ = try await session.credential()
            let sessionID = await session.currentID()
            let me = try await api.me()
            guard operation == id, sessionID == (await session.currentID()) else { return }
            profileSessionID = sessionID
            try? offlineProfile?.save(me, at: clock.now())
            offlineSession = false
            state = .authenticated(me)
        } catch {
            guard operation == id else { return }
            if await restoreOfflineIfAllowed(error) { return }
            await showRestorationError(error)
        }
    }

    func signIn(email: String, password: String, register: Bool) async {
        guard !busy else { return }
        if let retryAfter, retryAfter > clock.now() { return }
        let email = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard email.count <= 254, email.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil else {
            message = "Nhập địa chỉ email hợp lệ."; return
        }
        guard !password.isEmpty, password.count <= 72,
              !register || (password.count >= 8 && password.utf8.count <= 72) else {
            message = register ? "Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte UTF-8." : "Nhập mật khẩu (tối đa 72 ký tự)."
            return
        }
        let id = UUID(); operation = id
        // An old offline profile must not survive an account switch even if
        // a Keychain write or delete fails: refuse login until cleanup works.
        do { try offlineProfile?.clear() }
        catch {
            message = "Chưa dọn được hồ sơ phiên cũ trong Keychain. Mở khóa thiết bị rồi thử đăng nhập lại."
            return
        }
        let oldOwner = navigation.ownerID
        guard await purgePersonalData(ownerID: oldOwner) else {
            message = "Chưa dọn được dữ liệu phiên cũ trên iPhone. Mở khóa thiết bị rồi thử đăng nhập lại."
            return
        }
        profileSessionID = nil; offlineSession = false
        state = .signedOut; busy = true; message = nil
        defer { if operation == id { busy = false } }
        do {
            try await session.signIn(MobileCredentials(email: email, password: password), register: register)
            guard operation == id else { return }
            let sessionID = await session.currentID()
            let me = try await api.me()
            guard operation == id, sessionID == (await session.currentID()) else { return }
            profileSessionID = sessionID
            try? offlineProfile?.save(me, at: clock.now())
            offlineSession = false
            state = .authenticated(me); lastCheck = clock.now()
        } catch {
            guard operation == id else { return }
            await showRestorationError(error, signingIn: true)
        }
    }

    func logout() async {
        pendingLookup = nil
        let accountID: String?
        if case .authenticated(let me) = state { accountID = me.id }
        else { accountID = try? offlineProfile?.load(at: clock.now())?.id }
        let id = UUID(); operation = id
        profileSessionID = nil; offlineSession = false
        // Remove personal UI synchronously before any asynchronous disk work.
        state = .signedOut; busy = true; message = nil; retryAfter = nil
        let cacheCleared = await purgePersonalData(ownerID: accountID)
        var profileCleared = true
        do { try offlineProfile?.clear() } catch { profileCleared = false }
        let report = await session.logout()
        guard operation == id else { return }
        busy = false
        if !report.localCleared || !cacheCleared || !profileCleared {
            state = .unavailable
            message = "Chưa xóa hết phiên hoặc dữ liệu học trên iPhone. Mở khóa thiết bị và bấm Đăng xuất khỏi thiết bị để thử dọn lại."
        } else if !report.remoteRevoked {
            message = "Đã xóa phiên và dữ liệu trên thiết bị; chưa xác nhận thu hồi phiên trên máy chủ do lỗi kết nối."
        }
    }

    private func restoreOfflineIfAllowed(_ error: any Error) async -> Bool {
        // Connectivity loss is not revoked authentication. Never use this fallback
        // for 401/403, storage corruption, an absent Keychain token or account switch.
        switch error as? HTTPError {
        case .network, .timeout: break
        default: return false
        }
        guard (try? await session.hasSavedSession()) == true else { return false }
        let currentID = await session.currentID()
        let profile: ApiMe
        if profileSessionID == currentID, case .authenticated(let me) = state {
            profile = me
        } else if let cached = try? offlineProfile?.load(at: clock.now()) {
            profile = cached
        } else { return false }

        profileSessionID = currentID
        offlineSession = true
        state = .authenticated(profile)
        // Hide network-backed entry points until /users/me succeeds online.
        let wasReviewing = navigation.selectedTab == .review
        navigation.paths = [:]
        navigation.selectedTab = wasReviewing ? .review : .vocabulary
        message = "Mất kết nối. Bạn vẫn có thể xem từ vựng và luyện thẻ đã lưu trên iPhone (chỉ đọc)."
        return true
    }

    private func showRestorationError(_ error: any Error, signingIn: Bool = false) async {
        let previousOwner = navigation.ownerID
        offlineSession = false
        // Hide all private UI synchronously, BEFORE waiting for actor/file IO.
        state = .unavailable
        profileSessionID = nil
        switch error as? HTTPError {
        case .unauthorized, .forbidden:
            // Do not continue exposing cached data after explicit server rejection.
            _ = await purgePersonalData(ownerID: previousOwner)
            try? offlineProfile?.clear()
        default: break
        }
        // Failure to read Keychain must not be interpreted as an absent session.
        do { state = try await session.hasSavedSession() ? .unavailable : .signedOut }
        catch { state = .unavailable }
        if let http = error as? HTTPError {
            switch http {
            case .unauthorized: message = signingIn ? "Email hoặc mật khẩu không đúng, hoặc phiên không còn hợp lệ." : "Phiên đã hết hạn. Vui lòng đăng nhập lại."
            case .forbidden: message = "Tài khoản đang bị khóa hoặc chưa được phép truy cập."
            case .conflict: message = signingIn ? "Email đã được đăng ký. Hãy đăng nhập." : "Phiên đã được sử dụng. Vui lòng đăng nhập lại."
            case .network, .timeout: message = "Không thể kết nối. Phiên đã lưu được giữ lại; hãy kiểm tra mạng và thử lại."
            case .rateLimit(let seconds, _):
                retryAfter = clock.now().addingTimeInterval(seconds ?? 60)
                message = "Quá nhiều yêu cầu. Vui lòng chờ trước khi thử lại."
            case .validation: message = "Email hoặc mật khẩu chưa đáp ứng yêu cầu."
            case .cancellation: message = "Yêu cầu đã bị hủy. Bạn có thể thử lại."
            default: message = "Dịch vụ chưa sẵn sàng. Vui lòng thử lại sau."
            }
        } else if error is KeychainError || (error as? SessionError) == .storage {
            message = "Không thể truy cập Keychain an toàn. Mở khóa thiết bị và thử lại."
        } else if (error as? SessionError) == .remoteRevocationFailed {
            message = "Phiên trên thiết bị đã dừng; chưa xác nhận thu hồi phiên trên máy chủ."
        } else { message = "Không thể khôi phục phiên. Hãy thử lại hoặc đăng xuất." }
    }
}

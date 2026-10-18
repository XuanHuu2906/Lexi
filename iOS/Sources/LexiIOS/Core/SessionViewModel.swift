import Foundation
import Observation

@MainActor @Observable
final class SessionViewModel {
    enum State { case launching, signedOut, authenticated(ApiMe), unavailable }
    private(set) var state: State = .launching
    private(set) var busy = false
    private(set) var message: String?
    private(set) var retryAfter: Date?
    private let session: SessionActor
    private let api: AuthAPI
    private let clock: any APIClock
    private var operation = UUID()
    private var profileSessionID: UUID?
    private var lastCheck: Date?

    init(session: SessionActor, api: AuthAPI, clock: any APIClock = SystemAPIClock()) {
        self.session = session; self.api = api; self.clock = clock
    }

    func observeInvalidations() async {
        for await id in session.invalidations {
            guard !Task.isCancelled else { return }
            if profileSessionID == id {
                profileSessionID = nil
                state = .signedOut
                message = "Phiên đã kết thúc. Vui lòng đăng nhập lại."
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
            guard try await session.hasSavedSession() else { state = .signedOut; return }
            // Proactively refresh only when needed; a fresh access token stays in memory.
            _ = try await session.credential()
            let sessionID = await session.currentID()
            let me = try await api.me()
            guard operation == id, sessionID == (await session.currentID()) else { return }
            profileSessionID = sessionID; state = .authenticated(me)
        } catch {
            guard operation == id else { return }
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
        profileSessionID = nil; state = .signedOut; busy = true; message = nil
        defer { if operation == id { busy = false } }
        do {
            try await session.signIn(MobileCredentials(email: email, password: password), register: register)
            guard operation == id else { return }
            let sessionID = await session.currentID()
            let me = try await api.me()
            guard operation == id, sessionID == (await session.currentID()) else { return }
            profileSessionID = sessionID; state = .authenticated(me); lastCheck = clock.now()
        } catch {
            guard operation == id else { return }
            await showRestorationError(error, signingIn: true)
        }
    }

    func logout() async {
        let id = UUID(); operation = id
        profileSessionID = nil; state = .signedOut; busy = true; message = nil; retryAfter = nil
        let report = await session.logout()
        guard operation == id else { return }
        busy = false
        if !report.localCleared {
            state = .unavailable
            message = "Chưa xóa được phiên khỏi Keychain. Mở khóa thiết bị và thử đăng xuất lại."
        } else if !report.remoteRevoked {
            message = "Đã xóa phiên trên thiết bị; chưa xác nhận thu hồi phiên trên máy chủ do lỗi kết nối."
        }
    }

    private func showRestorationError(_ error: any Error, signingIn: Bool = false) async {
        // Failure to read Keychain must not be interpreted as an absent session.
        do { state = try await session.hasSavedSession() ? .unavailable : .signedOut }
        catch { state = .unavailable }
        profileSessionID = nil
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

import Foundation
import Observation

enum LoadPhase: Equatable { case idle, loading, loaded, empty, failed, stale }

enum FeatureErrorContext { case general, pronunciation }

struct FeatureFeedback: Equatable {
    let message: String
    var retryAt: Date? = nil

    init(_ error: any Error, now: Date = Date(), mutation: Bool = false,
         context: FeatureErrorContext = .general) {
        // Pronunciation has no saved mutation to reconcile: an unknown upload result
        // must not tell learners to reload vocabulary data. Never display raw API or
        // provider messages (they may contain private text or diagnostics).
        if context == .pronunciation {
            if let audio = error as? AudioFailure {
                message = audio.message
                return
            }
            switch error as? HTTPError {
            case .server(let status, _) where status == 503:
                message = "Dịch vụ chấm phát âm chưa sẵn sàng (HTTP 503). Hãy kiểm tra Azure Speech trên máy chủ Lexi hoặc thử lại sau. Không có điểm chấm được xác nhận."
                return
            case .validation(let status, _) where status == 422:
                message = "Bản ghi chưa được chấp nhận (HTTP 422): định dạng âm thanh không hợp lệ hoặc không nhận rõ lời nói. Hãy nghe lại và ghi câu rõ hơn."
                return
            case .unexpectedStatus(let status, _) where status == 413:
                message = "Bản ghi vượt giới hạn upload của máy chủ (HTTP 413). Hãy ghi đoạn ngắn hơn."
                return
            case .server(let status, _):
                message = "Máy chủ chưa trả được điểm phát âm (HTTP \(status)). Có thể lỗi Azure Speech hoặc AI tạo góp ý. Bản ghi vẫn còn trong màn; Lexi không tự gửi lại."
                return
            case .decoding, .invalidResponse:
                message = "Phản hồi chấm phát âm không đúng định dạng API. Chưa có điểm được xác nhận; vui lòng báo lỗi này để kiểm tra máy chủ."
                return
            case .timeout:
                message = "Gửi bản ghi quá thời gian chờ. Không rõ máy chủ đã xử lý hay chưa; Lexi không tự gửi lại."
                return
            case .network:
                message = "Mất kết nối khi gửi bản ghi. Hãy kiểm tra mạng; Lexi không tự gửi lại."
                return
            default: break // Keep shared auth, rate-limit and permission handling.
            }
        }
        let uncertain = mutation ? " Thao tác có thể đã được lưu; hãy tải lại dữ liệu trước khi thử lại." : ""
        switch error as? HTTPError {
        case .unauthorized: message = "Phiên đã hết hạn. Vui lòng đăng nhập lại."
        case .forbidden: message = "Bạn chưa được phép thực hiện thao tác này."
        case .notFound: message = "Từ này không còn trong sổ từ. Hãy tải lại danh sách."
        case .conflict: message = "Từ này đã có trong sổ từ của bạn."
        case .validation, .invalidRequest: message = "Dữ liệu chưa hợp lệ. Kiểm tra các trường rồi thử lại."
        case .rateLimit(let seconds, _):
            message = "Đã đạt giới hạn yêu cầu. Vui lòng chờ trước khi thử lại."
            retryAt = now.addingTimeInterval(seconds ?? 60)
        case .timeout: message = "Máy chủ phản hồi quá lâu." + uncertain
        case .network: message = "Không có kết nối. Kiểm tra Wi-Fi hoặc dữ liệu di động." + uncertain
        default: message = "Chưa thể hoàn tất yêu cầu. Vui lòng thử lại sau." + uncertain
        }
    }

    init(message: String) { self.message = message }
    func canRetry(at date: Date = Date()) -> Bool { retryAt.map { $0 <= date } ?? true }
}

func isCancellation(_ error: any Error) -> Bool {
    error is CancellationError || (error as? HTTPError) == .cancellation
}

extension String {
    var trimmed: String { trimmingCharacters(in: .whitespacesAndNewlines) }
    var nonempty: String? { trimmed.isEmpty ? nil : trimmed }
    var commaSeparated: [String] { split(separator: ",").compactMap { String($0).nonempty } }
}

// One instance per authenticated shell identity. No account data is persisted to disk.
@MainActor @Observable
final class LearningFeatures {
    let dashboard: DashboardViewModel
    let words: WordListViewModel
    let settings: SettingsViewModel
    private(set) var revision = 0

    init(api: LexiAPI) {
        dashboard = DashboardViewModel(repository: DashboardRepository(api: api))
        words = WordListViewModel(api: api.words)
        settings = SettingsViewModel(api: ProfileRepository(api: api))
    }

    func invalidate() {
        dashboard.invalidate()
        words.invalidate()
        revision += 1
    }
}

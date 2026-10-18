import Foundation
import Observation

enum LoadPhase: Equatable { case idle, loading, loaded, empty, failed, stale }

struct FeatureFeedback: Equatable {
    let message: String
    var retryAt: Date? = nil

    init(_ error: any Error, now: Date = Date(), mutation: Bool = false) {
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

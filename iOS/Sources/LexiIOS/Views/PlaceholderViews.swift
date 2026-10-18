#if canImport(SwiftUI)
import SwiftUI

struct LaunchView: View {
    var body: some View { ProgressView("Đang kiểm tra kết nối…") }
}

struct ErrorView: View {
    let title: String
    let message: String
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle").font(.title).accessibilityHidden(true)
            Text(title).font(.headline)
            Text(message).foregroundStyle(.secondary)
        }.multilineTextAlignment(.center)
    }
}

struct OfflineView: View {
    var body: some View {
        ErrorView(title: "Network unavailable", message: "Không có kết nối mạng. Kiểm tra Wi-Fi hoặc dữ liệu di động rồi thử lại.")
    }
}

struct DashboardView: View {
    var body: some View {
        ContentUnavailableView("Góc học tập", systemImage: "book", description: Text("Dữ liệu học tập sẽ xuất hiện sau khi đăng nhập và kết nối tính năng ở Phase 6."))
    }
}
#endif

#if canImport(SwiftUI)
import SwiftUI

private enum LexiColors {
    static let grape = Color(red: 108/255.0, green: 75/255.0, blue: 245/255.0)
    static let cloud = Color(red: 244/255.0, green: 242/255.0, blue: 251/255.0)
    static let ink = Color(red: 27/255.0, green: 24/255.0, blue: 48/255.0)
}

struct WelcomeView: View {
    let container: AppContainer
    @State private var attempt = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    Image(systemName: "character.book.closed.fill")
                        .font(.system(size: 64)).foregroundStyle(LexiColors.grape)
                        .accessibilityHidden(true)
                    VStack(spacing: 8) {
                        Text("Lexi").font(.largeTitle.bold())
                        Text("Mỗi ngày một chút, tiếng Anh tiến xa.")
                            .font(.title3).multilineTextAlignment(.center)
                    }
                    Group {
                        if let health = container.health {
                            healthStatus(health)
                        } else {
                            ErrorView(title: "Chưa cấu hình kết nối", message: "Thiết lập URL HTTPS của Lexi API trong cấu hình bản build để kiểm tra kết nối.")
                        }
                    }
                    .frame(maxWidth: .infinity).padding(20)
                    .background(.white, in: RoundedRectangle(cornerRadius: 20))
                    if let session = container.session {
                        NavigationLink("Đăng nhập") { LoginView(model: session) }
                            .buttonStyle(.borderedProminent).controlSize(.large)
                        if let message = session.message {
                            Text(message).font(.callout).multilineTextAlignment(.center)
                        }
                    }
                    Text("Bản phát triển").font(.footnote).foregroundStyle(.secondary)
                }
                .padding(24).padding(.top, 36)
                .frame(maxWidth: 560).frame(maxWidth: .infinity)
            }
            .background(LexiColors.cloud).foregroundStyle(LexiColors.ink)
            .tint(LexiColors.grape)
            .task(id: attempt) { await container.health?.check() }
        }
    }

    @ViewBuilder private func healthStatus(_ model: HealthViewModel) -> some View {
        VStack(spacing: 16) {
            switch model.state {
            case .idle, .loading: LaunchView()
            case .reachable:
                Label("API reachable", systemImage: "checkmark.circle.fill")
                    .font(.headline).foregroundStyle(.green)
                Text("Kết nối Lexi và cơ sở dữ liệu hoạt động.").multilineTextAlignment(.center)
            case .degraded:
                ErrorView(title: "Dịch vụ chưa sẵn sàng", message: "API đã phản hồi nhưng hệ thống chưa hoạt động bình thường.")
            case .offline: OfflineView()
            case .timeout:
                ErrorView(title: "Kết nối quá thời gian", message: "Máy chủ chưa phản hồi kịp. Hãy thử lại.")
            case .rateLimited:
                ErrorView(title: "Đã đạt giới hạn yêu cầu", message: "Vui lòng đợi trước khi thử lại.")
            case .failed:
                ErrorView(title: "Không thể kết nối Lexi", message: "Không nhận được phản hồi hợp lệ. Vui lòng thử lại sau.")
            }
            if model.state != .loading {
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    let until = retryDate(model)
                    let waiting = until.map { $0 > context.date } ?? false
                    VStack(spacing: 8) {
                        if waiting, let until {
                            Text("Thử lại sau \(until.timeIntervalSince(context.date).rounded(.up).formatted(.number.precision(.fractionLength(0)))) giây.")
                                .font(.footnote)
                        }
                        Button("Kiểm tra lại") { attempt += 1 }
                            .buttonStyle(.bordered).controlSize(.large)
                            .disabled(waiting)
                    }
                }
            }
        }
        .accessibilityElement(children: .contain)
    }

    private func retryDate(_ model: HealthViewModel) -> Date? {
        if case .rateLimited(let until) = model.state { return until }
        return nil
    }
}
#endif

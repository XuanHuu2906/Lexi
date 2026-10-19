#if os(iOS)
import SwiftUI

struct WelcomeView: View {
    let container: AppContainer
    @State private var attempt = 0
    @ScaledMetric(relativeTo: .largeTitle) private var markSize = 64

    var body: some View {
        NavigationStack {
            LexiPage {
                VStack(spacing: LexiSpacing.xl) {
                    Image(systemName: "character.book.closed.fill")
                        .font(.system(size: markSize)).foregroundStyle(LexiColors.grape500)
                        .accessibilityHidden(true)
                    VStack(spacing: LexiSpacing.sm) {
                        Text("Lexi").font(LexiTypography.hero).accessibilityAddTraits(.isHeader)
                        Text("Mỗi ngày một chút, tiếng Anh tiến xa.")
                            .font(LexiTypography.cardTitle).multilineTextAlignment(.center)
                    }
                    LexiCard {
                        if let health = container.health {
                            healthStatus(health)
                        } else {
                            ErrorState(title: "Chưa thể kết nối", message: "Bản cài đặt này chưa có cấu hình kết nối Lexi. Vui lòng liên hệ người cung cấp bản cài đặt.")
                        }
                    }
                    if let session = container.session {
                        if let api = container.api {
                            NavigationLink("Tra từ không cần đăng nhập") { LookupView(api: api.words, session: session) }
                                .buttonStyle(LexiButtonStyle(variant: .secondary))
                        }
                        NavigationLink("Đăng nhập") { LoginView(model: session) }
                            .buttonStyle(LexiButtonStyle(variant: .primary))
                        if let message = session.message {
                            FeedbackNotice(message: message)
                        }
                    }
                    Text("Bản phát triển").font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                }
                .padding(.top, LexiSpacing.xl)
            }
            .task(id: attempt) { await container.health?.check() }
        }
    }

    @ViewBuilder private func healthStatus(_ model: HealthViewModel) -> some View {
        VStack(spacing: LexiSpacing.lg) {
            switch model.state {
            case .idle, .loading: LoadingState(title: "Đang kiểm tra kết nối…")
            case .reachable:
                Label("Đã kết nối Lexi", systemImage: "checkmark.circle.fill")
                    .font(LexiTypography.heading).foregroundStyle(LexiColors.success)
                Text("Sẵn sàng cho hành trình học của bạn.").multilineTextAlignment(.center)
            case .degraded:
                ErrorState(title: "Dịch vụ chưa sẵn sàng", message: "Lexi chưa thể phục vụ ngay lúc này. Vui lòng thử lại sau.")
            case .offline:
                ErrorState(title: "Không có kết nối mạng", message: "Kiểm tra Wi-Fi hoặc dữ liệu di động rồi thử lại.")
            case .timeout:
                ErrorState(title: "Kết nối quá thời gian", message: "Máy chủ chưa phản hồi kịp. Hãy thử lại.")
            case .rateLimited:
                ErrorState(title: "Đã đạt giới hạn yêu cầu", message: "Vui lòng đợi trước khi thử lại.")
            case .failed:
                ErrorState(title: "Không thể kết nối Lexi", message: "Không nhận được phản hồi hợp lệ. Vui lòng thử lại sau.")
            }
            if model.state != .loading {
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    let until = retryDate(model)
                    let waiting = until.map { $0 > context.date } ?? false
                    VStack(spacing: LexiSpacing.sm) {
                        if waiting, let until {
                            Text("Thử lại sau \(until.timeIntervalSince(context.date).rounded(.up).formatted(.number.precision(.fractionLength(0)))) giây.")
                                .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                        }
                        LexiButton(title: "Kiểm tra lại", variant: .secondary, isDisabled: waiting) { attempt += 1 }
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

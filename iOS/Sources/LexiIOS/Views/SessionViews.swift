#if os(iOS)
import SwiftUI

struct SessionRootView: View {
    let container: AppContainer
    @Environment(\.scenePhase) private var scenePhase
    @State private var reminderTap = ReminderTapRouter.shared

    var body: some View {
        Group {
            if let model = container.session {
                content(model)
                    .task { await model.observeInvalidations() }
                    .task { await model.restore() }
                    .onChange(of: scenePhase) { _, phase in
                        if phase == .active {
                            Task { await model.restore(force: model.offlineSession) }
                        }
                    }
                    .onChange(of: reminderTap.pendingReview) { _, _ in
                        reminderTap.routeIfPossible(model.navigation)
                    }
                    .onChange(of: model.navigation.ownerID) { _, _ in
                        reminderTap.routeIfPossible(model.navigation)
                    }
                    .task(id: model.navigation.ownerID) {
                        reminderTap.routeIfPossible(model.navigation)
                    }
            } else { WelcomeView(container: container) }
        }
        .accessibilityHidden(scenePhase != .active)
        .allowsHitTesting(scenePhase == .active)
        .overlay {
            if scenePhase != .active {
                ZStack {
                    LexiColors.cloud100.ignoresSafeArea()
                    Label("Lexi", systemImage: "lock.fill").font(LexiTypography.hero)
                }
                .accessibilityAddTraits(.isModal)
            }
        }
    }

    @ViewBuilder private func content(_ model: SessionViewModel) -> some View {
        switch model.state {
        case .launching:
            LexiPage { LoadingState(title: "Đang khôi phục phiên…") }
        case .signedOut:
            WelcomeView(container: container)
        case .unavailable:
            LexiPage {
                LexiCard {
                    ErrorState(title: "Chưa thể mở phiên", message: model.message ?? "Vui lòng thử lại.")
                    RetrySessionButton(model: model)
                    LexiButton(title: "Đăng xuất khỏi thiết bị", variant: .destructive, isLoading: model.busy) {
                        Task { await model.logout() }
                    }
                }
            }
        case .authenticated(let me):
            if let api = container.api {
                MainTabView(model: model, me: me, navigation: model.navigation, api: api)
                    .id(model.navigation.generation)
            }
        }
    }
}

struct LoginView: View {
    let model: SessionViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var registering = false
    @FocusState private var focus: Field?
    private enum Field { case email, password }

    var body: some View {
        LexiPage {
            Text(registering ? "Bắt đầu hành trình của bạn." : "Chào mừng bạn trở lại.")
                .font(LexiTypography.title).accessibilityAddTraits(.isHeader)
            LexiCard {
                LexiInput(title: "Email", isFocused: focus == .email) {
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress).textContentType(.username)
                        .textInputAutocapitalization(.never).autocorrectionDisabled()
                        .focused($focus, equals: .email).submitLabel(.next)
                        .onSubmit { focus = .password }
                }
                LexiInput(title: "Mật khẩu", isFocused: focus == .password) {
                    SecureField("Mật khẩu", text: $password)
                        .textContentType(registering ? .newPassword : .password)
                        .focused($focus, equals: .password).submitLabel(.go)
                        .onSubmit { submit() }
                }
                if registering {
                    Text("Ít nhất 8 ký tự; tối đa 72 byte UTF-8.")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                }
            }
            .disabled(model.busy)
            VStack(spacing: LexiSpacing.lg) {
                if let message = model.message {
                    ErrorState(title: "Chưa thể tiếp tục", message: message)
                        .accessibilityIdentifier("auth-feedback")
                }
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    let waiting = model.retryAfter.map { $0 > context.date } ?? false
                    LexiButton(title: registering ? "Tạo tài khoản" : "Đăng nhập", isLoading: model.busy,
                               isDisabled: email.isEmpty || password.isEmpty || waiting, action: submit)
                    if waiting { Text("Vui lòng chờ trước khi thử lại.").font(LexiTypography.caption) }
                }
                LexiButton(title: registering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký",
                           variant: .secondary, isDisabled: model.busy) {
                    registering.toggle(); password = ""
                    model.clearFeedback()
                    focus = .email
                }
            }
            Text("Dùng cùng email và mật khẩu với Lexi trên web.")
                .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
        }
        .navigationTitle(registering ? "Đăng ký" : "Đăng nhập")
        .privacySensitive()
        .onDisappear { password = "" }
    }

    private func submit() {
        guard !model.busy else { return }
        focus = nil
        let submittedPassword = password
        let submittedEmail = email
        let isRegistration = registering
        password = ""
        Task { await model.signIn(email: submittedEmail, password: submittedPassword, register: isRegistration) }
    }
}

private struct RetrySessionButton: View {
    let model: SessionViewModel
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            LexiButton(title: "Thử lại", isLoading: model.busy,
                       isDisabled: model.retryAfter.map { $0 > context.date } ?? false) {
                Task { await model.restore(force: true) }
            }
        }
    }
}
#endif

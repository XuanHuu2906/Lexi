#if os(iOS)
import SwiftUI

struct SessionRootView: View {
    let container: AppContainer
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Group {
            if let model = container.session {
                content(model)
                    .task { await model.observeInvalidations() }
                    .task { await model.restore() }
                    .onChange(of: scenePhase) { _, phase in
                        if phase == .active { Task { await model.restore() } }
                    }
            } else { WelcomeView(container: container) }
        }
        .overlay {
            if scenePhase != .active {
                ZStack {
                    Color(.systemBackground).ignoresSafeArea()
                    Label("Lexi", systemImage: "lock.fill").font(.largeTitle.bold())
                }
                .accessibilityAddTraits(.isModal)
            }
        }
    }

    @ViewBuilder private func content(_ model: SessionViewModel) -> some View {
        switch model.state {
        case .launching:
            ProgressView("Đang khôi phục phiên…")
        case .signedOut:
            WelcomeView(container: container)
        case .unavailable:
            VStack(spacing: 24) {
                Image(systemName: "wifi.exclamationmark").font(.largeTitle).accessibilityHidden(true)
                Text("Chưa thể mở phiên").font(.title2.bold())
                if let message = model.message { Text(message).multilineTextAlignment(.center) }
                RetrySessionButton(model: model)
                Button("Đăng xuất khỏi thiết bị", role: .destructive) { Task { await model.logout() } }
                    .disabled(model.busy)
            }.padding(24)
        case .authenticated(let me):
            NavigationStack {
                VStack(spacing: 24) {
                    Label("Đã đăng nhập", systemImage: "checkmark.shield.fill").font(.title2.bold())
                    Text(me.email).textSelection(.enabled).privacySensitive()
                    DashboardView()
                    Button("Đăng xuất", role: .destructive) { Task { await model.logout() } }
                        .buttonStyle(.bordered).disabled(model.busy)
                }
                .padding(24).navigationTitle("Lexi")
            }
            .privacySensitive()
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
        Form {
            Section {
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress).textContentType(.username)
                    .textInputAutocapitalization(.never).autocorrectionDisabled()
                    .focused($focus, equals: .email).submitLabel(.next)
                    .onSubmit { focus = .password }
                SecureField("Mật khẩu", text: $password)
                    .textContentType(registering ? .newPassword : .password)
                    .focused($focus, equals: .password).submitLabel(.go)
                    .onSubmit { submit() }
                if registering {
                    Text("Ít nhất 8 ký tự; tối đa 72 byte UTF-8.").font(.footnote).foregroundStyle(.secondary)
                }
            }
            .disabled(model.busy)
            Section {
                if let message = model.message {
                    Text(message).foregroundStyle(.secondary).accessibilityIdentifier("auth-feedback")
                }
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    let waiting = model.retryAfter.map { $0 > context.date } ?? false
                    Button(action: submit) {
                        HStack {
                            Text(registering ? "Tạo tài khoản" : "Đăng nhập")
                            if model.busy { Spacer(); ProgressView() }
                        }
                    }
                    .disabled(model.busy || email.isEmpty || password.isEmpty || waiting)
                    if waiting { Text("Vui lòng chờ trước khi thử lại.").font(.footnote) }
                }
                Button(registering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký") {
                    registering.toggle(); password = ""
                }.disabled(model.busy)
            }
            Section {
                Text("Dùng cùng email và mật khẩu với Lexi trên web.").font(.footnote)
            }
        }
        .navigationTitle(registering ? "Đăng ký" : "Đăng nhập")
        .privacySensitive()
        .onDisappear { password = "" }
    }

    private func submit() {
        guard !model.busy else { return }
        focus = nil
        let submittedPassword = password
        password = ""
        Task { await model.signIn(email: email, password: submittedPassword, register: registering) }
    }
}

private struct RetrySessionButton: View {
    let model: SessionViewModel
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            Button("Thử lại") { Task { await model.restore(force: true) } }
                .buttonStyle(.borderedProminent)
                .disabled(model.busy || (model.retryAfter.map { $0 > context.date } ?? false))
        }
    }
}
#endif

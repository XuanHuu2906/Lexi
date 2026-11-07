#if os(iOS)
import SwiftUI

struct PrivacyDetailsView: View {
    var preferences: PrivacyPreferences?
    var body: some View {
        Form {
            Section("Dữ liệu của bạn") {
                Text("Lexi lưu email, sổ từ, tiến độ ôn tập, cài đặt và nội dung học đã lưu trên tài khoản để bạn dùng giữa các thiết bị.")
                Text("Phiên đăng nhập được giữ trong Keychain. Sổ từ offline và phiên luyện được lưu trên iPhone; đăng xuất sẽ dọn dữ liệu của tài khoản.")
            }
            if let preferences {
                Section("AI văn bản") {
                    Text("Khi bạn đồng ý, từ cần tra, nghĩa, ví dụ, bài viết, hội thoại và ngữ cảnh học liên quan sẽ được gửi qua máy chủ Lexi đến DeepSeek để xử lý. Không nhập mật khẩu hoặc thông tin nhạy cảm vào bài học.")
                    Toggle("Cho phép AI xử lý nội dung học", isOn: Binding(
                        get: { preferences.textAllowed },
                        set: { preferences.allow(.textAI, $0) }))
                    Text("Nếu tắt, bạn vẫn có thể lưu từ thủ công và ôn từ đã có; Lexi không tự bổ sung nội dung bằng AI.")
                }
                Section("Chấm phát âm") {
                    Text("Khi bạn bấm gửi chấm, âm thanh và câu mẫu được gửi qua Lexi đến Microsoft Azure Speech; kết quả nhận dạng và câu mẫu có thể được gửi đến DeepSeek để tạo góp ý. Quyền micro trên iPhone được hỏi riêng.")
                    Toggle("Cho phép gửi bản ghi để chấm", isOn: Binding(
                        get: { preferences.speechAllowed },
                        set: { preferences.allow(.speech, $0) }))
                }
            }
            Section("Quyền lựa chọn") {
                Text("Bạn có thể rút lại các quyền ở đây. Việc tắt áp dụng cho yêu cầu tiếp theo và không thu hồi dữ liệu đã gửi trước đó.")
                Text("Lexi chưa tích hợp quảng cáo hoặc SDK theo dõi trong ứng dụng iOS này.")
                Text("Xóa tài khoản trong Cài đặt sẽ xóa dữ liệu học và phiên đăng nhập trên máy chủ Lexi. Thời hạn bản sao lưu và dữ liệu tại nhà cung cấp phải được công bố trong chính sách trước khi phát hành.")
            }
            Section("Chính sách công khai") {
                if let url = Self.policyURL {
                    Link("Đọc chính sách quyền riêng tư", destination: url)
                } else {
                    Text("Bản phát triển chưa có URL chính sách quyền riêng tư công khai.")
                }
            }
        }
        .navigationTitle("Quyền riêng tư")
        .lexiFormStyle()
    }
    static var policyURL: URL? {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "LexiPrivacyPolicyURL") as? String,
              let url = URL(string: value), url.scheme == "https", url.host != nil else { return nil }
        return url
    }
}

struct ExternalProcessingConsentView: View {
    let preferences: PrivacyPreferences
    let use: ExternalDataUse
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            LexiPage {
                Text(use == .textAI ? "Cho phép AI xử lý nội dung?" : "Cho phép gửi bản ghi?")
                    .font(LexiTypography.title).accessibilityAddTraits(.isHeader)
                Text(use == .textAI
                    ? "Lexi gửi nội dung bạn nhập và ngữ cảnh học liên quan đến DeepSeek để trả lời, sửa bài hoặc bổ sung từ. Nội dung có thể bao gồm thông tin cá nhân nếu bạn nhập vào."
                    : "Lexi gửi âm thanh và câu mẫu đến Microsoft Azure Speech để chấm phát âm. Bản nhận dạng và câu mẫu có thể được gửi đến DeepSeek để tạo góp ý.")
                Text("Bạn có thể thay đổi lựa chọn trong Cài đặt → Quyền riêng tư. Không nhập hoặc đọc thông tin nhạy cảm.")
                NavigationLink("Xem cách Lexi sử dụng dữ liệu") { PrivacyDetailsView() }
                LexiButton(title: "Đồng ý") { preferences.allow(use, true); dismiss() }
                LexiButton(title: "Không đồng ý", variant: .secondary) {
                    preferences.allow(use, false); dismiss()
                }
                Text("Sau khi đồng ý, bấm lại thao tác bạn muốn thực hiện.")
                    .font(LexiTypography.caption)
            }
        }
    }
}

struct DeleteAccountView: View {
    let session: SessionViewModel
    @State private var password = ""
    @State private var confirmed = false
    @State private var finalConfirmation = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Xóa vĩnh viễn") {
                    Text("Thao tác này xóa tài khoản, sổ từ, lịch ôn, kết quả học, hội thoại và cài đặt trên máy chủ Lexi. Mọi phiên đăng nhập sẽ hết hiệu lực. Không thể hoàn tác.")
                    Text("Đăng xuất chỉ dọn dữ liệu trên iPhone; xóa tài khoản sẽ áp dụng cho cả web và các thiết bị khác.")
                }
                Section("Xác nhận") {
                    SecureField("Mật khẩu hiện tại", text: $password)
                        .textContentType(.password).accessibilityLabel("Mật khẩu hiện tại để xóa tài khoản")
                    Toggle("Tôi hiểu tài khoản và dữ liệu sẽ bị xóa", isOn: $confirmed)
                }.disabled(session.busy)
                if let feedback = session.deletionFeedback { Text(feedback.message).foregroundStyle(LexiColors.error) }
                if session.deletionUncertain {
                    Button("Kiểm tra trạng thái tài khoản") { Task { await session.checkDeletionStatus() } }
                        .disabled(session.busy)
                } else {
                    TimelineView(.periodic(from: .now, by: 1)) { context in
                        Button("Xóa tài khoản", role: .destructive) { finalConfirmation = true }
                            .disabled(!confirmed || password.isEmpty || session.busy
                                || session.deletionFeedback?.canRetry(at: context.date) == false)
                    }
                }
                if session.busy { ProgressView("Đang xử lý…") }
            }
            .navigationTitle("Xóa tài khoản")
            .toolbar { ToolbarItem(placement: .cancellationAction) {
                Button("Hủy") { password = ""; dismiss() }.disabled(session.busy)
            } }
            .confirmationDialog("Xóa vĩnh viễn tài khoản Lexi?", isPresented: $finalConfirmation, titleVisibility: .visible) {
                Button("Xóa vĩnh viễn", role: .destructive) {
                    let submitted = password
                    password = ""
                    Task { if await session.deleteAccount(password: submitted, confirmed: confirmed) { dismiss() } }
                }
                Button("Hủy", role: .cancel) {}
            }
            .interactiveDismissDisabled(session.busy)
            .privacySensitive()
            .onDisappear { password = "" }
        }
    }
}
#endif

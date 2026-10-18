#if os(iOS)
import SwiftUI

struct SettingsView: View {
    @Bindable var model: SettingsViewModel
    let session: SessionViewModel
    let email: String
    let changed: () -> Void
    @State private var confirmingLogout = false
    @State private var confirmingReload = false
    @State private var attempt = 0
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Form {
            Section("Tài khoản") { Text(email).textSelection(.enabled) }
            if model.busy { ProgressView("Đang tải cài đặt…") }
            if model.loaded {
                Section("Mục tiêu học") {
                    Stepper("\(model.draft.dailyGoal) từ mỗi ngày", value: $model.draft.dailyGoal, in: 1...500)
                    Picker("Trình độ CEFR", selection: $model.draft.cefrLevel) {
                        ForEach([CEFRLevel.a1, .a2, .b1, .b2, .c1, .c2], id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    TextField("Chủ đề, cách bằng dấu phẩy", text: $model.draft.topics, axis: .vertical).accessibilityLabel("Chủ đề học")
                }.disabled(model.saving || model.busy)
                Section("Nhắc học và giọng đọc") {
                    TextField("Múi giờ IANA", text: $model.draft.timeZone).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .accessibilityLabel("Múi giờ IANA")
                    Text("Ví dụ: Asia/Ho_Chi_Minh. Lexi giữ múi giờ này khi bạn di chuyển.").font(.caption)
                    TextField("Giờ nhắc HH:mm", text: $model.draft.reminderTime).keyboardType(.numbersAndPunctuation)
                        .accessibilityLabel("Giờ nhắc học, HH:mm")
                    Toggle("Bật nhắc học trên tài khoản", isOn: $model.draft.notifyEnabled)
                    Text("Tùy chọn đồng bộ với web. Thông báo trên iPhone sẽ được hỗ trợ trong bản cập nhật sau.").font(.caption)
                    Picker("Giọng đọc", selection: $model.draft.ttsVoice) {
                        Text("Anh Mỹ").tag(TTSVoice.enUS)
                        Text("Anh Anh").tag(TTSVoice.enGB)
                    }
                }.disabled(model.saving || model.busy)
                if let validation = model.draft.validation { Text(validation).foregroundStyle(LexiColors.error) }
                if model.saved && !model.dirty { Label("Đã lưu cài đặt", systemImage: "checkmark.circle") }
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    LexiButton(title: "Lưu cài đặt", isLoading: model.saving,
                               isDisabled: !model.dirty || model.busy || model.draft.validation != nil || model.feedback?.canRetry(at: context.date) == false) {
                        Task { if await model.save() { changed() } }
                    }
                }
            }
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { reload() } }
            Section {
                Button("Tải lại cài đặt từ tài khoản") { reload() }.disabled(model.saving || model.busy)
                Text("Thay đổi được lưu gần nhất trên máy chủ có hiệu lực. Chỉ các trường bạn sửa được gửi khi lưu.").font(.caption)
            }
            Section("Quyền riêng tư") {
                Text("Sổ từ và cài đặt được lưu trên tài khoản Lexi, dùng chung với web. Nội dung tra cứu được gửi tới máy chủ để AI xử lý.")
                Text("Mật khẩu không được lưu trên thiết bị. Đăng xuất xóa phiên đã lưu trên iPhone này.")
                NavigationLink(value: AppRoute.about) { Label("Về Lexi", systemImage: "info.circle") }
            }
            LexiButton(title: "Đăng xuất", variant: .destructive, isLoading: session.busy) { confirmingLogout = true }
        }
        .task(id: attempt) { await model.load() }
        .refreshable { if model.dirty { confirmingReload = true } else { await model.load() } }
        .onChange(of: scenePhase) { _, phase in if phase == .active { attempt += 1 } }
        .confirmationDialog("Bỏ thay đổi chưa lưu và tải lại?", isPresented: $confirmingReload, titleVisibility: .visible) {
            Button("Bỏ thay đổi và tải lại", role: .destructive) { Task { await model.load(discardChanges: true) } }
            Button("Hủy", role: .cancel) {}
        }
        .confirmationDialog("Đăng xuất khỏi Lexi?", isPresented: $confirmingLogout, titleVisibility: .visible) {
            Button("Đăng xuất", role: .destructive) { Task { await session.logout() } }
            Button("Hủy", role: .cancel) {}
        } message: { Text("Dữ liệu đã lưu vẫn được giữ trên tài khoản. Các thay đổi chưa lưu sẽ bị bỏ.") }
    }
    private func reload() { if model.dirty { confirmingReload = true } else { attempt += 1 } }
}
#endif

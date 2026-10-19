#if os(iOS)
import SwiftUI

struct SettingsView: View {
    @Bindable var model: SettingsViewModel
    let session: SessionViewModel
    let email: String
    let userID: String
    let reminders: LocalReminderService
    let offlineCache: OfflineNotebookCache
    let changed: () -> Void
    @State private var confirmingLogout = false
    @State private var confirmingReload = false
    @State private var confirmingDiscard = false
    @State private var attempt = 0
    @AppStorage(SpeechPreferences.speedKey) private var speechSpeed = 0.85
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.openURL) private var openURL

    var body: some View {
        Form {
            Section("Tài khoản") { Text(email).textSelection(.enabled) }
            if model.busy { ProgressView("Đang tải cài đặt…") }
            if model.loaded {
                Section("Mục tiêu học") {
                    Stepper("\(model.draft.dailyGoal) từ mỗi ngày", value: $model.draft.dailyGoal, in: 1...500)
                }.disabled(model.saving || model.busy)
                Section("Trình độ") {
                    Picker("Trình độ CEFR", selection: $model.draft.cefrLevel) {
                        ForEach([CEFRLevel.a1, .a2, .b1, .b2, .c1, .c2], id: \.self) { Text($0.rawValue).tag($0) }
                    }
                }.disabled(model.saving || model.busy)
                Section("Chủ đề") {
                    TextField("Chủ đề, cách bằng dấu phẩy", text: $model.draft.topics, axis: .vertical).accessibilityLabel("Chủ đề học")
                }.disabled(model.saving || model.busy)
                Section("Nhắc học") {
                    TextField("Múi giờ IANA", text: $model.draft.timeZone).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .accessibilityLabel("Múi giờ IANA")
                    Text("Ví dụ: Asia/Ho_Chi_Minh. Lexi giữ múi giờ này khi bạn di chuyển.")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                    DatePicker("Giờ nhắc học", selection: reminderDate, displayedComponents: .hourAndMinute)
                        .environment(\.timeZone, reminderCalendar.timeZone)
                    Toggle("Bật nhắc học trên tài khoản", isOn: $model.draft.notifyEnabled)
                    Text("Giờ nhắc học và múi giờ được lưu cùng tài khoản. iPhone nhắc hàng ngày, không hiển thị số từ đến hạn khi chưa đồng bộ.")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                    if model.baseline?.notifyEnabled == true {
                        if let message = reminders.message {
                            Text(message).font(LexiTypography.caption)
                                .foregroundStyle(LexiColors.textSecondary)
                                .accessibilityIdentifier("local-reminder-status")
                        }
                        if reminders.permission == .authorized || reminders.permission == .provisional {
                            Label("Thông báo cục bộ đã được cấp quyền trên iPhone", systemImage: "checkmark.circle.fill")
                                .font(LexiTypography.caption).foregroundStyle(LexiColors.success)
                        } else {
                            LexiButton(title: "Bật thông báo trên iPhone", variant: .secondary,
                                       isDisabled: model.dirty || model.saving || model.busy) {
                                guard session.navigation.ownerID == userID, let saved = model.baseline else { return }
                                Task { await reminders.requestOnDevice(userID: userID, draft: saved) }
                            }
                        }
                        if reminders.permission == .denied {
                            LexiButton(title: "Mở Cài đặt thông báo iPhone", variant: .secondary) {
                                if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
                            }
                        }
                    }
                }.disabled(model.saving || model.busy)
                Section("Phát âm") {
                    Picker("Giọng đọc", selection: $model.draft.ttsVoice) {
                        Text("Anh Mỹ").tag(TTSVoice.enUS)
                        Text("Anh Anh").tag(TTSVoice.enGB)
                    }
                    Picker("Tốc độ đọc trên iPhone", selection: $speechSpeed) {
                        Text("Chậm").tag(0.6)
                        Text("Vừa").tag(0.85)
                        Text("Nhanh").tag(1.0)
                    }
                    Text("Tốc độ áp dụng ngay trên iPhone này; giọng đọc được lưu cùng cài đặt tài khoản.")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                }.disabled(model.saving || model.busy)
                if let validation = model.draft.validation {
                    Label(validation, systemImage: "exclamationmark.triangle.fill").foregroundStyle(LexiColors.error)
                }
                if model.saved && !model.dirty {
                    FeedbackNotice(message: "Đã lưu cài đặt", symbol: "checkmark.circle.fill", isSuccess: true)
                }
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    LexiButton(title: "Lưu cài đặt", isLoading: model.saving,
                               isDisabled: !model.dirty || model.busy || model.draft.validation != nil || model.feedback?.canRetry(at: context.date) == false) {
                        Task {
                            if await model.save() {
                                guard session.navigation.ownerID == userID else { return }
                                changed()
                                await reminders.reconcile(userID: userID, draft: model.baseline)
                            }
                        }
                    }
                }
                if model.dirty {
                    LexiButton(title: "Hủy thay đổi", variant: .secondary, isDisabled: model.saving || model.busy) {
                        confirmingDiscard = true
                    }
                }
            }
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { reload() } }
            Section {
                Button("Tải lại cài đặt từ tài khoản") { reload() }.disabled(model.saving || model.busy)
                Text("Kéo xuống để cập nhật cài đặt đã lưu trên tài khoản.")
                    .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
            }
            Section("Quyền riêng tư") {
                Text("Sổ từ và cài đặt được lưu trên tài khoản Lexi, dùng chung với web. Nội dung tra cứu được gửi tới máy chủ để AI xử lý.")
                Text("Mật khẩu không được lưu trên thiết bị. Đăng xuất xóa phiên đã lưu trên iPhone này.")
                NavigationLink(value: AppRoute.about) { Label("Về Lexi", systemImage: "info.circle") }
            }
            LexiButton(title: "Đăng xuất", variant: .destructive, isLoading: session.busy) { confirmingLogout = true }
        }
        .lexiFormStyle()
        .task(id: attempt) {
            await model.load()
            if session.navigation.ownerID == userID && model.loaded && !model.dirty {
                await reminders.reconcile(userID: userID, draft: model.baseline)
            }
        }
        .refreshable {
            if model.dirty { confirmingReload = true }
            else {
                await model.load()
                if session.navigation.ownerID == userID && model.loaded {
                    await reminders.reconcile(userID: userID, draft: model.baseline)
                }
            }
        }
        .onChange(of: scenePhase) { _, phase in if phase == .active { attempt += 1 } }
        .confirmationDialog("Bỏ thay đổi chưa lưu và tải lại?", isPresented: $confirmingReload, titleVisibility: .visible) {
            Button("Bỏ thay đổi và tải lại", role: .destructive) { Task {
                await model.load(discardChanges: true)
                if session.navigation.ownerID == userID && model.loaded {
                    await reminders.reconcile(userID: userID, draft: model.baseline)
                }
            } }
            Button("Hủy", role: .cancel) {}
        }
        .confirmationDialog("Bỏ các thay đổi chưa lưu?", isPresented: $confirmingDiscard, titleVisibility: .visible) {
            Button("Bỏ thay đổi", role: .destructive) { model.discardChanges() }
            Button("Tiếp tục chỉnh sửa", role: .cancel) {}
        }
        .confirmationDialog("Đăng xuất khỏi Lexi?", isPresented: $confirmingLogout, titleVisibility: .visible) {
            Button("Đăng xuất", role: .destructive) {
                Task {
                    // Await protected-cache deletion before ending the auth UI;
                    // do not rely only on a later SwiftUI onDisappear callback.
                    await offlineCache.close(clear: true)
                    await session.logout()
                }
            }
            Button("Hủy", role: .cancel) {}
        } message: { Text("Dữ liệu đã lưu vẫn được giữ trên tài khoản. Các thay đổi chưa lưu sẽ bị bỏ.") }
    }
    private func reload() { if model.dirty { confirmingReload = true } else { attempt += 1 } }

    // Treat HH:mm as wall-clock time in the account, independent of device timezone/DST.
    private var reminderCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0)!
        return calendar
    }

    private var reminderDate: Binding<Date> {
        Binding(get: {
            let parts = model.draft.reminderTime.split(separator: ":").compactMap { Int($0) }
            return reminderCalendar.date(from: DateComponents(year: 2001, month: 1, day: 1,
                hour: parts.count == 2 ? parts[0] : 20, minute: parts.count == 2 ? parts[1] : 0))
                ?? Date(timeIntervalSinceReferenceDate: 0)
        }, set: { date in
            let parts = reminderCalendar.dateComponents([.hour, .minute], from: date)
            model.draft.reminderTime = String(format: "%02d:%02d", parts.hour ?? 20, parts.minute ?? 0)
        })
    }
}
#endif

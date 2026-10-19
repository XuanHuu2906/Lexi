#if os(iOS)
import SwiftUI

@MainActor @Observable
final class AudioFeatures {
    let pronunciation: PronunciationViewModel
    let dictation: DictationViewModel
    init(api: LexiAPI) {
        let service = AudioLearningAPI(client: api.client)
        pronunciation = PronunciationViewModel(api: service, permission: MicrophonePermissionService(), recorder: NativeAudioRecorder())
        dictation = DictationViewModel(api: service)
    }
    func suspend() { pronunciation.suspend(); dictation.suspend(); AudioSessionCoordinator.shared.stopAll() }
    func deactivate() { pronunciation.deactivate(); dictation.deactivate(); AudioSessionCoordinator.shared.stopAll() }
}

struct PronunciationView: View {
    @Bindable var model: PronunciationViewModel
    let locale: String
    @State private var speech = StudySpeech()
    @State private var confirmUpload = false
    @Environment(\.openURL) private var openURL

    var body: some View {
        LexiPage {
            LexiCard {
                Text("Đọc rõ, nghe lại, tiến bộ từng chút").font(LexiTypography.title)
                Text("Thu một câu tiếng Anh, tối đa 60 giây. Bản ghi chỉ được gửi khi bạn bấm Gửi chấm phát âm và xác nhận.")
                    .foregroundStyle(LexiColors.textSecondary)
            }
            AITextEditor(title: "Câu mẫu tiếng Anh", text: $model.reference, limit: 1000,
                         disabled: model.phase == .recording || model.phase == .requestingPermission || model.request.busy)
            if model.phase != .recording && model.phase != .requestingPermission && !model.request.busy {
                StudyAudioButton(term: model.reference, locale: locale, speech: speech)
            }
            if model.phase == .requestingPermission { LoadingState(title: "Đang chờ quyền Micro…") }
            if model.phase == .recording {
                LexiCard {
                    Label("Đang ghi âm", systemImage: "mic.fill").foregroundStyle(LexiColors.error)
                    Text("\(Int(model.recorder.elapsed)) / 60 giây").monospacedDigit().font(LexiTypography.title)
                    LexiButton(title: "Dừng ghi âm", variant: .destructive) { model.stop() }
                }
            } else {
                LexiButton(title: model.clip == nil ? "Ghi âm" : "Ghi lại", isDisabled: !model.canRecord) {
                    speech.stop(); Task { await model.record() }
                }
            }
            if let notice = model.notice { FeedbackNotice(message: notice, symbol: "mic.badge.xmark") }
            if model.permissionDenied {
                LexiButton(title: "Mở Cài đặt Micro", variant: .secondary) {
                    if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
                }
            }
            if let clip = model.clip {
                LexiCard {
                    Text("Bản ghi của bạn").font(LexiTypography.heading)
                    Text("\(clip.info.duration.formatted(.number.precision(.fractionLength(1)))) giây · Sẵn sàng nghe lại")
                    LexiButton(title: "Nghe bản ghi", variant: .secondary, isDisabled: model.request.busy) { speech.stop(); model.play() }
                    LexiButton(title: "Dừng nghe", variant: .secondary) { model.recorder.stopPlayback() }
                    LexiButton(title: "Xóa bản ghi", variant: .destructive, isDisabled: model.request.busy) { model.clearClip() }
                    if model.reference.trimmed != model.recordedReference {
                        FeedbackNotice(message: "Bạn đã đổi câu mẫu. Hãy ghi lại câu mới trước khi gửi.")
                    }
                    AIActionButton(title: "Gửi chấm phát âm", request: model.request, disabled: !model.canSubmit) { confirmUpload = true }
                }
            }
            AIRequestFeedback(request: model.request)
            if let result = model.result {
                LexiCard {
                    Text("Điểm phát âm: \(result.score.formatted())/100").font(LexiTypography.title)
                    BadgeChip(title: "Đánh giá từ bản ghi âm", symbol: "waveform")
                    Text("Câu đã đọc: \(model.recordedReference)").textSelection(.enabled)
                    Text("Nghe được: \(result.transcriptHeard)").textSelection(.enabled)
                    if !result.mispronounced.isEmpty {
                        Text("Cần luyện thêm: \(result.mispronounced.joined(separator: ", "))")
                    }
                    Text(result.feedback).textSelection(.enabled)
                }
            }
            Text("Bản ghi tạm được xóa khi rời màn, chuyển nền hoặc đăng xuất. Chấm âm thanh dùng Azure qua máy chủ Lexi; không tự chuyển sang chấm văn bản khi lỗi.")
                .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
            AIDisclaimer()
        }
        .navigationTitle("Luyện phát âm")
        .confirmationDialog("Gửi bản ghi để chấm phát âm?", isPresented: $confirmUpload, titleVisibility: .visible) {
            Button("Đồng ý gửi bản ghi") { speech.stop(); Task { await model.submit() } }
            Button("Giữ trên máy", role: .cancel) {}
        } message: {
            Text("Âm thanh và câu mẫu được gửi tới máy chủ Lexi, Azure Speech để chấm và dịch vụ AI để tạo góp ý. Chỉ gửi nội dung bạn đồng ý chia sẻ.")
        }
        .onDisappear { speech.stop(); model.suspend() }
    }
}

struct DictationView: View {
    @Bindable var model: DictationViewModel
    let locale: String
    @State private var speech = StudySpeech()
    @State private var confirmNew = false
    var body: some View {
        LexiPage {
            LexiCard {
                Text("Nghe và viết lại").font(LexiTypography.title)
                Text("Nghe câu tiếng Anh rồi gõ lại. Đáp án sẽ hiện sau khi gửi bài và nhận góp ý.")
                Picker("Trình độ", selection: $model.level) {
                    ForEach([CEFRLevel.a1, .a2, .b1, .b2, .c1, .c2], id: \.self) { Text($0.rawValue).tag($0) }
                }.disabled(model.request.busy)
                Stepper("\(model.count) câu mỗi lượt", value: $model.count, in: 1...20).disabled(model.request.busy)
                AIActionButton(title: "Tạo bài nghe", request: model.request) {
                    if model.sentences.isEmpty || model.completed { speech.stop(); Task { await model.generate() } }
                    else { confirmNew = true }
                }
            }
            AIRequestFeedback(request: model.request)
            if let sentence = model.current {
                ProgressBar(value: Double(model.index), total: Double(model.sentences.count), label: "Câu \(model.index + 1)/\(model.sentences.count)")
                LexiCard {
                    LexiButton(title: speech.isSpeaking ? "Dừng đọc" : "Nghe câu", variant: .secondary) {
                        if speech.isSpeaking { speech.stop() } else { speech.speak(sentence, locale: locale) }
                    }.accessibilityLabel(speech.isSpeaking ? "Dừng đọc" : "Nghe câu tiếng Anh")
                    LexiButton(title: "Nghe chậm", variant: .secondary) { speech.speak(sentence, locale: locale, slow: true) }
                    if let notice = speech.notice { Text(notice).font(LexiTypography.caption) }
                }
                if let attempt = model.submittedAttempt {
                    LexiCard {
                        Text("Đáp án: \(sentence)").font(LexiTypography.bodyEmphasis).textSelection(.enabled)
                        Text("Bạn đã viết: \(attempt)").textSelection(.enabled)
                        if let feedback = model.feedback { Text(feedback).textSelection(.enabled) }
                    }
                    LexiButton(title: "Câu tiếp theo") { speech.stop(); model.next() }
                } else {
                    AITextEditor(title: "Câu bạn nghe được", text: $model.draft, limit: 500, disabled: model.request.busy)
                    AIActionButton(title: "Kiểm tra câu trả lời", request: model.request, disabled: !model.draft.trimmed.validAIInput(limit: 500)) {
                        speech.stop(); Task { await model.submit() }
                    }
                }
            } else if model.completed {
                EmptyState(title: "Đã hoàn thành bài nghe!", message: "Bạn đã luyện \(model.sentences.count) câu. Tạo bài mới khi sẵn sàng.", symbol: "ear.badge.checkmark")
            }
            AIDisclaimer()
        }
        .navigationTitle("Nghe chép chính tả")
        .confirmationDialog("Tạo bài mới và bỏ lượt đang làm?", isPresented: $confirmNew, titleVisibility: .visible) {
            Button("Tạo bài mới", role: .destructive) { speech.stop(); Task { await model.generate() } }
            Button("Tiếp tục bài hiện tại", role: .cancel) {}
        }
        .onDisappear { speech.stop(); model.suspend() }
    }
}
#endif

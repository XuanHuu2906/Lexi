#if os(iOS)
import SwiftUI
import AVFoundation

@MainActor @Observable
final class StudySpeech: NSObject, SpeechSynthesizing, AVSpeechSynthesizerDelegate {
    private let synthesizer = AVSpeechSynthesizer()
    private let owner = UUID()
    private var utterance: AVSpeechUtterance?
    private(set) var isSpeaking = false
    private(set) var currentText = ""
    private(set) var notice: String?
    override init() { super.init(); synthesizer.delegate = self }
    func speak(_ text: String, locale: String, slow: Bool = false) {
        stop(); notice = nil
        guard !text.trimmed.isEmpty else { return }
        let preferred = AVSpeechSynthesisVoice(language: locale)
        guard let voice = preferred ?? AVSpeechSynthesisVoice.speechVoices().first(where: { $0.language.hasPrefix("en-") }) else {
            notice = "iPhone chưa có giọng đọc tiếng Anh. Kiểm tra giọng đọc trong Cài đặt Trợ năng."; return
        }
        do { try AudioSessionCoordinator.shared.activate(owner: owner, recording: false) { [weak self] in self?.stop() } }
        catch { notice = AudioFailure.unavailable.message; return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = voice
        let saved = UserDefaults.standard.object(forKey: SpeechPreferences.speedKey) as? Double ?? 0.85
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * Float(slow ? 0.6 : SpeechPreferences.multiplier(saved))
        self.utterance = utterance; currentText = text; isSpeaking = true
        if preferred == nil { notice = "Đang dùng giọng tiếng Anh có sẵn trên iPhone." }
        synthesizer.speak(utterance)
    }
    func stop() {
        utterance = nil; synthesizer.stopSpeaking(at: .immediate)
        isSpeaking = false; currentText = ""
        AudioSessionCoordinator.shared.release(owner: owner)
    }
    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        let id = ObjectIdentifier(utterance)
        Task { @MainActor [weak self] in
            guard let self, let current = self.utterance, ObjectIdentifier(current) == id else { return }; self.stop()
        }
    }
    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        let id = ObjectIdentifier(utterance)
        Task { @MainActor [weak self] in
            guard let self, let current = self.utterance, ObjectIdentifier(current) == id else { return }; self.stop()
        }
    }
}

struct StudyAudioButton: View {
    let term: String
    let locale: String
    let speech: StudySpeech
    var body: some View {
        VStack(alignment: .leading) {
            Button {
                if speech.isSpeaking && speech.currentText == term { speech.stop() }
                else { speech.speak(term, locale: locale) }
            } label: {
                Label(speech.isSpeaking && speech.currentText == term ? "Dừng đọc" : "Nghe phát âm",
                      systemImage: speech.isSpeaking && speech.currentText == term ? "stop.fill" : "speaker.wave.2.fill")
            }
            .buttonStyle(LexiButtonStyle(variant: .secondary))
            .accessibilityLabel(speech.isSpeaking && speech.currentText == term ? "Dừng đọc" : "Nghe phát âm tiếng Anh")
            if let notice = speech.notice { Text(notice).font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary) }
        }
    }
}

struct QuizOptionRow: View {
    let text: String
    let selected: Bool
    var correctness: Bool? = nil
    let action: () -> Void
    private var symbol: String {
        if let correctness { return correctness ? "checkmark.circle.fill" : "xmark.circle.fill" }
        return selected ? "largecircle.fill.circle" : "circle"
    }
    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: LexiSpacing.md) {
                Image(systemName: symbol).accessibilityHidden(true)
                Text(text).fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .font(LexiTypography.bodyEmphasis)
            .foregroundStyle(correctness == false ? LexiColors.error : LexiColors.ink900)
            .padding(LexiSpacing.lg)
            .frame(maxWidth: .infinity, minHeight: LexiSpacing.minHitTarget, alignment: .leading)
            .background(selected ? LexiColors.brandSoft : LexiColors.surface,
                        in: RoundedRectangle(cornerRadius: LexiRadii.input))
            .overlay(RoundedRectangle(cornerRadius: LexiRadii.input)
                .strokeBorder(selected ? LexiColors.grape600 : LexiColors.border, lineWidth: selected ? 2 : 1))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(selected ? [.isSelected] : [])
        .accessibilityValue(correctness.map { $0 ? "Đáp án đúng" : "Chưa đúng" } ?? "")
    }
}

struct ReviewRatingBar: View {
    let disabled: Bool
    let action: (ReviewRating) -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: LexiSpacing.md) {
            Text("Bạn nhớ từ này đến đâu?").font(LexiTypography.heading)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 120))], spacing: LexiSpacing.md) {
                ForEach(ReviewRating.allCases, id: \.rawValue) { rating in
                    LexiButton(title: rating.title, variant: rating == .forgot ? .destructive : .secondary,
                               isDisabled: disabled) { action(rating) }
                }
            }
            Text("Quên: học lại · Khó: cần luyện thêm · Nhớ: nhớ được · Dễ: nhớ ngay. Lexi sẽ điều chỉnh lịch ôn.")
                .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
        }
    }
}
#endif

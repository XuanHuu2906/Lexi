import Foundation
import Observation

@MainActor protocol MicrophonePermissionProviding {
    func request() async -> Bool
}
@MainActor protocol AudioRecording: AnyObject {
    var elapsed: TimeInterval { get }
    var onFinish: ((Result<AudioClip, AudioFailure>) -> Void)? { get set }
    func start() throws
    func stop()
    func discard()
    func play(_ clip: AudioClip) throws
    func stopPlayback()
}

@MainActor protocol SpeechSynthesizing {
    func speak(_ text: String, locale: String, slow: Bool)
    func stop()
}

enum SpeechPreferences {
    static let speedKey = "lexi.tts.speed"
    static func multiplier(_ value: Double) -> Double { value.isFinite && (0.5...1.2).contains(value) ? value : 0.85 }
}

@MainActor @Observable
final class PronunciationViewModel {
    enum Phase { case idle, requestingPermission, recording, ready }
    var reference = "I would like a cup of tea."
    private(set) var phase: Phase = .idle
    private(set) var clip: AudioClip?
    private(set) var recordedReference = ""
    private(set) var result: PronunciationResult?
    private(set) var notice: String?
    private(set) var permissionDenied = false
    let request = AIRequestGate()
    private let api: any AudioLearningServing
    private let permission: any MicrophonePermissionProviding
    let recorder: any AudioRecording
    private var operation = UUID()
    private var active = true
    var canRecord: Bool { active && phase != .requestingPermission && phase != .recording && !request.busy }
    var canSubmit: Bool { active && phase == .ready && clip != nil && reference.trimmed == recordedReference && request.canStart }

    init(api: any AudioLearningServing, permission: any MicrophonePermissionProviding, recorder: any AudioRecording) {
        self.api = api; self.permission = permission; self.recorder = recorder
        recorder.onFinish = { [weak self] outcome in self?.finished(outcome) }
    }
    func record() async {
        guard canRecord else { return }
        guard reference.trimmed.validAIInput(limit: 1000) else { notice = "Nhập câu mẫu từ 1 đến 1.000 ký tự."; return }
        let id = UUID(); operation = id
        phase = .requestingPermission; notice = nil; permissionDenied = false
        defer { if operation == id, phase == .requestingPermission { phase = clip == nil ? .idle : .ready } }
        let allowed = await permission.request()
        guard active, operation == id, !Task.isCancelled else { return }
        guard allowed else { phase = clip == nil ? .idle : .ready; permissionDenied = true; notice = AudioFailure.permissionDenied.message; return }
        clearClip()
        recordedReference = reference.trimmed
        do { try recorder.start(); phase = .recording }
        catch { phase = .idle; notice = (error as? AudioFailure ?? .unavailable).message }
    }
    func stop() { guard phase == .recording else { return }; recorder.stop() }
    private func finished(_ outcome: Result<AudioClip, AudioFailure>) {
        guard active, phase == .recording else {
            if case .success(let clip) = outcome { AudioTemporaryFiles.remove(clip.file) }; return
        }
        switch outcome {
        case .success(let clip): self.clip = clip; phase = .ready; notice = nil
        case .failure(let error): phase = .idle; notice = error.message
        }
    }
    func play() {
        guard !request.busy, phase == .ready, let clip else { return }
        do { try recorder.play(clip) } catch { notice = AudioFailure.unavailable.message }
    }
    func submit() async {
        guard canSubmit, let clip else { return }
        recorder.stopPlayback(); result = nil; notice = nil
        let reference = recordedReference
        let value = await request.run(.pronunciation, work: { [api] in try await api.score(reference: reference, audio: clip.file) })
        guard active else { return }
        // AIRequestGate owns upload error feedback (HTTP category, no raw payload).
        // 'notice' is reserved for local recording/permission errors to avoid two
        // conflicting banners for the same failed request.
        if let value { result = value }
    }
    func clearClip() {
        recorder.discard(); recorder.stopPlayback()
        AudioTemporaryFiles.remove(clip?.file); clip = nil; result = nil; recordedReference = ""; phase = .idle
    }
    func suspend() {
        operation = UUID()
        let wasRecording = phase == .recording || phase == .requestingPermission
        request.cancel(); clearClip()
        if wasRecording { notice = AudioFailure.interrupted.message }
    }
    func deactivate() { suspend(); active = false; request.deactivate(); reference = ""; notice = nil }
}

@MainActor @Observable
final class DictationViewModel {
    var level: CEFRLevel = .b1
    var count = 5
    var draft = ""
    private(set) var sentences: [String] = []
    private(set) var index = 0
    private(set) var submittedAttempt: String?
    private(set) var feedback: String?
    let request = AIRequestGate()
    private let api: any AudioLearningServing
    var current: String? { sentences.indices.contains(index) ? sentences[index] : nil }
    var completed: Bool { !sentences.isEmpty && index >= sentences.count }
    init(api: any AudioLearningServing) { self.api = api }
    func generate() async {
        guard request.canStart else { return }
        let level = level, count = count
        guard (1...20).contains(count) else { request.validation("Chọn từ 1 đến 20 câu."); return }
        guard let value = await request.run(.dictationGenerate, work: { [api] in try await api.generateDictation(level: level, count: count) }) else { return }
        sentences = value.sentences; index = 0; draft = ""; submittedAttempt = nil; feedback = nil
    }
    func submit() async {
        guard request.canStart, submittedAttempt == nil, let reference = current else { return }
        let attempt = draft.trimmed
        guard attempt.validAIInput(limit: 500) else { request.validation("Nhập câu bạn nghe được, tối đa 500 ký tự."); return }
        guard let value = await request.run(.dictationExplain, work: { [api] in try await api.explainDictation(reference: reference, attempt: attempt) }) else { return }
        submittedAttempt = attempt; feedback = value.feedback
    }
    func next() {
        guard !request.busy, submittedAttempt != nil else { return }
        index += 1; draft = ""; submittedAttempt = nil; feedback = nil
    }
    func suspend() { request.cancel() }
    func deactivate() { request.deactivate(); sentences = []; draft = ""; submittedAttempt = nil; feedback = nil }
}

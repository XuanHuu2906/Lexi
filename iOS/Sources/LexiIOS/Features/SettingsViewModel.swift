import Foundation
import Observation

protocol ProfileServing: Sendable {
    func settings() async throws -> Settings?
    func update(_ input: SettingsUpdate) async throws -> Settings
}
struct ProfileRepository: ProfileServing {
    let api: LexiAPI
    func settings() async throws -> Settings? { try await api.auth.me().setting }
    func update(_ input: SettingsUpdate) async throws -> Settings { try await api.settings.update(input) }
}

struct SettingsDraft: Equatable {
    // Explicit form defaults for a null setting; never silently substitute device timezone.
    var dailyGoal = 10
    var cefrLevel: CEFRLevel = .b1
    var topics = ""
    var reminderTime = "20:00"
    var timeZone = ""
    var notifyEnabled = false
    var ttsVoice: TTSVoice = .enUS

    init(_ settings: Settings? = nil) {
        guard let settings else { return }
        dailyGoal = settings.dailyGoal; cefrLevel = settings.cefrLevel
        topics = settings.topics.joined(separator: ", "); reminderTime = settings.reminderTime
        timeZone = settings.timeZone; notifyEnabled = settings.notifyEnabled; ttsVoice = settings.ttsVoice
    }

    var validation: String? {
        if !(1...500).contains(dailyGoal) { return "Mục tiêu cần từ 1 đến 500 từ mỗi ngày." }
        if reminderTime.range(of: #"^([01]\d|2[0-3]):[0-5]\d$"#, options: .regularExpression) == nil {
            return "Giờ nhắc học cần có dạng HH:mm, ví dụ 20:00."
        }
        if timeZone.isEmpty || TimeZone(identifier: timeZone) == nil {
            return "Nhập múi giờ IANA hợp lệ, ví dụ Asia/Ho_Chi_Minh."
        }
        return nil
    }

    func update(comparedTo baseline: SettingsDraft?) -> SettingsUpdate {
        SettingsUpdate(dailyGoal: baseline?.dailyGoal == dailyGoal ? nil : dailyGoal,
            cefrLevel: baseline?.cefrLevel == cefrLevel ? nil : cefrLevel,
            topics: baseline?.topics == topics ? nil : topics.commaSeparated,
            reminderTime: baseline?.reminderTime == reminderTime ? nil : reminderTime,
            timeZone: baseline?.timeZone == timeZone ? nil : timeZone,
            notifyEnabled: baseline?.notifyEnabled == notifyEnabled ? nil : notifyEnabled,
            ttsVoice: baseline?.ttsVoice == ttsVoice ? nil : ttsVoice)
    }
}

@MainActor @Observable
final class SettingsViewModel {
    var draft = SettingsDraft()
    private(set) var baseline: SettingsDraft?
    private(set) var loaded = false
    private(set) var busy = false
    private(set) var saving = false
    private(set) var saved = false
    private(set) var feedback: FeatureFeedback?
    var dirty: Bool { loaded && draft != baseline }
    private let api: any ProfileServing
    init(api: any ProfileServing) { self.api = api }

    func discardChanges() {
        guard loaded, !busy, !saving else { return }
        draft = baseline ?? SettingsDraft()
        saved = false
        // Discarding a draft must not bypass a server-issued retry cooldown.
        if feedback?.retryAt == nil { feedback = nil }
    }

    func load(discardChanges: Bool = false) async {
        guard !busy, !saving, (!dirty || discardChanges), feedback?.canRetry() != false else { return }
        busy = true; feedback = nil; defer { busy = false }
        do {
            let value = try await api.settings(); try Task.checkCancellation()
            baseline = value.map(SettingsDraft.init); draft = SettingsDraft(value); loaded = true; saved = false
        } catch { if !isCancellation(error) { feedback = FeatureFeedback(error) } }
    }

    func save() async -> Bool {
        guard loaded, !busy, !saving, dirty, feedback?.canRetry() != false else { return false }
        if let error = draft.validation { feedback = FeatureFeedback(message: error); return false }
        let submitted = draft
        saving = true; feedback = nil; saved = false; defer { saving = false }
        do {
            let value = try await api.update(submitted.update(comparedTo: baseline))
            baseline = SettingsDraft(value)
            if draft == submitted { draft = SettingsDraft(value) }
            saved = true; return true
        } catch { feedback = FeatureFeedback(error, mutation: true); return false }
    }
}

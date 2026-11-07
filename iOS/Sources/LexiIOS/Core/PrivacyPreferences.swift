import Foundation
import Observation

enum ExternalDataUse: String, Identifiable, Sendable {
    case textAI, speech
    var id: String { rawValue }
}
enum PrivacyError: Error, Equatable, Sendable { case consentRequired, featureDisabled }

@MainActor @Observable
final class PrivacyPreferences {
    static let noticeVersion = 1
    private let defaults: UserDefaults
    private let origin: String
    private(set) var ownerID: String?
    private(set) var textAllowed = false
    private(set) var speechAllowed = false
    var requested: ExternalDataUse?
    let aiEnabled: Bool
    let audioEnabled: Bool

    init(origin: String, defaults: UserDefaults = .standard,
         aiEnabled: Bool = true, audioEnabled: Bool = true) {
        self.origin = origin; self.defaults = defaults
        self.aiEnabled = aiEnabled; self.audioEnabled = audioEnabled
        activate(userID: nil)
    }

    private func key(_ owner: String?) -> String {
        "lexi.privacy.v\(Self.noticeVersion)." + Data((origin + "|" + (owner ?? "guest")).utf8).base64EncodedString()
    }

    func activate(userID: String?) {
        ownerID = userID; requested = nil
        let grants = defaults.stringArray(forKey: key(userID)) ?? []
        textAllowed = grants.contains(ExternalDataUse.textAI.rawValue)
        speechAllowed = grants.contains(ExternalDataUse.speech.rawValue)
    }

    func allow(_ use: ExternalDataUse, _ allowed: Bool) {
        if use == .textAI { textAllowed = allowed } else { speechAllowed = allowed }
        var values: [String] = []
        if textAllowed { values.append(ExternalDataUse.textAI.rawValue) }
        if speechAllowed { values.append(ExternalDataUse.speech.rawValue) }
        defaults.set(values, forKey: key(ownerID))
        requested = nil
    }

    func clear(userID: String?) {
        defaults.removeObject(forKey: key(userID))
        if ownerID == userID { textAllowed = false; speechAllowed = false; requested = nil }
    }

    var canEnrichWords: Bool { aiEnabled && textAllowed }

    func authorize(_ use: ExternalDataUse) throws {
        guard aiEnabled, use != .speech || audioEnabled else { throw PrivacyError.featureDisabled }
        let allowed = use == .textAI ? textAllowed : speechAllowed
        guard allowed else {
            requested = use
            throw PrivacyError.consentRequired
        }
    }
}

import Foundation

/// Recurring reminder = account wall-clock HH:mm in its IANA timezone.
/// No due count, vocabulary or account identifier is included in the notification.
struct LocalReminderPlan: Equatable, Sendable {
    static let requestID = "lexi.review.daily.v1"
    let hour: Int
    let minute: Int
    let timeZoneID: String

    init?(draft: SettingsDraft) {
        guard draft.notifyEnabled, draft.validation == nil,
              let zone = TimeZone(identifier: draft.timeZone) else { return nil }
        let parts = draft.reminderTime.split(separator: ":")
        guard parts.count == 2, let h = Int(parts[0]), let m = Int(parts[1]),
              (0...23).contains(h), (0...59).contains(m) else { return nil }
        hour = h
        minute = m
        timeZoneID = zone.identifier
    }

    var dateComponents: DateComponents {
        var components = DateComponents()
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: timeZoneID) ?? .gmt
        components.calendar = calendar
        components.timeZone = calendar.timeZone
        components.hour = hour
        components.minute = minute
        return components
    }

    /// Used only for deterministic calendar/DST unit tests; iOS owns real delivery.
    func nextOccurrence(after date: Date) -> Date? {
        var calendar = Calendar(identifier: .gregorian)
        guard let zone = TimeZone(identifier: timeZoneID) else { return nil }
        calendar.timeZone = zone
        return calendar.nextDate(after: date, matching: DateComponents(hour: hour, minute: minute),
                                 matchingPolicy: .nextTime, repeatedTimePolicy: .first,
                                 direction: .forward)
    }
}

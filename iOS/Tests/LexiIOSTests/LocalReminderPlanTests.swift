import Foundation
import Testing
@testable import LexiIOS

struct LocalReminderPlanTests {
    private func draft(time: String = "20:00", zone: String = "Asia/Ho_Chi_Minh",
                       enabled: Bool = true) -> SettingsDraft {
        var value = SettingsDraft()
        value.timeZone = zone
        value.reminderTime = time
        value.notifyEnabled = enabled
        return value
    }

    @Test func localRemindersRequireAnExplicitSavedAccountPreference() {
        #expect(LocalReminderPlan(draft: draft(enabled: false)) == nil)
        #expect(LocalReminderPlan(draft: draft(zone: "Not/A_Zone")) == nil)
        #expect(LocalReminderPlan(draft: draft(time: "25:80")) == nil)
        #expect(LocalReminderPlan(draft: draft(time: "8:00")) == nil)
        #expect(LocalReminderPlan(draft: draft(time: "00:00")) != nil)
        #expect(LocalReminderPlan(draft: draft(time: "23:59")) != nil)
    }

    @Test func planKeepsAccountWallClockAndNeverInfersDueCounts() throws {
        let plan = try #require(LocalReminderPlan(draft: draft()))
        #expect(plan.hour == 20 && plan.minute == 0)
        #expect(plan.timeZoneID == "Asia/Ho_Chi_Minh")
        #expect(plan.dateComponents.timeZone?.identifier == "Asia/Ho_Chi_Minh")
        #expect(plan.dateComponents.calendar?.identifier == .gregorian)
        let formatter = ISO8601DateFormatter()
        let before = try #require(formatter.date(from: "2026-10-19T10:00:00Z"))
        #expect(plan.nextOccurrence(after: before) ==
                formatter.date(from: "2026-10-19T13:00:00Z"))
    }

    @Test func NewYorkReminderKeeps8AMAcrossDSTSpringAndFall() throws {
        let plan = try #require(LocalReminderPlan(
            draft: draft(time: "08:00", zone: "America/New_York")))
        let formatter = ISO8601DateFormatter()
        let beforeSpring = try #require(formatter.date(from: "2026-03-07T16:00:00Z"))
        let afterSpring = try #require(formatter.date(from: "2026-03-08T12:00:00Z"))
        #expect(plan.nextOccurrence(after: beforeSpring) == afterSpring)

        let beforeFall = try #require(formatter.date(from: "2026-11-01T01:00:00Z"))
        let afterFall = try #require(formatter.date(from: "2026-11-01T13:00:00Z"))
        #expect(plan.nextOccurrence(after: beforeFall) == afterFall)
    }
}

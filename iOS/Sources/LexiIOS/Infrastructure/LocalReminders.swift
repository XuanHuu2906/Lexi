#if os(iOS)
import Foundation
import Observation
import UserNotifications

enum LocalReminderPermission: String {
    case unknown, notDetermined, denied, authorized, provisional
}

/// One queue for every add/remove operation. A logout queued after a pending add
/// always removes the old reminder, even if UNUserNotificationCenter was slow.
@MainActor @Observable
final class LocalReminderService {
    static let shared = LocalReminderService()
    private let center = UNUserNotificationCenter.current()
    private var pending: Task<Void, Never>?
    private var generation = UUID()
    private var ownerID: String?
    private(set) var permission: LocalReminderPermission = .unknown
    private(set) var message: String?

    private init() {}

    func reconcile(userID: String, draft: SettingsDraft?) async {
        let ticket = UUID()
        generation = ticket
        ownerID = userID
        await enqueue { [self] in
            guard generation == ticket, ownerID == userID else { return }
            guard let draft, let plan = LocalReminderPlan(draft: draft) else {
                center.removePendingNotificationRequests(withIdentifiers: [LocalReminderPlan.requestID])
                message = nil
                return
            }
            let system = await center.notificationSettings()
            guard generation == ticket, ownerID == userID else { return }
            permission = Self.map(system.authorizationStatus)
            if permission == .authorized || permission == .provisional {
                let content = UNMutableNotificationContent()
                content.title = "Lexi nhắc học"
                content.body = "Đến giờ dành vài phút ôn tập tiếng Anh nhé."
                content.sound = .default
                content.userInfo = ["lexiDestination": "review"]
                let trigger = UNCalendarNotificationTrigger(dateMatching: plan.dateComponents, repeats: true)
                let request = UNNotificationRequest(identifier: LocalReminderPlan.requestID,
                                                    content: content, trigger: trigger)
                // Add/replace one daily schedule. Never insert duplicate requests.
                do {
                    try await center.add(request)
                    if generation == ticket && ownerID == userID {
                        message = permission == .provisional
                            ? "Thông báo tạm thời được iOS gửi âm thầm. Bạn có thể thay đổi trong Cài đặt iPhone."
                            : "Đã lập lịch nhắc học trên iPhone này."
                    }
                } catch {
                    if generation == ticket && ownerID == userID {
                        message = "Không thể lập lịch nhắc học trên iPhone. Thử lại trong Cài đặt."
                    }
                }
            } else {
                center.removePendingNotificationRequests(withIdentifiers: [LocalReminderPlan.requestID])
                message = permission == .denied
                    ? "iPhone đã từ chối thông báo. Hãy cấp quyền cho Lexi trong Cài đặt iPhone."
                    : "Chưa bật thông báo trên iPhone này. Bấm nút bên dưới để cấp quyền."
            }
        }
    }

    /// Only a direct tap on Settings' explicit enable button calls this.
    func requestOnDevice(userID: String, draft: SettingsDraft) async {
        guard LocalReminderPlan(draft: draft) != nil else {
            message = "Hãy lưu lựa chọn nhắc học và múi giờ hợp lệ trước khi bật trên iPhone."
            return
        }
        guard ownerID == userID else { return }
        let ticket = generation
        do {
            _ = try await center.requestAuthorization(options: [.alert, .sound])
        } catch {
            if generation == ticket && ownerID == userID {
                message = "Không thể yêu cầu quyền thông báo. Hãy thử lại trong Cài đặt iPhone."
            }
            return
        }
        guard generation == ticket && ownerID == userID else { return }
        await reconcile(userID: userID, draft: draft)
    }

    func deactivate() async {
        generation = UUID()
        ownerID = nil
        await enqueue { [self] in
            center.removePendingNotificationRequests(withIdentifiers: [LocalReminderPlan.requestID])
            permission = .unknown
            message = nil
        }
    }

    private func enqueue(_ work: @escaping @MainActor () async -> Void) async {
        let previous = pending
        let task = Task { await previous?.value; await work() }
        pending = task
        await task.value
    }

    private static func map(_ value: UNAuthorizationStatus) -> LocalReminderPermission {
        switch value {
        case .authorized: .authorized
        case .provisional, .ephemeral: .provisional
        case .denied: .denied
        default: .notDetermined
        }
    }
}

/// The notification tap may arrive before authentication; keep only an in-memory
/// destination, never route to private data without an authenticated navigation.
@MainActor @Observable
final class ReminderTapRouter {
    static let shared = ReminderTapRouter()
    private(set) var pendingReview = false

    func queueReview() { pendingReview = true }

    func routeIfPossible(_ navigation: AppNavigation) {
        guard pendingReview, navigation.ownerID != nil else { return }
        pendingReview = false
        navigation.paths[.review] = []
        navigation.selectedTab = .review
    }
}

final class ReminderNotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = ReminderNotificationDelegate()
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        if response.notification.request.identifier == LocalReminderPlan.requestID,
           response.notification.request.content.userInfo["lexiDestination"] as? String == "review" {
            Task { @MainActor in ReminderTapRouter.shared.queueReview() }
        }
        completionHandler()
    }
}
#endif

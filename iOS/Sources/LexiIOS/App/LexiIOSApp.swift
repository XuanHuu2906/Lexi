#if os(iOS)
import SwiftUI
import UserNotifications

@main
struct LexiIOSApp: App {
    private let container = AppContainer.live()
    init() {
        AudioTemporaryFiles.clearAbandoned()
        // Register before launch handling so cold-start notification taps are not lost.
        UNUserNotificationCenter.current().delegate = ReminderNotificationDelegate.shared
    }
    var body: some Scene {
        WindowGroup {
            SessionRootView(container: container)
                .tint(LexiColors.grape600)
                .foregroundStyle(LexiColors.ink900)
                .preferredColorScheme(.light)
        }
    }
}
#endif

#if os(iOS)
import SwiftUI

@main
struct LexiIOSApp: App {
    private let container = AppContainer.live()
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

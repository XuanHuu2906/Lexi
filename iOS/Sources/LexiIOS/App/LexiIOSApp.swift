#if os(iOS)
import SwiftUI

@main
struct LexiIOSApp: App {
    private let container = AppContainer.live()
    var body: some Scene {
        WindowGroup { SessionRootView(container: container) }
    }
}
#endif

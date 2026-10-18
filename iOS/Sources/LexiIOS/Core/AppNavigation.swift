import Foundation
import Observation

enum MainTab: String, CaseIterable, Hashable, Sendable {
    case home, vocabulary, review, learn, settings

    var title: String {
        switch self {
        case .home: "Trang chủ"
        case .vocabulary: "Từ vựng"
        case .review: "Ôn tập"
        case .learn: "Học"
        case .settings: "Cài đặt"
        }
    }

    var symbol: String {
        switch self {
        case .home: "house.fill"
        case .vocabulary: "books.vertical.fill"
        case .review: "rectangle.on.rectangle.angled"
        case .learn: "bubble.left.and.bubble.right.fill"
        case .settings: "gearshape.fill"
        }
    }
}

// IDs only: never put a profile, token, or word payload in navigation history.
enum AppRoute: Hashable, Sendable {
    case word(id: String), quiz(id: String), flashcards, tutor, about
}

@MainActor @Observable
final class AppNavigation {
    var selectedTab: MainTab = .home
    var paths: [MainTab: [AppRoute]] = [:]
    private(set) var ownerID: String?
    // New identity also discards SwiftUI drafts/sheets for the same user after logout.
    private(set) var generation = UUID()

    func activate(userID: String) {
        guard ownerID != userID else { return }
        reset()
        ownerID = userID
    }

    func reset() {
        ownerID = nil
        selectedTab = .home
        paths = [:]
        generation = UUID()
    }
}

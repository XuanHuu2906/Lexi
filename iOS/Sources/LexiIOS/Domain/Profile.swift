import Foundation

enum CEFRLevel: String, Codable, Sendable { case a1 = "A1", a2 = "A2", b1 = "B1", b2 = "B2", c1 = "C1", c2 = "C2" }
enum TTSVoice: String, Codable, Sendable {
    case enUS = "EN_US", enGB = "EN_GB"
    var localeIdentifier: String { self == .enUS ? "en-US" : "en-GB" }
}

struct Settings: Decodable, Sendable, Equatable {
    let dailyGoal: Int
    let cefrLevel: CEFRLevel
    let topics: [String]
    let reminderTime: String
    let timeZone: String
    let notifyEnabled: Bool
    let ttsVoice: TTSVoice
}

struct SettingsUpdate: Encodable, Sendable {
    var dailyGoal: Int? = nil
    var cefrLevel: CEFRLevel? = nil
    var topics: [String]? = nil
    var reminderTime: String? = nil
    var timeZone: String? = nil
    var notifyEnabled: Bool? = nil
    var ttsVoice: TTSVoice? = nil
}

struct ApiUser: Decodable, Sendable {
    let id: String
    let email: String
    let provider: String
    let emailVerified: Bool
    let role: String
    let createdAt: String
    let updatedAt: String
}

struct ApiMe: Decodable, Sendable {
    let id: String
    let email: String
    let provider: String
    let emailVerified: Bool
    let role: String
    let createdAt: String
    let updatedAt: String
    let setting: Settings?
    let streak: StreakSnapshot?
}

struct StreakSnapshot: Decodable, Sendable {
    let currentStreak: Int
    let longestStreak: Int
    let streakFreezes: Int
    let lastActiveDate: String?
}

struct Streak: Decodable, Sendable {
    struct Today: Decodable, Sendable {
        let wordsReviewed: Int
        let dailyGoal: Int
        let goalMet: Bool
    }
    let currentStreak: Int
    let longestStreak: Int
    let streakFreezes: Int
    let lastActiveDate: String?
    let today: Today
}

enum StatsPeriod: String, Sendable, Decodable { case all, week, month }
struct Stats: Decodable, Sendable {
    struct Quizzes: Decodable, Sendable { let count: Int; let avgScorePercent: Double }
    let period: StatsPeriod
    let totalWords: Int
    let mastered: Int
    let learning: Int
    let new: Int
    let retentionRate: Double
    let reviewsCount: Int
    let activeDays: Int
    let quizzes: Quizzes
}

struct Weakness: Decodable, Sendable {
    struct Topic: Decodable, Sendable { let topic: String; let reviews: Int; let accuracy: Double }
    struct WeakWord: Decodable, Sendable { let term: String; let meaning: String; let fails: Int }
    let weakTopics: [Topic]
    let weakWords: [WeakWord]
}

struct BadgesResult: Decodable, Sendable {
    struct Badge: Decodable, Sendable {
        let code: String
        let name: String
        let description: String
        let icon: String?
        let earned: Bool
        let earnedAt: String?
    }
    let newlyEarned: [String]
    let badges: [Badge]
}

import Foundation

enum ChatRole: String, Codable, Sendable { case user, assistant }
struct ChatTurn: Codable, Sendable, Equatable {
    let role: ChatRole
    let content: String
}
enum AIChatKind: String, Sendable { case tutor, grammar }

struct ContextResult: Decodable, Sendable {
    struct Highlight: Decodable, Sendable { let word: String; let meaning: String; let reason: String }
    let highlights: [Highlight]
    let note: String
}

struct GrammarRule: Decodable, Sendable, Identifiable {
    let id: String
    let title: String?
    let formula: String
    let explanation: String
    let examples: [String]
    let createdAt: String
    let updatedAt: String
    var displayTitle: String { title?.nonempty ?? formula }
    var input: GrammarInput { .init(title: title ?? "", formula: formula, explanation: explanation, examples: examples) }
}
struct GrammarInput: Encodable, Sendable, Equatable {
    var title = ""
    var formula = ""
    var explanation = ""
    var examples: [String] = []
    var isValid: Bool { title.apiLength <= 200 && !formula.trimmed.isEmpty && !explanation.trimmed.isEmpty }
}
struct GrammarPreview: Decodable, Sendable {
    let isValid: Bool
    let title: String?
    let formula: String
    let explanation: String
    let examples: [String]
    var input: GrammarInput { .init(title: title ?? "", formula: formula, explanation: explanation, examples: examples) }
}
struct GrammarExamples: Decodable, Sendable { let generated: [String]; let rule: GrammarRule }

enum ConversationStatus: String, Codable, Sendable { case active = "ACTIVE", completed = "COMPLETED" }
struct ConversationEntry: Decodable, Sendable {
    let role: ChatRole
    let content: String
    var feedback: String? = nil
    var suggestion: String? = nil
}
struct ConversationSummary: Decodable, Sendable {
    let strengths: String
    let weaknesses: String
    let overall: String
}
struct ConversationItem: Decodable, Sendable, Identifiable {
    let id: String
    let scenario: String
    let status: ConversationStatus
    let createdAt: String
    let updatedAt: String
}
struct ConversationDetail: Decodable, Sendable, Identifiable {
    let id: String
    let scenario: String
    var status: ConversationStatus
    var transcript: [ConversationEntry]
    var feedback: ConversationSummary?
    let createdAt: String
}
struct StartedConversation: Decodable, Sendable {
    let id: String
    let scenario: String
    let status: ConversationStatus
    let opening: String
}
struct ConversationReply: Decodable, Sendable {
    let reply: String
    let feedback: String?
    let suggestion: String?
}
struct EndedConversation: Decodable, Sendable { let summary: ConversationSummary }

struct ConversationScenario: Identifiable, Sendable {
    let id: String
    let title: String
    let symbol: String
    let prompt: String
    // Product presets from frontend/src/app/(app)/conversation/page.tsx, not server IDs.
    static let presets: [Self] = [
        .init(id: "airport", title: "Ở sân bay", symbol: "airplane", prompt: "At the airport check-in counter, passing security."),
        .init(id: "interview", title: "Phỏng vấn việc làm", symbol: "briefcase", prompt: "A job interview; the AI is the interviewer."),
        .init(id: "restaurant", title: "Tại nhà hàng", symbol: "fork.knife", prompt: "At a restaurant, ordering a meal; the AI is the waiter."),
        .init(id: "hotel", title: "Nhận phòng khách sạn", symbol: "bed.double", prompt: "Checking into a hotel; the AI is the receptionist."),
    ]
}

extension String {
    // Match validator.js isLength: surrogate pairs count once; variation sequences count once.
    var apiLength: Int {
        var count = 0
        var previousWasBase = false
        for scalar in unicodeScalars {
            let selector = scalar.value == 0xFE0E || scalar.value == 0xFE0F
            if !selector || !previousWasBase { count += 1 }
            previousWasBase = !selector
        }
        return count
    }
    func validAIInput(limit: Int) -> Bool { !trimmed.isEmpty && apiLength <= limit }
}

import Foundation

protocol AITextServing: Sendable {
    func ask(kind: AIChatKind, question: String, history: [ChatTurn]) async throws -> TutorResult
    func grade(text: String) async throws -> WritingResult
    func analyze(passage: String, level: CEFRLevel) async throws -> ContextResult
}
struct AITextAPI: AITextServing {
    let client: APIClient
    func ask(kind: AIChatKind, question: String, history: [ChatTurn]) async throws -> TutorResult {
        guard question.validAIInput(limit: 1000), history.count <= 50 else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let question: String; let history: [ChatTurn] }
        let body = Body(question: question, history: history)
        if kind == .grammar {
            let value: GrammarQaResult = try await client.send(APIEndpoint(path: ["grammar-qa", "ask"], method: .post, timeout: .ai).json(body))
            guard !value.answer.trimmed.isEmpty else { throw HTTPError.invalidResponse }
            return TutorResult(answer: value.answer)
        }
        let value: TutorResult = try await client.send(APIEndpoint(path: ["tutor", "ask"], method: .post, timeout: .ai).json(body))
        guard !value.answer.trimmed.isEmpty else { throw HTTPError.invalidResponse }
        return value
    }
    func grade(text: String) async throws -> WritingResult {
        guard text.validAIInput(limit: 5000) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let text: String }
        let value: WritingResult = try await client.send(APIEndpoint(path: ["writing", "grade"], method: .post, timeout: .ai).json(Body(text: text)))
        guard value.score.isFinite, (0...10).contains(value.score), !value.correctedText.trimmed.isEmpty else { throw HTTPError.invalidResponse }
        return value
    }
    func analyze(passage: String, level: CEFRLevel) async throws -> ContextResult {
        guard passage.validAIInput(limit: 4000) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let passage: String; let level: CEFRLevel }
        return try await client.send(APIEndpoint(path: ["context", "analyze"], method: .post, timeout: .ai).json(Body(passage: passage, level: level)))
    }
}

protocol GrammarServing: Sendable {
    func list(search: String, page: Int) async throws -> Paginated<GrammarRule>
    func get(id: String) async throws -> GrammarRule
    func preview(rule: String) async throws -> GrammarPreview
    func create(_ input: GrammarInput) async throws -> GrammarRule
    func update(id: String, input: GrammarInput) async throws -> GrammarRule
    func delete(id: String) async throws -> DeletedResult
    func examples(id: String) async throws -> GrammarExamples
}
struct GrammarAPI: GrammarServing {
    let client: APIClient
    func list(search: String, page: Int = 1) async throws -> Paginated<GrammarRule> {
        guard page > 0 else { throw HTTPError.invalidRequest }
        return try await client.send(APIEndpoint(path: ["grammar"], query: [
            .init(name: "search", value: search), .init(name: "page", value: String(page)), .init(name: "limit", value: "20")
        ], retry: .safeReadOnce))
    }
    func get(id: String) async throws -> GrammarRule {
        try await client.send(APIEndpoint(path: ["grammar", id], retry: .safeReadOnce))
    }
    func preview(rule: String) async throws -> GrammarPreview {
        guard rule.validAIInput(limit: 4000) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let rule: String }
        return try await client.send(APIEndpoint(path: ["grammar", "preview"], method: .post, timeout: .ai).json(Body(rule: rule)))
    }
    func create(_ input: GrammarInput) async throws -> GrammarRule {
        guard input.isValid else { throw HTTPError.invalidRequest }
        return try await client.send(APIEndpoint(path: ["grammar"], method: .post).json(input))
    }
    func update(id: String, input: GrammarInput) async throws -> GrammarRule {
        guard input.isValid else { throw HTTPError.invalidRequest }
        return try await client.send(APIEndpoint(path: ["grammar", id], method: .patch).json(input))
    }
    func delete(id: String) async throws -> DeletedResult {
        try await client.send(APIEndpoint(path: ["grammar", id], method: .delete))
    }
    func examples(id: String) async throws -> GrammarExamples {
        struct Body: Encodable { let count = 3 }
        // Backend returns {generated,rule}; it is NOT a bare GrammarRule.
        return try await client.send(APIEndpoint(path: ["grammar", id, "examples"], method: .post, timeout: .ai).json(Body()))
    }
}

protocol ConversationServing: Sendable {
    func list() async throws -> [ConversationItem]
    func get(id: String) async throws -> ConversationDetail
    func start(scenario: String) async throws -> StartedConversation
    func reply(id: String, message: String) async throws -> ConversationReply
    func end(id: String) async throws -> EndedConversation
}
struct ConversationAPI: ConversationServing {
    let client: APIClient
    func list() async throws -> [ConversationItem] { try await client.send(APIEndpoint(path: ["conversation"], retry: .safeReadOnce)) }
    func get(id: String) async throws -> ConversationDetail {
        try await client.send(APIEndpoint(path: ["conversation", id], retry: .safeReadOnce))
    }
    func start(scenario: String) async throws -> StartedConversation {
        guard scenario.validAIInput(limit: 200) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let scenario: String }
        return try await client.send(APIEndpoint(path: ["conversation", "start"], method: .post, timeout: .ai).json(Body(scenario: scenario)))
    }
    func reply(id: String, message: String) async throws -> ConversationReply {
        guard message.validAIInput(limit: 2000) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let message: String }
        return try await client.send(APIEndpoint(path: ["conversation", id, "reply"], method: .post, timeout: .ai).json(Body(message: message)))
    }
    func end(id: String) async throws -> EndedConversation {
        try await client.send(APIEndpoint(path: ["conversation", id, "end"], method: .post, timeout: .ai))
    }
}

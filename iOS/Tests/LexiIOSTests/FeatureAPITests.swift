import Foundation
import Testing
@testable import LexiIOS

struct FeatureAPITests {
    @Test(arguments: ["login", "register", "refresh", "logout"])
    func proposedNativeAuthContractIsIsolatedFromWebCookies(_ action: String) async throws {
        let transport = MockTransport([.response(action == "register" ? 201 : 200,
            try Fixtures.body("mobile_" + action))])
        let auth = try LexiAPI(client: testClient(transport)).auth
        let credentials = MobileCredentials(email: "fixture@example.invalid", password: "synthetic-password")
        switch action {
        case "login":
            let result = try await auth.login(credentials)
            #expect(result.accessExpiresIn == 900)
            #expect(String(reflecting: result) == "MobileAuthResult(redacted)")
        case "register": _ = try await auth.register(credentials)
        case "refresh":
            let result = try await auth.refresh(refreshToken: "synthetic-refresh")
            #expect(String(reflecting: result) == "MobileRefreshResult(redacted)")
        default: _ = try await auth.logout(refreshToken: "synthetic-refresh")
        }
        #expect(String(reflecting: credentials) == "MobileCredentials(redacted)")
        let request = try #require(await transport.requests.first)
        #expect(request.url?.path == "/api/auth/mobile/" + action)
        #expect(request.httpMethod == "POST")
        #expect(request.value(forHTTPHeaderField: "Authorization") == nil)
        #expect(request.value(forHTTPHeaderField: "Cookie") == nil)
        let body = try #require(request.httpBody)
        let actual = try #require(JSONSerialization.jsonObject(with: body) as? NSDictionary)
        let expected: NSDictionary = ["login", "register"].contains(action)
            ? ["email": "fixture@example.invalid", "password": "synthetic-password"] : ["refreshToken": "synthetic-refresh"]
        #expect(actual == expected)
    }

    @Test(arguments: ["user_with_relations", "words_list_with_nullable_fields", "word_created", "word_deleted",
        "review_due", "review_answer_first_good", "flashcard_guess", "quiz_generated", "quiz_in_progress",
        "quiz_saved", "quiz_submitted", "stats", "weakness", "streak", "badges", "settings_updated",
        "lookup", "lookup_batch", "verify", "quick_add", "examples"])
    func featureUsesContractRouteAndMethod(_ name: String) async throws {
        let fixture = try #require(Fixtures.cases().first { $0["name"] as? String == name })
        let status = try #require(fixture["status"] as? Int)
        let transport = MockTransport([.response(status, try Fixtures.body(name))])
        let api = try LexiAPI(client: testClient(transport))
        switch name {
        case "user_with_relations":
            let user = try await api.auth.me()
            #expect(user.setting?.ttsVoice.localeIdentifier == "en-US")
        case "words_list_with_nullable_fields":
            let page = try await api.words.list(WordsQuery(search: "a&b", status: .learning, page: 2, limit: 10))
            #expect(page.items.first?.word == "apple")
        case "word_created": _ = try await api.words.create(WordInput(word: "apple", meaning: "quả táo", pos: "noun"))
        case "word_deleted": #expect(try await api.words.delete(id: "fixture-word-a").deleted)
        case "review_due": #expect(try await api.review.due(limit: 5).items.first?.word == "apple")
        case "review_answer_first_good":
            let result = try await api.review.answer(wordID: "fixture-word-a", rating: .good)
            #expect(result.nextReviewAt == "2026-10-18T00:00:00.000Z")
        case "flashcard_guess": _ = try await api.review.flashcards(mode: .guess, scope: .today, limit: 5)
        case "quiz_generated": _ = try await api.quiz.generate(count: 4)
        case "quiz_in_progress": _ = try await api.quiz.get(id: "fixture-quiz-a")
        case "quiz_saved": #expect(try await api.quiz.saveProgress(id: "fixture-quiz-a", answers: [0, -1]).saved)
        case "quiz_submitted": _ = try await api.quiz.submit(id: "fixture-quiz-a", answers: [0, 1, 2, 3])
        case "stats": _ = try await api.stats.overview(period: .month)
        case "weakness": _ = try await api.stats.weakness()
        case "streak": _ = try await api.stats.streak()
        case "badges": _ = try await api.stats.badges()
        case "settings_updated": _ = try await api.settings.update(SettingsUpdate(timeZone: "Asia/Ho_Chi_Minh", ttsVoice: .enGB))
        case "lookup": _ = try await api.words.lookup(term: "apple", level: .b1)
        case "lookup_batch": _ = try await api.words.lookupBatch(text: "apple, book", level: .a2)
        case "verify": _ = try await api.words.verify(term: "apple", meaning: "quả táo", level: .b1)
        case "quick_add": _ = try await api.words.quickAdd(text: "apple: quả táo", topic: "food")
        case "examples": _ = try await api.words.examples(id: "fixture-word-a", count: 2)
        default: Issue.record("Missing feature call")
        }
        let request = try #require(await transport.requests.first)
        let path = try #require(fixture["path"] as? String)
        #expect(request.url?.path == "/api" + path)
        #expect(request.httpMethod == fixture["method"] as? String)
        #expect(request.value(forHTTPHeaderField: "Cookie") == nil)
        let publicRoute = ["lookup", "lookup_batch"].contains(name)
        #expect(request.value(forHTTPHeaderField: "Authorization") == (publicRoute ? nil : "Bearer synthetic-test-token"))
        #expect(request.value(forHTTPHeaderField: "X-Request-ID") == nil)
        let aiRoute = ["lookup", "lookup_batch", "verify", "quick_add", "examples", "quiz_generated"].contains(name)
        #expect(request.timeoutInterval == (aiRoute ? 90 : 15))
        if let body = request.httpBody {
            #expect(request.value(forHTTPHeaderField: "Content-Type") == "application/json")
            let actual = try #require(JSONSerialization.jsonObject(with: body) as? NSDictionary)
            let expected: NSDictionary
            switch name {
            case "word_created": expected = ["term": "apple", "meaning": "quả táo", "partOfSpeech": "noun"]
            case "review_answer_first_good": expected = ["wordId": "fixture-word-a", "rating": "good"]
            case "quiz_generated": expected = ["count": 4]
            case "quiz_saved": expected = ["answers": [0, -1]]
            case "quiz_submitted": expected = ["quizId": "fixture-quiz-a", "answers": [0, 1, 2, 3]]
            case "settings_updated": expected = ["timeZone": "Asia/Ho_Chi_Minh", "ttsVoice": "EN_GB"]
            case "lookup": expected = ["term": "apple", "level": "B1"]
            case "lookup_batch": expected = ["text": "apple, book", "level": "A2"]
            case "verify": expected = ["term": "apple", "meaning": "quả táo", "level": "B1"]
            case "quick_add": expected = ["text": "apple: quả táo", "topic": "food"]
            case "examples": expected = ["count": 2]
            default: expected = [:]; Issue.record("Unexpected request body")
            }
            #expect(actual == expected)
        } else {
            #expect(request.httpMethod == "GET" || request.httpMethod == "DELETE")
        }
        let url = try #require(request.url)
        let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
        let query = Dictionary(uniqueKeysWithValues: items.map { ($0.name, $0.value ?? "") })
        switch name {
        case "words_list_with_nullable_fields":
            #expect(query == ["search": "a&b", "status": "LEARNING", "sort": "newest", "page": "2", "limit": "10"])
        case "review_due": #expect(query == ["limit": "5"])
        case "flashcard_guess": #expect(query == ["mode": "guess", "scope": "today", "limit": "5"])
        case "stats": #expect(query == ["period": "month"])
        default: #expect(query.isEmpty)
        }
    }

    @Test func wordDetailUsesEncodedIDAndDomainMapper() async throws {
        let transport = MockTransport([.response(200, try Fixtures.body("word_created"))])
        let word = try await LexiAPI(client: testClient(transport)).words.get(id: "id/with slash")
        #expect(word.word == "apple")
        let request = try #require(await transport.requests.first)
        #expect(request.url?.absoluteString == "https://api.example.invalid/api/words/id%2Fwith%20slash")
    }

    @Test(arguments: ["review", "quiz", "generate", "lookup", "streak", "badges"])
    func requestsWithSideEffectsAreNeverRepeated(_ operation: String) async throws {
        let transport = MockTransport([.failure(.timedOut)])
        let api = try LexiAPI(client: testClient(transport))
        await #expect(throws: HTTPError.timeout) {
            switch operation {
            case "review": _ = try await api.review.answer(wordID: "word", rating: .easy)
            case "quiz": _ = try await api.quiz.submit(id: "quiz", answers: [0])
            case "generate": _ = try await api.quiz.generate()
            case "lookup": _ = try await api.words.lookup(term: "apple")
            case "streak": _ = try await api.stats.streak()
            default: _ = try await api.stats.badges()
            }
        }
        #expect(await transport.requests.count == 1)
    }

    @Test func invalidBoundsFailBeforeNetwork() async throws {
        let transport = MockTransport([])
        let api = try LexiAPI(client: testClient(transport))
        await #expect(throws: HTTPError.invalidRequest) { try await api.words.list(WordsQuery(page: 0)) }
        await #expect(throws: HTTPError.invalidRequest) { try await api.review.due(limit: 101) }
        await #expect(throws: HTTPError.invalidRequest) { try await api.review.flashcards(mode: .fill, limit: 51) }
        await #expect(throws: HTTPError.invalidRequest) { try await api.quiz.generate(count: 3) }
        await #expect(throws: HTTPError.invalidRequest) { try await api.words.examples(id: "word", count: 6) }
        #expect(await transport.requests.isEmpty)
    }
}

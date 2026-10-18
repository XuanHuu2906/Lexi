import Foundation
import Testing
@testable import LexiIOS

enum Fixtures {
    static func cases() throws -> [[String: Any]] {
        let url = try #require(Bundle.module.url(forResource: "contracts", withExtension: "json", subdirectory: "Fixtures"))
        let root = try #require(JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        return try #require(root["cases"] as? [[String: Any]])
    }
    static func body(_ name: String) throws -> Data {
        let item = try #require(cases().first { $0["name"] as? String == name })
        return try JSONSerialization.data(withJSONObject: #require(item["body"]))
    }
    static func decode<T: Decodable & Sendable>(_ type: T.Type, _ name: String) throws -> T {
        try APIJSON.decoder().decode(APIEnvelope<T>.self, from: body(name)).data
    }
}

struct ContractTests {
    @Test func everyFixtureDecodesIntoItsDeclaredModel() throws {
        for item in try Fixtures.cases() {
            let name = try #require(item["name"] as? String)
            let data = try Fixtures.body(name)
            if try #require(item["status"] as? Int) >= 400 {
                let error = try APIJSON.decoder().decode(APIErrorPayload.self, from: data)
                #expect(error.statusCode == item["status"] as? Int)
                #expect(!error.message.messages.isEmpty)
                continue
            }
            switch name {
            case "mobile_login", "mobile_register": _ = try Fixtures.decode(MobileAuthResult.self, name)
            case "mobile_refresh": _ = try Fixtures.decode(MobileRefreshResult.self, name)
            case "mobile_logout": _ = try Fixtures.decode(LogoutResult.self, name)
            case "health_success": _ = try Fixtures.decode(HealthResponse.self, name)
            case "user_nullable_relations", "user_with_relations": _ = try Fixtures.decode(ApiMe.self, name)
            case "words_list_with_nullable_fields", "words_empty": _ = try Fixtures.decode(Paginated<BackendWordDTO>.self, name)
            case "word_created": _ = try Fixtures.decode(BackendWordDTO.self, name)
            case "word_deleted": _ = try Fixtures.decode(DeletedResult.self, name)
            case "review_due_empty", "review_due": _ = try Fixtures.decode(DueReviewsDTO.self, name)
            case "review_answer_first_good": _ = try Fixtures.decode(ReviewAnswerResult.self, name)
            case "flashcard_guess", "flashcard_listen", "flashcard_fill", "flashcard_match": _ = try Fixtures.decode(FlashcardSet.self, name)
            case "quiz_in_progress", "quiz_completed": _ = try Fixtures.decode(QuizState.self, name)
            case "quiz_generated": _ = try Fixtures.decode(GeneratedQuiz.self, name)
            case "quiz_submitted": _ = try Fixtures.decode(QuizResult.self, name)
            case "quiz_saved": _ = try Fixtures.decode(SavedResult.self, name)
            case "settings_updated": _ = try Fixtures.decode(Settings.self, name)
            case "streak": _ = try Fixtures.decode(Streak.self, name)
            case "stats": _ = try Fixtures.decode(Stats.self, name)
            case "weakness": _ = try Fixtures.decode(Weakness.self, name)
            case "badges": _ = try Fixtures.decode(BadgesResult.self, name)
            case "tutor": _ = try Fixtures.decode(TutorResult.self, name)
            case "writing": _ = try Fixtures.decode(WritingResult.self, name)
            case "grammar_qa": _ = try Fixtures.decode(GrammarQaResult.self, name)
            case "pronunciation": _ = try Fixtures.decode(PronunciationResult.self, name)
            case "lookup": _ = try Fixtures.decode(LookupResult.self, name)
            case "lookup_batch": _ = try Fixtures.decode(BatchLookupResult.self, name)
            case "verify": _ = try Fixtures.decode(VerifyWordResult.self, name)
            case "quick_add": _ = try Fixtures.decode(QuickAddResult.self, name)
            case "examples": _ = try Fixtures.decode(ExamplesResult.self, name)
            default: Issue.record("Fixture has no decoding coverage: \(name)")
            }
        }
    }

    @Test func wordStatusAndNullableMapping() throws {
        let data = try Fixtures.body("word_created")
        for (wire, domain) in [("NEW", WordStatus.new), ("LEARNING", .due), ("MASTERED", .learned)] {
            let json = String(decoding: data, as: UTF8.self).replacingOccurrences(of: "NEW", with: wire)
            let dto = try APIJSON.decoder().decode(APIEnvelope<BackendWordDTO>.self, from: Data(json.utf8)).data
            let word = dto.toWord()
            #expect(word.status == domain)
            #expect(word.word == "apple" && word.meaning == "quả táo")
            #expect(word.pos == nil && word.phonetic == nil && word.note == nil)
            #expect(word.examples.isEmpty)
            #expect(word.nextReviewAt == dto.srsData?.nextReviewAt)
        }
        var root = try #require(JSONSerialization.jsonObject(with: data) as? [String: Any])
        var value = try #require(root["data"] as? [String: Any])
        value["srsData"] = NSNull()
        value["phonetic"] = ""
        root["data"] = value
        let dto = try APIJSON.decoder().decode(APIEnvelope<BackendWordDTO>.self,
            from: JSONSerialization.data(withJSONObject: root)).data
        #expect(dto.toWord().nextReviewAt == nil)
        #expect(dto.toWord().phonetic == "")
    }

    @Test func wordInputGoldenRoundTrip() throws {
        let input = WordInput(word: "apple", meaning: "quả táo", phonetic: "", pos: "noun", examples: [])
        let encoded = try APIJSON.encoder().encode(input.toDTO())
        #expect(String(decoding: encoded, as: UTF8.self) == #"{"examples":[],"meaning":"quả táo","partOfSpeech":"noun","phonetic":"","term":"apple"}"#)
        #expect(try APIJSON.decoder().decode(WordInputDTO.self, from: encoded).toInput() == input)
        #expect(!String(decoding: encoded, as: UTF8.self).contains("null"))
    }

    @Test func quizPreservesMissingNullAndAnswered() throws {
        let generated = try Fixtures.decode(GeneratedQuiz.self, "quiz_generated")
        let resumed = try Fixtures.decode(QuizState.self, "quiz_in_progress")
        let completed = try Fixtures.decode(QuizState.self, "quiz_completed")
        #expect(generated.questions[0].userAnswer == .missing)
        #expect(resumed.questions[1].userAnswer == .null)
        #expect(resumed.questions[0].userAnswer == .value(0))
        #expect(resumed.questions[0].answerIndex == nil)
        #expect(completed.questions[0].answerIndex == 0)
    }

    @Test(arguments: ["2026-10-17T00:00:00Z", "2026-10-17T00:00:00.000Z", "2026-10-17T07:00:00+07:00", "2026-10-16T19:00:00.000-05:00"])
    func dateVariantsRepresentSameInstant(_ raw: String) throws {
        let date = try #require(APIDate.parse(raw))
        #expect(date == APIDate.parse("2026-10-17T00:00:00Z"))
        let decoded = try APIJSON.decoder().decode(Date.self, from: JSONEncoder().encode(raw))
        #expect(decoded == date)
    }

    @Test func malformedDateAndUnknownStatusAreNotFabricated() throws {
        #expect(APIDate.parse("") == nil)
        #expect(APIDate.parse("tomorrow") == nil)
        #expect(throws: DecodingError.self) { try APIJSON.decoder().decode(Date.self, from: Data(#""invalid""#.utf8)) }
        let data = String(decoding: try Fixtures.body("word_created"), as: UTF8.self).replacingOccurrences(of: "NEW", with: "UNKNOWN")
        #expect(throws: DecodingError.self) { try APIJSON.decoder().decode(APIEnvelope<BackendWordDTO>.self, from: Data(data.utf8)) }
    }
}

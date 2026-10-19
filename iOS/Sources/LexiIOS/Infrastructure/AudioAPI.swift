import Foundation

struct MultipartAudio {
    let file: URL
    let contentType: String
    static func build(reference: String, audio: URL) throws -> Self {
        guard reference.validAIInput(limit: 1000) else { throw HTTPError.invalidRequest }
        _ = try WAVValidator.inspect(file: audio)
        let boundary = "Lexi-" + UUID().uuidString
        let file = try AudioTemporaryFiles.create(extension: "multipart")
        do {
            let output = try FileHandle(forWritingTo: file)
            defer { try? output.close() }
            try output.write(contentsOf: Data(("--\(boundary)\r\nContent-Disposition: form-data; name=\"referenceText\"\r\n\r\n"
                + reference + "\r\n--\(boundary)\r\nContent-Disposition: form-data; name=\"audio\"; filename=\"recording.wav\"\r\nContent-Type: audio/wav\r\n\r\n").utf8))
            let input = try FileHandle(forReadingFrom: audio)
            defer { try? input.close() }
            var copied = 0
            while let chunk = try input.read(upToCount: 64 * 1024), !chunk.isEmpty {
                try Task.checkCancellation()
                copied += chunk.count
                guard copied <= WAVValidator.maxBytes else { throw AudioFailure.tooLarge }
                try output.write(contentsOf: chunk)
            }
            try output.write(contentsOf: Data("\r\n--\(boundary)--\r\n".utf8))
            return Self(file: file, contentType: "multipart/form-data; boundary=\(boundary)")
        } catch { AudioTemporaryFiles.remove(file); throw error }
    }
}

struct DictationSentences: Decodable, Sendable { let sentences: [String] }
struct DictationFeedback: Decodable, Sendable { let feedback: String }

protocol AudioLearningServing: Sendable {
    func score(reference: String, audio: URL) async throws -> PronunciationResult
    func generateDictation(level: CEFRLevel, count: Int) async throws -> DictationSentences
    func explainDictation(reference: String, attempt: String) async throws -> DictationFeedback
}

struct AudioLearningAPI: AudioLearningServing {
    let client: APIClient
    func score(reference: String, audio: URL) async throws -> PronunciationResult {
        let form = try MultipartAudio.build(reference: reference, audio: audio)
        defer { AudioTemporaryFiles.remove(form.file) }
        let result: PronunciationResult = try await client.send(APIEndpoint(path: ["pronunciation", "score"], method: .post,
            headers: ["Content-Type": form.contentType], timeout: .audio), uploadFile: form.file)
        guard result.score.isFinite, (0...100).contains(result.score), !result.feedback.trimmed.isEmpty else { throw HTTPError.invalidResponse }
        return result
    }
    func generateDictation(level: CEFRLevel, count: Int) async throws -> DictationSentences {
        guard (1...20).contains(count) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let level: CEFRLevel; let count: Int }
        let result: DictationSentences = try await client.send(APIEndpoint(path: ["dictation", "generate"], method: .post, timeout: .ai)
            .json(Body(level: level, count: count)))
        guard result.sentences.count == count, result.sentences.allSatisfy({ $0.validAIInput(limit: 500) }) else { throw HTTPError.invalidResponse }
        return result
    }
    func explainDictation(reference: String, attempt: String) async throws -> DictationFeedback {
        guard reference.validAIInput(limit: 500), attempt.validAIInput(limit: 500) else { throw HTTPError.invalidRequest }
        struct Body: Encodable { let reference: String; let attempt: String }
        let result: DictationFeedback = try await client.send(APIEndpoint(path: ["dictation", "explain"], method: .post, timeout: .ai)
            .json(Body(reference: reference, attempt: attempt)))
        guard !result.feedback.trimmed.isEmpty else { throw HTTPError.invalidResponse }
        return result
    }
}

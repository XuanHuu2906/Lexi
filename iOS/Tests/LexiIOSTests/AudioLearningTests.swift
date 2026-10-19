import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import Testing
@testable import LexiIOS

private func testWAV(seconds: Double = 1, silent: Bool = false, extraChunk: Bool = false) -> Data {
    func le(_ value: Int, _ count: Int) -> [UInt8] { (0..<count).map { UInt8(truncatingIfNeeded: value >> ($0 * 8)) } }
    let sample: [UInt8] = silent ? [0, 0] : [32, 0]
    let pcm: [UInt8] = Array(repeating: sample, count: Int(seconds * 16_000)).flatMap { $0 }
    let junk: [UInt8] = extraChunk ? Array("JUNK".utf8) + le(1, 4) + [7, 0] : []
    let format = Array("fmt ".utf8) + le(16, 4) + le(1, 2) + le(1, 2) + le(16_000, 4) + le(32_000, 4) + le(2, 2) + le(16, 2)
    let body = Array("WAVE".utf8) + junk + format + Array("data".utf8) + le(pcm.count, 4) + pcm
    return Data(Array("RIFF".utf8) + le(body.count, 4) + body)
}
private func testClip() throws -> AudioClip {
    let file = try AudioTemporaryFiles.create(extension: "wav")
    try testWAV().write(to: file)
    return try AudioClip(file: file, info: WAVValidator.inspect(file: file))
}

private actor UploadSpy: HTTPTransport {
    let responses: MockTransport
    private(set) var files: [URL] = []
    private(set) var bodies: [Data] = []
    init(_ steps: [MockTransport.Step]) { responses = MockTransport(steps) }
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) { throw HTTPError.invalidRequest }
    func upload(_ request: URLRequest, fromFile file: URL) async throws -> (Data, HTTPURLResponse) {
        files.append(file); bodies.append(try Data(contentsOf: file))
        return try await responses.send(request)
    }
}

struct AudioContractTests {
    @Test func wavChecksRealChunksDurationAlignmentAndEncoding() throws {
        for extra in [false, true] {
            let info = try WAVValidator.inspect(testWAV(extraChunk: extra))
            #expect(info.sampleRate == 16_000 && info.channels == 1 && info.bitsPerSample == 16)
            #expect(info.frames == 16_000 && info.duration == 1)
        }
        for offset in [0, 4, 8, 16, 20, 22, 24, 28, 32, 34, 40] {
            var data = testWAV(); data[offset] ^= 0x7f
            #expect(throws: AudioFailure.self) { try WAVValidator.inspect(data) }
        }
        #expect(throws: AudioFailure.self) { try WAVValidator.inspect(Data(testWAV().dropLast())) }
        #expect(throws: AudioFailure.tooShort) { try WAVValidator.inspect(testWAV(seconds: 0.1)) }
        #expect(throws: AudioFailure.tooLong) { try WAVValidator.inspect(testWAV(seconds: 61)) }
        #expect(throws: AudioFailure.silent) { try WAVValidator.inspect(testWAV(silent: true)) }
        #expect(throws: AudioFailure.tooLarge) { try WAVValidator.inspect(Data(repeating: 0, count: WAVValidator.maxBytes + 1)) }
    }

    @Test func multipartUsesRealWAVAndDoesNotSendRecognizedTextFallback() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let spy = UploadSpy([.response(201, try Fixtures.body("pronunciation"))])
        let api = try AudioLearningAPI(client: testClient(spy))
        _ = try await api.score(reference: "I like tea. café", audio: clip.file)
        let request = try #require(await spy.responses.requests.first)
        let body = try #require(await spy.bodies.first)
        let file = try #require(await spy.files.first)
        let type = try #require(request.value(forHTTPHeaderField: "Content-Type"))
        let boundary = try #require(type.components(separatedBy: "boundary=").last)
        #expect(request.httpMethod == "POST" && request.url?.path == "/api/pronunciation/score")
        #expect(request.timeoutInterval == 120 && request.httpBody == nil)
        #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer synthetic-test-token")
        #expect(request.value(forHTTPHeaderField: "Cookie") == nil)
        #expect(body.range(of: testWAV()) != nil)
        #expect(body.range(of: Data("name=\"referenceText\"\r\n\r\nI like tea. café\r\n".utf8)) != nil)
        #expect(body.range(of: Data("name=\"audio\"; filename=\"recording.wav\"\r\nContent-Type: audio/wav".utf8)) != nil)
        #expect(body.suffix(Data("\r\n--\(boundary)--\r\n".utf8).count) == Data("\r\n--\(boundary)--\r\n".utf8))
        #expect(body.range(of: Data("recognizedText".utf8)) == nil)
        #expect(!FileManager.default.fileExists(atPath: file.path))
        #expect(FileManager.default.fileExists(atPath: clip.file.path))
    }

    @Test func audioTimeoutNeverReuploadsAndMultipartAlwaysCleansUp() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let spy = UploadSpy([.failure(.timedOut)])
        let api = try AudioLearningAPI(client: testClient(spy))
        await #expect(throws: HTTPError.timeout) { try await api.score(reference: "I like tea.", audio: clip.file) }
        #expect(await spy.files.count == 1)
        for file in await spy.files { #expect(!FileManager.default.fileExists(atPath: file.path)) }
    }

    @Test func audioRefreshUsesSameBodyOnlyAfterExplicit401() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let auth = AuthDouble(), session = SessionActor(auth: auth, store: MemoryKeychain())
        try await session.signIn(.init(email: "audio@example.invalid", password: "Synthetic123"))
        let spy = UploadSpy([.response(401, Data()), .response(200, try Fixtures.body("pronunciation"))])
        var client = try testClient(spy); client.tokens = session
        _ = try await AudioLearningAPI(client: client).score(reference: "I like tea.", audio: clip.file)
        let bodies = await spy.bodies
        #expect(bodies.count == 2 && bodies[0] == bodies[1])
        #expect(await auth.refreshCalls == 1)
    }

    @Test func cancellingUploadDeletesMultipartAndDoesNotRetry() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let spy = UploadSpy([.waitForCancellation]), api = try AudioLearningAPI(client: testClient(spy))
        let task = Task { try await api.score(reference: "I like tea.", audio: clip.file) }
        while await spy.responses.requests.isEmpty { await Task.yield() }
        task.cancel()
        await #expect(throws: HTTPError.cancellation) { try await task.value }
        #expect(await spy.files.count == 1)
        for file in await spy.files { #expect(!FileManager.default.fileExists(atPath: file.path)) }
    }

    @Test func invalidAudioAndReferenceFailBeforeNetwork() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let spy = UploadSpy([]), api = try AudioLearningAPI(client: testClient(spy))
        await #expect(throws: HTTPError.invalidRequest) { try await api.score(reference: "", audio: clip.file) }
        try Data("not a WAV".utf8).write(to: clip.file)
        await #expect(throws: AudioFailure.invalidWAV) { try await api.score(reference: "I like tea.", audio: clip.file) }
        #expect(await spy.files.isEmpty)
    }

    @Test func dictationContractsValidateInputsAndAIOutput() async throws {
        let body = Data(#"{"success":true,"data":{"sentences":["I like tea.","She reads books."]}}"#.utf8)
        let feedback = Data(#"{"success":true,"data":{"feedback":"Check the final word."}}"#.utf8)
        let transport = MockTransport([.response(201, body), .response(201, feedback), .response(201, body)])
        let api = try AudioLearningAPI(client: testClient(transport))
        _ = try await api.generateDictation(level: .a2, count: 2)
        _ = try await api.explainDictation(reference: "I like tea.", attempt: "I like tee.")
        let requests = await transport.requests
        #expect(requests.map { $0.url!.path } == ["/api/dictation/generate", "/api/dictation/explain"])
        #expect(requests.allSatisfy { $0.httpMethod == "POST" && $0.timeoutInterval == 90 })
        let requestBody = try #require(requests[0].httpBody)
        let json = try #require(JSONSerialization.jsonObject(with: requestBody) as? [String: Any])
        #expect(json["level"] as? String == "A2" && json["count"] as? Int == 2)
        await #expect(throws: HTTPError.invalidRequest) { try await api.generateDictation(level: .b1, count: 21) }
        await #expect(throws: HTTPError.invalidRequest) { try await api.explainDictation(reference: "a", attempt: " ") }
        await #expect(throws: HTTPError.invalidResponse) { try await api.generateDictation(level: .b1, count: 5) }
        #expect(await transport.requests.count == 3)
    }

    @Test func speechPreferencesHaveSafeDefaults() {
        #expect(TTSVoice.enUS.localeIdentifier == "en-US" && TTSVoice.enGB.localeIdentifier == "en-GB")
        #expect(SpeechPreferences.multiplier(.nan) == 0.85)
        #expect(SpeechPreferences.multiplier(0) == 0.85)
        #expect(SpeechPreferences.multiplier(0.6) == 0.6)
    }
}

@MainActor private final class PermissionStub: MicrophonePermissionProviding {
    var allowed = true
    var hold = false
    var continuation: CheckedContinuation<Bool, Never>?
    var requests = 0
    func request() async -> Bool {
        requests += 1
        if hold { return await withCheckedContinuation { continuation = $0 } }
        return allowed
    }
    func release() { continuation?.resume(returning: allowed); continuation = nil }
}
@MainActor private final class RecorderStub: AudioRecording {
    var elapsed: TimeInterval = 1
    var onFinish: ((Result<AudioClip, AudioFailure>) -> Void)?
    var starts = 0
    var discards = 0
    let clip: AudioClip
    init(_ clip: AudioClip) { self.clip = clip }
    func start() throws { starts += 1 }
    func stop() { onFinish?(.success(clip)) }
    func discard() { discards += 1 }
    func play(_ clip: AudioClip) throws {}
    func stopPlayback() {}
}
private actor AudioStub: AudioLearningServing {
    private(set) var scores = 0
    private(set) var explanations = 0
    var error: HTTPError?
    var held = false
    var continuation: CheckedContinuation<Void, Never>?
    func configure(error: HTTPError? = nil, held: Bool = false) { self.error = error; self.held = held }
    func waiting() -> Bool { continuation != nil }
    func release() { continuation?.resume(); continuation = nil }
    func score(reference: String, audio: URL) async throws -> PronunciationResult {
        scores += 1
        if held { await withCheckedContinuation { continuation = $0 } }
        if let error { throw error }
        return .init(score: 80, transcriptHeard: "I like tea.", mispronounced: [], feedback: "Synthetic feedback")
    }
    func generateDictation(level: CEFRLevel, count: Int) async throws -> DictationSentences {
        if let error { throw error }
        return .init(sentences: Array(repeating: "I like tea.", count: count))
    }
    func explainDictation(reference: String, attempt: String) async throws -> DictationFeedback {
        explanations += 1
        if held { await withCheckedContinuation { continuation = $0 } }
        if let error { throw error }
        return .init(feedback: "Synthetic feedback")
    }
}

@Suite @MainActor
struct AudioFeatureTests {
    @Test func pronunciationFailureExplainsHTTPStatusWithoutDisplayingProviderPayload() {
        let privatePayload = APIErrorPayload(
            success: false, statusCode: 503,
            message: .text("PRIVATE-PROVIDER-DETAIL synthetic only"),
            error: "Service Unavailable", path: "/pronunciation/score",
            timestamp: "2026-10-19T09:22:00Z"
        )
        let unavailable = FeatureFeedback(HTTPError.server(503, privatePayload),
                                          mutation: true, context: .pronunciation).message
        #expect(unavailable.contains("503"))
        #expect(unavailable.contains("Azure Speech"))
        #expect(!unavailable.contains("PRIVATE-PROVIDER-DETAIL"))
        #expect(!unavailable.contains("đã được lưu"))
        #expect(FeatureFeedback(HTTPError.validation(422, nil), context: .pronunciation)
            .message.contains("422"))
        #expect(FeatureFeedback(HTTPError.unexpectedStatus(413, nil), context: .pronunciation)
            .message.contains("413"))
        #expect(FeatureFeedback(HTTPError.server(502, nil), context: .pronunciation)
            .message.contains("502"))
        #expect(FeatureFeedback(HTTPError.decoding, context: .pronunciation)
            .message.contains("định dạng API"))
        #expect(FeatureFeedback(HTTPError.timeout, context: .pronunciation)
            .message.contains("không tự gửi lại"))
        #expect(FeatureFeedback(AudioFailure.invalidWAV, context: .pronunciation)
            .message == AudioFailure.invalidWAV.message)
        // Unrelated features must retain their existing generic error semantics.
        #expect(FeatureFeedback(HTTPError.server(503, nil), mutation: true)
            .message.contains("đã được lưu"))
    }

    @Test func pronunciation503RetainsAudioAndDoesNotAutomaticallyReupload() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let api = AudioStub()
        await api.configure(error: .server(503, nil))
        let model = PronunciationViewModel(api: api, permission: PermissionStub(),
                                           recorder: RecorderStub(clip))
        await model.record(); model.stop()
        await model.submit()
        #expect(model.request.state == .serverError)
        #expect(model.request.feedback?.message.contains("HTTP 503") == true)
        #expect(model.clip != nil && model.canSubmit)
        #expect(model.notice == nil) // no second generic banner
        #expect(await api.scores == 1)
        model.deactivate()
        #expect(!FileManager.default.fileExists(atPath: clip.file.path))
    }

    @Test func permissionIsRequestedOnlyForRecordAndDenialNeverStartsOrUploads() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let permission = PermissionStub(); permission.allowed = false
        let recorder = RecorderStub(clip), api = AudioStub()
        let model = PronunciationViewModel(api: api, permission: permission, recorder: recorder)
        #expect(permission.requests == 0)
        await model.submit(); await model.record()
        #expect(model.permissionDenied && model.phase == .idle && recorder.starts == 0)
        #expect(await api.scores == 0)
    }

    @Test func leavingDuringPermissionPromptNeverStartsMicrophoneAfterwards() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let permission = PermissionStub(); permission.hold = true
        let recorder = RecorderStub(clip)
        let model = PronunciationViewModel(api: AudioStub(), permission: permission, recorder: recorder)
        let task = Task { await model.record() }
        while permission.continuation == nil { await Task.yield() }
        model.suspend(); permission.release(); await task.value
        #expect(recorder.starts == 0 && model.phase == .idle)
    }

    @Test func cancelledPermissionTaskCanBeRetried() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let permission = PermissionStub(); permission.hold = true
        let model = PronunciationViewModel(api: AudioStub(), permission: permission, recorder: RecorderStub(clip))
        let task = Task { await model.record() }
        while permission.continuation == nil { await Task.yield() }
        task.cancel(); permission.release(); await task.value
        #expect(model.phase == .idle && model.canRecord)
    }

    @Test func recordingNeedsExplicitSubmitAndChangedReferenceCannotUseOldAudio() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let api = AudioStub(), recorder = RecorderStub(clip)
        let model = PronunciationViewModel(api: api, permission: PermissionStub(), recorder: recorder)
        await model.record(); await model.record()
        #expect(recorder.starts == 1)
        model.stop(); #expect(model.clip != nil && model.canSubmit)
        #expect(await api.scores == 0)
        model.reference = "A different sentence."
        await model.submit(); #expect(await api.scores == 0)
        model.reference = model.recordedReference
        await model.submit(); #expect(model.result?.score == 80)
        model.suspend()
        #expect(model.clip == nil && !FileManager.default.fileExists(atPath: clip.file.path))
    }

    @Test func backgroundDeletesAudioAndDiscardsLateScoreWithoutResending() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let api = AudioStub(); await api.configure(held: true)
        let model = PronunciationViewModel(api: api, permission: PermissionStub(), recorder: RecorderStub(clip))
        await model.record(); model.stop()
        let task = Task { await model.submit() }
        while !(await api.waiting()) { await Task.yield() }
        await model.submit(); model.suspend(); await api.release(); await task.value
        #expect(model.result == nil && model.clip == nil)
        #expect(!FileManager.default.fileExists(atPath: clip.file.path))
        #expect(await api.scores == 1)
    }

    @Test func audioRateLimitRetainsClipAndCannotBypassCooldown() async throws {
        let clip = try testClip(); defer { AudioTemporaryFiles.remove(clip.file) }
        let api = AudioStub(); await api.configure(error: .rateLimit(retryAfter: 60, payload: nil))
        let model = PronunciationViewModel(api: api, permission: PermissionStub(), recorder: RecorderStub(clip))
        await model.record(); model.stop(); await model.submit(); await model.submit()
        #expect(model.clip != nil && !model.canSubmit && model.request.state == .rateLimited)
        #expect(await api.scores == 1)
        model.deactivate(); #expect(model.reference.isEmpty && model.clip == nil)
    }

    @Test func dictationFailureRetainsDraftAndOnlyAcknowledgedAnswerAdvances() async {
        let api = AudioStub()
        let subject = DictationViewModel(api: api)
        subject.count = 2; await subject.generate()
        subject.draft = "I like tee."; await api.configure(error: .timeout)
        await subject.submit(); subject.next()
        #expect(subject.draft == "I like tee." && subject.index == 0 && subject.submittedAttempt == nil)
        await api.configure(); await subject.submit(); await subject.submit()
        #expect(subject.feedback != nil)
        #expect(await api.explanations == 2)
        subject.next(); #expect(subject.index == 1 && subject.draft.isEmpty)
        subject.deactivate(); #expect(subject.sentences.isEmpty)
    }

    @Test func dictationBackgroundCancelsFeedbackAndKeepsTypedText() async {
        let api = AudioStub()
        let subject = DictationViewModel(api: api)
        await subject.generate(); subject.draft = "I like tea."; await api.configure(held: true)
        let task = Task { await subject.submit() }
        while !(await api.waiting()) { await Task.yield() }
        subject.suspend(); await api.release(); await task.value
        #expect(subject.draft == "I like tea." && subject.feedback == nil)
        subject.deactivate()
    }
}

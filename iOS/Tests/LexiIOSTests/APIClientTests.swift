import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import Testing
@testable import LexiIOS

actor MockTransport: HTTPTransport {
    enum Step: Sendable {
        case response(Int, Data, [String: String] = [:])
        case failure(URLError.Code)
        case waitForCancellation
    }
    private var steps: [Step]
    private(set) var requests: [URLRequest] = []
    init(_ steps: [Step]) { self.steps = steps }
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        requests.append(request)
        guard !steps.isEmpty else { throw HTTPError.invalidResponse }
        switch steps.removeFirst() {
        case .response(let status, let body, let headers):
            let url = try #require(request.url)
            let response = try #require(HTTPURLResponse(url: url, statusCode: status, httpVersion: nil, headerFields: headers))
            return (body, response)
        case .failure(let code): throw URLError(code)
        case .waitForCancellation:
            try await Task.sleep(for: .seconds(30))
            throw HTTPError.timeout
        }
    }
}

struct TestTokens: TokenProvider {
    func accessToken() async throws -> String? { "synthetic-test-token" }
}
struct ImmediateClock: APIClock {
    func now() -> Date { Date(timeIntervalSince1970: 0) }
    func sleep(seconds: TimeInterval) async throws { try Task.checkCancellation() }
}
func testClient(_ transport: any HTTPTransport) throws -> APIClient {
    APIClient(environment: try AppEnvironment(baseURL: "https://api.example.invalid/api/", flavor: .staging),
        transport: transport, tokens: TestTokens(), clock: ImmediateClock())
}

struct APIClientTests {
    @Test(arguments: [200, 201]) func successEnvelope(_ status: Int) async throws {
        let transport = MockTransport([.response(status, try Fixtures.body("word_created"))])
        let word = try await testClient(transport).send(APIEndpoint<BackendWordDTO>(path: ["words"]))
        #expect(word.term == "apple")
    }
    @Test func noContentRequiresExplicitEmptyResponse() async throws {
        let transport = MockTransport([.response(204, Data()), .response(204, Data())])
        let client = try testClient(transport)
        let empty = try await client.send(APIEndpoint<EmptyResponse>(path: ["resource"], method: .delete))
        #expect(empty == EmptyResponse())
        await #expect(throws: HTTPError.decoding) { try await client.send(APIEndpoint<BackendWordDTO>(path: ["words"])) }
    }
    @Test(arguments: [400, 401, 403, 404, 409, 422, 429, 500, 503])
    func statusRemainsAuthoritativeWithProxyOrEmptyBody(_ status: Int) async throws {
        let transport = MockTransport([.response(status, Data("<html>gateway</html>".utf8))])
        let expected: HTTPError
        switch status {
        case 400, 422: expected = .validation(status, nil)
        case 401: expected = .unauthorized(nil)
        case 403: expected = .forbidden(nil)
        case 404: expected = .notFound(nil)
        case 409: expected = .conflict(nil)
        case 429: expected = .rateLimit(retryAfter: nil, payload: nil)
        default: expected = .server(status, nil)
        }
        let client = try testClient(transport)
        await #expect(throws: expected) { try await client.send(APIEndpoint<EmptyResponse>(path: ["words"], retry: .safeReadOnce)) }
        #expect(await transport.requests.count == 1)
    }
    @Test func validationArrayAndSafeErrorDescription() async throws {
        let transport = MockTransport([.response(400, try Fixtures.body("error_400"))])
        do {
            let _: EmptyResponse = try await testClient(transport).send(APIEndpoint(path: ["words"]))
            Issue.record("Expected validation error")
        } catch let HTTPError.validation(status, payload) {
            #expect(status == 400)
            #expect(payload?.message.messages == ["term must be a string"])
            #expect(String(describing: HTTPError.validation(status, payload)) == "validation(400)")
        }
    }
    @Test(arguments: ["", "{}", "null", "<html>", #"{"success":true,"data":null}"#,
                      #"{"success":false,"data":{}}"#, #"{"success":true,"data":42}"#,
                      #"{"success":true}"#])
    func malformedSuccessNeverBecomesData(_ raw: String) async throws {
        let client = try testClient(MockTransport([.response(200, Data(raw.utf8))]))
        await #expect(throws: HTTPError.self) { try await client.send(APIEndpoint<EmptyResponse>(path: ["words"])) }
    }
    @Test func retryAfterSupportsSecondsAndHTTPDateWithoutRetrying() async throws {
        for (header, expected) in [("25", 25.0), ("Thu, 01 Jan 1970 00:01:00 GMT", 60.0),
                                   ("Wed, 31 Dec 1969 23:59:00 GMT", 0.0)] {
            let transport = MockTransport([.response(429, Data(), ["Retry-After": header])])
            let client = try testClient(transport)
            await #expect(throws: HTTPError.rateLimit(retryAfter: expected, payload: nil)) {
                try await client.send(APIEndpoint<EmptyResponse>(path: ["words"], retry: .safeReadOnce))
            }
            #expect(await transport.requests.count == 1)
        }
    }
    @Test func safeGETRetriesExactlyOnce() async throws {
        let transport = MockTransport([.failure(.networkConnectionLost), .response(200, try Fixtures.body("words_empty"))])
        let page = try await LexiAPI(client: testClient(transport)).words.list()
        #expect(page.items.isEmpty)
        #expect(await transport.requests.count == 2)
        let failing = MockTransport([.failure(.timedOut), .failure(.timedOut)])
        let client = try testClient(failing)
        await #expect(throws: HTTPError.timeout) { try await client.send(APIEndpoint<EmptyResponse>(path: ["words"], retry: .safeReadOnce)) }
        #expect(await failing.requests.count == 2)
    }
    @Test(arguments: [HTTPMethod.post, .patch, .delete])
    func mutationsNeverRetryEvenWhenMisconfigured(_ method: HTTPMethod) async throws {
        let transport = MockTransport([.failure(.networkConnectionLost)])
        let client = try testClient(transport)
        await #expect(throws: HTTPError.network(URLError.networkConnectionLost.rawValue)) {
            try await client.send(APIEndpoint<EmptyResponse>(path: ["review", "answer"], method: method, retry: .safeReadOnce))
        }
        #expect(await transport.requests.count == 1)
    }
    @Test func noTokenFailsBeforeTransportAndPublicRequestOmitsIt() async throws {
        let transport = MockTransport([.response(200, try Fixtures.body("health_success"))])
        var client = try testClient(transport)
        client.tokens = NoTokenProvider()
        await #expect(throws: HTTPError.unauthorized(nil)) { try await client.send(APIEndpoint<ApiMe>(path: ["users", "me"])) }
        #expect(await transport.requests.isEmpty)
        client.tokens = TestTokens()
        client.sendsRequestID = true
        _ = try await LexiAPI(client: client).check()
        let request = try #require(await transport.requests.first)
        #expect(request.value(forHTTPHeaderField: "Authorization") == nil)
        #expect(request.value(forHTTPHeaderField: "Cookie") == nil)
        #expect(UUID(uuidString: try #require(request.value(forHTTPHeaderField: "X-Request-ID"))) != nil)
    }
    @Test func cancellationIsPerRequest() async throws {
        let transport = MockTransport([.waitForCancellation, .response(200, try Fixtures.body("words_empty"))])
        let api = try LexiAPI(client: testClient(transport))
        let first = Task { try await api.words.list(WordsQuery(search: "a")) }
        while await transport.requests.isEmpty { await Task.yield() }
        let second = try await api.words.list(WordsQuery(search: "apple"))
        first.cancel()
        await #expect(throws: HTTPError.cancellation) { try await first.value }
        #expect(second.total == 0)
    }
    @Test func concurrentRequestsKeepTheirOwnQueryAndHeaders() async throws {
        let body = try Fixtures.body("words_empty")
        let transport = MockTransport(Array(repeating: .response(200, body), count: 8))
        let api = try LexiAPI(client: testClient(transport))
        try await withThrowingTaskGroup(of: Void.self) { group in
            for index in 0..<8 { group.addTask { _ = try await api.words.list(WordsQuery(search: String(index))) } }
            try await group.waitForAll()
        }
        let requests = await transport.requests
        let searches = requests.compactMap { URLComponents(url: $0.url!, resolvingAgainstBaseURL: false)?.queryItems?.first { $0.name == "search" }?.value }
        #expect(Set(searches) == Set((0..<8).map(String.init)))
        #expect(requests.allSatisfy { $0.value(forHTTPHeaderField: "Authorization") == "Bearer synthetic-test-token" })
    }
    @Test func encodedSegmentsQueryAndReservedHeaders() throws {
        let base = try #require(URL(string: "https://api.example.invalid/api/"))
        let endpoint = APIEndpoint<EmptyResponse>(path: ["words", "a/b ?#% táo"],
            query: [URLQueryItem(name: "search", value: "a&b= táo")])
        let request = try endpoint.request(baseURL: base, token: "test", requestID: nil)
        #expect(request.url?.absoluteString.contains("/api/words/a%2Fb%20%3F%23%25%20t%C3%A1o") == true)
        let url = try #require(request.url)
        let parts = try #require(URLComponents(url: url, resolvingAgainstBaseURL: false))
        #expect(parts.queryItems?.first?.value == "a&b= táo")
        for segment in ["", ".", "..", "a\nb"] {
            #expect(throws: HTTPError.invalidRequest) {
                try APIEndpoint<EmptyResponse>(path: ["words", segment]).request(baseURL: base, token: "test", requestID: nil)
            }
        }
        for header in ["Authorization", "Cookie", "Host", "Content-Length", "X-Request-ID"] {
            #expect(throws: HTTPError.invalidRequest) {
                try APIEndpoint<EmptyResponse>(path: ["words"], headers: [header: "unsafe"])
                    .request(baseURL: base, token: "test", requestID: nil)
            }
        }
        for unsafeBase in ["https://api.example.invalid//api", "https://api.example.invalid/api?key=x", "https://api.example.invalid/api#x"] {
            let url = try #require(URL(string: unsafeBase))
            #expect(throws: HTTPError.invalidRequest) { try endpoint.request(baseURL: url, token: "test", requestID: nil) }
        }
        for timeout in [RequestTimeout.read, .ai, .audio] {
            let request = try APIEndpoint<EmptyResponse>(path: ["test"], timeout: timeout)
                .request(baseURL: base, token: "test", requestID: nil)
            #expect(request.timeoutInterval == timeout.rawValue)
        }
    }

    @Test @MainActor func facadePreservesNetworkUIStates() async throws {
        for (code, state) in [(URLError.Code.timedOut, HealthViewModel.State.timeout),
                              (.notConnectedToInternet, .offline), (.networkConnectionLost, .offline), (.cancelled, .idle)] {
            let model = try HealthViewModel(client: LexiAPI(client: testClient(MockTransport([.failure(code)]))))
            await model.check()
            #expect(model.state == state)
        }
    }

    @Test @MainActor func healthCooldownPreventsEarlyManualRetry() async throws {
        let transport = MockTransport([.response(429, Data(), ["Retry-After": "60"])])
        let model = try HealthViewModel(client: LexiAPI(client: testClient(transport)), clock: ImmediateClock())
        await model.check()
        #expect(model.state == .rateLimited(until: Date(timeIntervalSince1970: 60)))
        await model.check()
        #expect(await transport.requests.count == 1)
    }

    @Test @MainActor func healthAllowsManualRetryAfterCooldown() async throws {
        let transport = MockTransport([.response(429, Data(), ["Retry-After": "0"]),
            .response(200, try Fixtures.body("health_success"))])
        let model = try HealthViewModel(client: LexiAPI(client: testClient(transport)), clock: ImmediateClock())
        await model.check()
        await model.check()
        guard case .reachable = model.state else { Issue.record("Expected recovery after cooldown"); return }
        #expect(await transport.requests.count == 2)
    }
}

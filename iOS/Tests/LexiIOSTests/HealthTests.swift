import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import Testing
@testable import LexiIOS

private let healthyJSON = Data(#"{"success":true,"data":{"status":"ok","database":"up","uptime":123.5,"timestamp":"2026-10-18T01:02:03.456Z"}}"#.utf8)

private actor StubTransport: HTTPTransport {
    let data: Data
    let status: Int
    private(set) var requests: [URLRequest] = []
    init(data: Data = healthyJSON, status: Int = 200) { self.data = data; self.status = status }
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        requests.append(request)
        return (data, HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: nil)!)
    }
}

private struct FailingHealth: HealthChecking {
    let error: URLError
    func check() async throws -> HealthResponse { throw error }
}

private actor RetryHealth: HealthChecking {
    private var calls = 0
    func check() async throws -> HealthResponse {
        calls += 1
        if calls == 1 { throw URLError(.timedOut) }
        return HealthResponse(status: "ok", database: "up", uptime: 1, timestamp: "2026-10-18T00:00:00Z")
    }
}

private struct SlowHealth: HealthChecking {
    func check() async throws -> HealthResponse {
        try await Task.sleep(for: .seconds(30))
        throw URLError(.timedOut)
    }
}

struct HealthTests {
    private func environment(_ url: String = "https://api.example.com") throws -> AppEnvironment {
        try AppEnvironment(baseURL: url, flavor: .staging)
    }

    @Test(arguments: ["", "http://api.example.com", "https://localhost:3000", "https://127.0.0.1", "https://[::1]", "https://user:password@api.example.com", "https://api.example.com?token=secret", "https://api.example.com#path", "not a URL"])
    func rejectsUnsafeConfiguration(_ value: String) {
        #expect(throws: ConfigurationError.self) { try environment(value) }
    }

    @Test(arguments: ["https://api.example.com/api", "https://api.example.com/api/"])
    func preservesIngressPrefix(_ value: String) throws {
        #expect(try environment(value).healthURL.absoluteString == "https://api.example.com/api/health")
    }

    @Test func healthUsesPublicGETAndDecodesNestEnvelope() async throws {
        let transport = StubTransport()
        let result = try await HealthClient(environment: environment(), transport: transport).check()
        #expect(result.isHealthy)
        #expect(result.uptime == 123.5)
        let request = try #require(await transport.requests.first)
        #expect(request.url?.absoluteString == "https://api.example.com/health")
        #expect(request.httpMethod == "GET")
        #expect(request.value(forHTTPHeaderField: "Accept") == "application/json")
        #expect(request.value(forHTTPHeaderField: "Authorization") == nil)
        #expect(request.value(forHTTPHeaderField: "Cookie") == nil)
        #expect(request.timeoutInterval == 15)
    }

    @Test(arguments: [301, 401, 429, 500, 503])
    func rejectsHTTPFailures(_ status: Int) async throws {
        let client = HealthClient(environment: try environment(), transport: StubTransport(status: status))
        await #expect(throws: HTTPError.self) { try await client.check() }
    }

    @Test(arguments: ["{}", "<html>Proxy error</html>", "{\"success\":true,\"data\":null}", "{\"success\":false,\"data\":{\"status\":\"ok\",\"database\":\"up\",\"uptime\":1,\"timestamp\":\"now\"}}"])
    func rejectsInvalidPayload(_ json: String) async throws {
        let client = HealthClient(environment: try environment(), transport: StubTransport(data: Data(json.utf8)))
        await #expect(throws: HTTPError.self) { try await client.check() }
    }

    @Test @MainActor func databaseDownIsNotHealthy() async throws {
        let json = String(decoding: healthyJSON, as: UTF8.self).replacingOccurrences(of: "\"up\"", with: "\"down\"")
        let model = HealthViewModel(client: HealthClient(environment: try environment(), transport: StubTransport(data: Data(json.utf8))))
        await model.check()
        #expect(model.state == .degraded)
    }

    @Test @MainActor func networkStates() async {
        let scenarios: [(URLError.Code, HealthViewModel.State)] = [
            (.notConnectedToInternet, .offline), (.networkConnectionLost, .offline),
            (.timedOut, .timeout), (.cancelled, .idle), (.secureConnectionFailed, .failed)
        ]
        for (code, expected) in scenarios {
            let model = HealthViewModel(client: FailingHealth(error: URLError(code)))
            await model.check()
            #expect(model.state == expected)
        }
    }

    @Test @MainActor func retryRecoversAfterTimeout() async {
        let model = HealthViewModel(client: RetryHealth())
        await model.check()
        #expect(model.state == .timeout)
        await model.check()
        guard case .reachable = model.state else { Issue.record("Expected success after manual retry"); return }
    }

    @Test @MainActor func cancellationResetsLoadingAndSuppressesDuplicate() async {
        let model = HealthViewModel(client: SlowHealth())
        let task = Task { await model.check() }
        while model.state != .loading { await Task.yield() }
        await model.check() // Must return immediately while the first request is loading.
        #expect(model.state == .loading)
        task.cancel()
        await task.value
        #expect(model.state == .idle)
    }

    @Test func transportRejectsHTTP() async {
        let transport = URLSessionTransport()
        await #expect(throws: TransportError.self) {
            try await transport.send(URLRequest(url: URL(string: "http://api.example.com/health")!))
        }
    }
}

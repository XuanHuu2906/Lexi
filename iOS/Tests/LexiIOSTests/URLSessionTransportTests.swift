import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import Testing
@testable import LexiIOS

// URL-based behavior keeps parallel tests isolated without shared mutable handlers.
private final class HealthURLProtocol: URLProtocol {
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        switch request.url!.lastPathComponent {
        case "offline": client?.urlProtocol(self, didFailWithError: URLError(.notConnectedToInternet))
        case "timeout": client?.urlProtocol(self, didFailWithError: URLError(.timedOut))
        default:
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: ["Content-Type": "application/json"])!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: Data("health".utf8))
            client?.urlProtocolDidFinishLoading(self)
        }
    }
    override func stopLoading() {}
}

struct URLSessionTransportTests {
    private func transport() -> URLSessionTransport {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [HealthURLProtocol.self]
        return URLSessionTransport(session: URLSession(configuration: config))
    }

    @Test func returnsHTTPDataThroughURLSession() async throws {
        let request = URLRequest(url: URL(string: "https://test.example/health")!)
        let (data, response) = try await transport().send(request)
        #expect(response.statusCode == 200)
        #expect(data == Data("health".utf8))
    }

    @Test(arguments: ["offline", "timeout"])
    func propagatesNetworkError(_ path: String) async throws {
        let request = URLRequest(url: URL(string: "https://test.example/\(path)")!)
        do {
            _ = try await transport().send(request)
            Issue.record("Expected URLSession error")
        } catch let error as URLError {
            #expect(error.code == (path == "offline" ? .notConnectedToInternet : .timedOut))
        }
    }
}

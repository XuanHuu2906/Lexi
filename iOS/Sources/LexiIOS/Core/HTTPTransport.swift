import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

protocol HTTPTransport: Sendable {
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse)
    func upload(_ request: URLRequest, fromFile file: URL) async throws -> (Data, HTTPURLResponse)
}
extension HTTPTransport {
    // Test/read-only transports must explicitly opt in to file upload.
    func upload(_ request: URLRequest, fromFile file: URL) async throws -> (Data, HTTPURLResponse) {
        throw TransportError.invalidResponse
    }
}

enum TransportError: Error { case invalidResponse, insecureURL }

private final class HTTPSRedirectDelegate: NSObject, URLSessionTaskDelegate, Sendable {
    func urlSession(_ session: URLSession, task: URLSessionTask,
                    willPerformHTTPRedirection response: HTTPURLResponse,
                    newRequest request: URLRequest,
                    completionHandler: @escaping @Sendable (URLRequest?) -> Void) {
        // Keep health checks on the configured origin, never downgrade to HTTP.
        let original = task.originalRequest?.url
        let allowed = task.originalRequest?.httpMethod == "GET" && request.url?.scheme == "https"
            && request.url?.host == original?.host
            && request.url?.port == original?.port
        completionHandler(allowed ? request : nil)
    }
}

final class URLSessionTransport: HTTPTransport {
    private let session: URLSession

    init() {
        let config = URLSessionConfiguration.ephemeral
        config.timeoutIntervalForRequest = 15
        config.timeoutIntervalForResource = RequestTimeout.audio.rawValue
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        config.urlCache = nil
        config.httpCookieStorage = nil
        config.httpShouldSetCookies = false
        config.urlCredentialStorage = nil
        session = URLSession(configuration: config, delegate: HTTPSRedirectDelegate(), delegateQueue: nil)
    }

    // Injection seam for URLProtocol tests; production uses the hardened configuration above.
    init(session: URLSession) { self.session = session }

    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        guard request.url?.scheme == "https" else { throw TransportError.insecureURL }
        try Task.checkCancellation()
        let (data, response) = try await session.data(for: request)
        try Task.checkCancellation()
        guard let response = response as? HTTPURLResponse else { throw TransportError.invalidResponse }
        return (data, response)
    }

    func upload(_ request: URLRequest, fromFile file: URL) async throws -> (Data, HTTPURLResponse) {
        guard request.url?.scheme == "https", file.isFileURL else { throw TransportError.insecureURL }
        try Task.checkCancellation()
        let (data, response) = try await session.upload(for: request, fromFile: file)
        try Task.checkCancellation()
        guard let response = response as? HTTPURLResponse else { throw TransportError.invalidResponse }
        return (data, response)
    }

    deinit { session.invalidateAndCancel() }
}

import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

enum HTTPMethod: String, Sendable { case get = "GET", post = "POST", patch = "PATCH", delete = "DELETE" }
enum RequestTimeout: TimeInterval, Sendable { case read = 15, ai = 90, audio = 120 }
enum RetryPolicy: Sendable { case none, safeReadOnce }

struct APIEndpoint<Response: Decodable & Sendable>: Sendable {
    let path: [String]
    var method: HTTPMethod = .get
    var query: [URLQueryItem] = []
    var headers: [String: String] = [:]
    var body: Data? = nil
    var requiresAuth = true
    var timeout: RequestTimeout = .read
    var retry: RetryPolicy = .none

    func json<Body: Encodable>(_ value: Body) throws -> Self {
        var copy = self
        do { copy.body = try APIJSON.encoder().encode(value) }
        catch { throw HTTPError.encoding }
        return copy
    }

    func request(baseURL: URL, token: String?, requestID: String?) throws -> URLRequest {
        guard !path.isEmpty,
              var parts = URLComponents(url: baseURL, resolvingAgainstBaseURL: false),
              parts.scheme == "https", parts.host != nil,
              parts.user == nil, parts.password == nil,
              parts.query == nil, parts.fragment == nil,
              !parts.percentEncodedPath.contains("//") else { throw HTTPError.invalidRequest }
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~")
        let encoded = try path.map { segment in
            guard !segment.isEmpty, segment != ".", segment != "..",
                  !segment.unicodeScalars.contains(where: { CharacterSet.controlCharacters.contains($0) }),
                  let value = segment.addingPercentEncoding(withAllowedCharacters: allowed) else { throw HTTPError.invalidRequest }
            return value
        }
        let prefix = parts.percentEncodedPath.hasSuffix("/") ? String(parts.percentEncodedPath.dropLast()) : parts.percentEncodedPath
        parts.percentEncodedPath = prefix + "/" + encoded.joined(separator: "/")
        parts.queryItems = query.isEmpty ? nil : query
        guard let url = parts.url else { throw HTTPError.invalidRequest }
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.timeoutInterval = timeout.rawValue
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.httpShouldHandleCookies = false
        request.httpBody = body
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if body != nil { request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        for (name, value) in headers {
            // Header credentials, cookies and origin are owned by the client.
            guard !["authorization", "cookie", "host", "content-length", "x-request-id"].contains(name.lowercased()),
                  !name.isEmpty, name.unicodeScalars.allSatisfy({ allowed.contains($0) }),
                  !value.contains("\r"), !value.contains("\n") else { throw HTTPError.invalidRequest }
            request.setValue(value, forHTTPHeaderField: name)
        }
        if requiresAuth {
            guard let token, !token.isEmpty,
                  !token.unicodeScalars.contains(where: { CharacterSet.whitespacesAndNewlines.union(.controlCharacters).contains($0) }) else {
                throw HTTPError.unauthorized(nil)
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let requestID {
            guard UUID(uuidString: requestID) != nil else { throw HTTPError.invalidRequest }
            request.setValue(requestID, forHTTPHeaderField: "X-Request-ID")
        }
        return request
    }
}

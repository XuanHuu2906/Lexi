import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

struct AccessCredential: Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    let token: String?
    let sessionID: UUID?
    var revision: UInt64 = 0
    var description: String { "AccessCredential(redacted)" }
    var debugDescription: String { description }
}
protocol TokenProvider: Sendable {
    func accessToken() async throws -> String?
    func credential() async throws -> AccessCredential
    func refresh(rejected: AccessCredential) async throws -> AccessCredential
    func validate(_ credential: AccessCredential) async throws
    func reject(_ credential: AccessCredential) async throws
}
extension TokenProvider {
    func credential() async throws -> AccessCredential { AccessCredential(token: try await accessToken(), sessionID: nil) }
    func refresh(rejected: AccessCredential) async throws -> AccessCredential { throw HTTPError.unauthorized(nil) }
    func validate(_ credential: AccessCredential) async throws {}
    func reject(_ credential: AccessCredential) async throws {}
}
struct NoTokenProvider: TokenProvider { func accessToken() async throws -> String? { nil } }

protocol APIClock: Sendable {
    func now() -> Date
    func sleep(seconds: TimeInterval) async throws
}
struct SystemAPIClock: APIClock {
    func now() -> Date { Date() }
    func sleep(seconds: TimeInterval) async throws { try await Task.sleep(for: .seconds(seconds)) }
}

struct APIClient: Sendable {
    let environment: AppEnvironment
    let transport: any HTTPTransport
    var tokens: any TokenProvider = NoTokenProvider()
    var clock: any APIClock = SystemAPIClock()
    // Opt in only after the server/ingress supports tracing this header.
    var sendsRequestID = false

    func send<Response>(_ endpoint: APIEndpoint<Response>) async throws -> Response {
        do {
            try Task.checkCancellation()
            var credential = endpoint.requiresAuth ? try await tokens.credential() : AccessCredential(token: nil, sessionID: nil)
            let requestID = sendsRequestID ? UUID().uuidString : nil
            var attempts = 0
            var refreshed = false
            while true {
                do {
                    try Task.checkCancellation()
                    if endpoint.requiresAuth { try await tokens.validate(credential) }
                    let request = try endpoint.request(baseURL: environment.apiBaseURL, token: credential.token, requestID: requestID)
                    let (data, response) = try await transport.send(request)
                    try Task.checkCancellation()
                    if endpoint.requiresAuth { try await tokens.validate(credential) }
                    if response.statusCode == 401 && endpoint.requiresAuth {
                        guard !refreshed else {
                            try await tokens.reject(credential)
                            throw HTTPError.unauthorized(nil)
                        }
                        refreshed = true
                        credential = try await tokens.refresh(rejected: credential)
                        continue
                    }
                    return try decode(data, response: response, as: Response.self)
                } catch let error as URLError where endpoint.method == .get
                    && endpoint.retry == .safeReadOnce && attempts == 0
                    && [.timedOut, .networkConnectionLost, .cannotConnectToHost].contains(error.code) {
                    attempts += 1
                    try await clock.sleep(seconds: 0.3)
                }
            }
        } catch is CancellationError { throw HTTPError.cancellation }
        catch let error as URLError {
            switch error.code {
            case .cancelled: throw HTTPError.cancellation
            case .timedOut: throw HTTPError.timeout
            default: throw HTTPError.network(error.code.rawValue)
            }
        } catch let error as HTTPError { throw error }
        catch let error as TransportError {
            switch error {
            case .invalidResponse: throw HTTPError.invalidResponse
            case .insecureURL: throw HTTPError.invalidRequest
            }
        }
    }

    private func decode<Response: Decodable & Sendable>(_ data: Data, response: HTTPURLResponse, as: Response.Type) throws -> Response {
        let status = response.statusCode
        guard (200..<300).contains(status) else {
            // A proxy may send HTML or no body. HTTP status remains authoritative.
            let payload = try? APIJSON.decoder().decode(APIErrorPayload.self, from: data)
            switch status {
            case 401: throw HTTPError.unauthorized(payload)
            case 403: throw HTTPError.forbidden(payload)
            case 404: throw HTTPError.notFound(payload)
            case 409: throw HTTPError.conflict(payload)
            case 400, 422: throw HTTPError.validation(status, payload)
            case 429: throw HTTPError.rateLimit(retryAfter: retryAfter(response.value(forHTTPHeaderField: "Retry-After")), payload: payload)
            case 500...599: throw HTTPError.server(status, payload)
            default: throw HTTPError.unexpectedStatus(status, payload)
            }
        }
        if status == 204 {
            guard let empty = EmptyResponse() as? Response else { throw HTTPError.decoding }
            return empty
        }
        do {
            let envelope = try APIJSON.decoder().decode(APIEnvelope<Response>.self, from: data)
            guard envelope.success else { throw HTTPError.invalidResponse }
            return envelope.data
        } catch let error as HTTPError { throw error }
        catch { throw HTTPError.decoding }
    }

    private func retryAfter(_ header: String?) -> TimeInterval? {
        guard let header else { return nil }
        let value = header.trimmingCharacters(in: .whitespacesAndNewlines)
        if let seconds = TimeInterval(value), seconds.isFinite, seconds >= 0 { return seconds }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        guard let date = formatter.date(from: value) else { return nil }
        return max(0, date.timeIntervalSince(clock.now()))
    }
}

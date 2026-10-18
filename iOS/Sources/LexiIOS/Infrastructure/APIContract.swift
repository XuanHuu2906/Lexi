import Foundation

struct APIEnvelope<Value: Decodable & Sendable>: Decodable, Sendable {
    let success: Bool
    let data: Value
}

struct APIErrorPayload: Decodable, Equatable, Sendable {
    enum Message: Decodable, Equatable, Sendable {
        case text(String), list([String])
        init(from decoder: any Decoder) throws {
            let value = try decoder.singleValueContainer()
            if let text = try? value.decode(String.self) { self = .text(text) }
            else { self = .list(try value.decode([String].self)) }
        }
        var messages: [String] {
            switch self { case .text(let value): [value]; case .list(let values): values }
        }
    }
    let success: Bool
    let statusCode: Int
    let message: Message
    let error: String
    let path: String
    let timestamp: String
}

enum HTTPError: Error, Equatable, Sendable, CustomStringConvertible {
    case invalidRequest, invalidResponse, encoding, decoding, cancellation
    case network(Int), timeout
    case unauthorized(APIErrorPayload?), forbidden(APIErrorPayload?)
    case notFound(APIErrorPayload?), conflict(APIErrorPayload?)
    case validation(Int, APIErrorPayload?)
    case rateLimit(retryAfter: TimeInterval?, payload: APIErrorPayload?)
    case server(Int, APIErrorPayload?), unexpectedStatus(Int, APIErrorPayload?)

    // Safe diagnostic category; never stringify response bodies or credentials.
    var description: String {
        switch self {
        case .invalidRequest: "invalidRequest"
        case .invalidResponse: "invalidResponse"
        case .encoding: "encoding"
        case .decoding: "decoding"
        case .cancellation: "cancellation"
        case .network(let code): "network(\(code))"
        case .timeout: "timeout"
        case .unauthorized: "unauthorized"
        case .forbidden: "forbidden"
        case .notFound: "notFound"
        case .conflict: "conflict"
        case .validation(let status, _): "validation(\(status))"
        case .rateLimit: "rateLimit"
        case .server(let status, _): "server(\(status))"
        case .unexpectedStatus(let status, _): "unexpectedStatus(\(status))"
        }
    }
}

struct EmptyResponse: Decodable, Sendable, Equatable {
    init() {}
    private enum CodingKeys: CodingKey {}
    init(from decoder: any Decoder) throws {
        // Synthesized decoding for a fieldless struct also accepts null/scalars.
        // A JSON response must still be an object; bare 204 is handled by APIClient.
        _ = try decoder.container(keyedBy: CodingKeys.self)
    }
}

enum APIJSON {
    static func decoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let raw = try container.decode(String.self)
            guard let date = APIDate.parse(raw) else {
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid ISO-8601 timestamp")
            }
            return date
        }
        return decoder
    }
    static func encoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.sortedKeys]
        return encoder
    }
}

enum APIDate {
    // DTOs retain raw timestamps; conversion is explicit and never fabricates dates.
    static func parse(_ raw: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: raw) { return date }
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: raw)
    }
}

// Use for fields where missing and explicit JSON null carry different meaning.
enum JSONField<Value: Decodable & Equatable & Sendable>: Equatable, Sendable {
    case missing, null, value(Value)
}

extension KeyedDecodingContainer {
    func field<T: Decodable & Equatable & Sendable>(_ type: T.Type, forKey key: Key) throws -> JSONField<T> {
        guard contains(key) else { return .missing }
        if try decodeNil(forKey: key) { return .null }
        return .value(try decode(type, forKey: key))
    }
}

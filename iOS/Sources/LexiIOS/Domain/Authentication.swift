import Foundation

// Native JSON contract in docs/contracts/mobile-api.md section 5.
// Credentials never participate in diagnostic descriptions.
struct MobileCredentials: Encodable, Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    let email: String
    let password: String
    var description: String { "MobileCredentials(redacted)" }
    var debugDescription: String { description }
}

struct MobileAuthResult: Decodable, Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    let user: ApiUser
    let accessToken: String
    let refreshToken: String
    let accessExpiresIn: Int
    var description: String { "MobileAuthResult(redacted)" }
    var debugDescription: String { description }
}

struct MobileRefreshResult: Decodable, Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    let accessToken: String
    let refreshToken: String
    let accessExpiresIn: Int
    var description: String { "MobileRefreshResult(redacted)" }
    var debugDescription: String { description }
}

struct LogoutResult: Decodable, Sendable { let message: String }

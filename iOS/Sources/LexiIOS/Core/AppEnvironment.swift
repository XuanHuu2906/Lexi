import Foundation

enum ConfigurationError: Error, Equatable {
    case missingBaseURL, invalidBaseURL, invalidFlavor
}

struct AppEnvironment: Sendable {
    enum Flavor: String, Sendable { case development, staging, production }
    let apiBaseURL: URL
    let flavor: Flavor

    init(baseURL: String, flavor: Flavor) throws {
        let value = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { throw ConfigurationError.missingBaseURL }
        guard let parts = URLComponents(string: value),
              parts.scheme?.lowercased() == "https",
              let host = parts.host?.lowercased(), !host.isEmpty,
              !["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"].contains(host),
              !host.hasSuffix(".localhost"),
              parts.user == nil, parts.password == nil,
              parts.query == nil, parts.fragment == nil,
              let url = parts.url else { throw ConfigurationError.invalidBaseURL }
        self.apiBaseURL = url
        self.flavor = flavor
    }

    static func load(bundle: Bundle = .main) throws -> Self {
        guard let flavor = Flavor(rawValue: bundle.object(forInfoDictionaryKey: "LexiBuildFlavor") as? String ?? "") else {
            throw ConfigurationError.invalidFlavor
        }
        return try Self(baseURL: bundle.object(forInfoDictionaryKey: "LexiAPIBaseURL") as? String ?? "", flavor: flavor)
    }

    var healthURL: URL { apiBaseURL.appendingPathComponent("health") }
}

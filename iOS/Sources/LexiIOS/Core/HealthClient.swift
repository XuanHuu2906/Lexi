import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

struct HealthResponse: Decodable, Equatable, Sendable {
    let status: String
    let database: String
    let uptime: Double
    let timestamp: String

    var isHealthy: Bool { status == "ok" && database == "up" }
}

protocol HealthChecking: Sendable {
    func check() async throws -> HealthResponse
}

struct HealthClient: HealthChecking {
    let client: APIClient

    init(environment: AppEnvironment, transport: any HTTPTransport) {
        client = APIClient(environment: environment, transport: transport)
    }

    init(client: APIClient) { self.client = client }

    func check() async throws -> HealthResponse {
        try await client.send(APIEndpoint<HealthResponse>(path: ["health"], requiresAuth: false))
    }
}

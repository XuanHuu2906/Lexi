import Foundation
import Observation

@MainActor @Observable
final class HealthViewModel {
    enum State: Equatable {
        case idle, loading, reachable(HealthResponse), degraded, offline, timeout, failed
        case rateLimited(until: Date?)
    }
    private(set) var state: State = .idle
    private let client: any HealthChecking
    private let clock: any APIClock

    init(client: any HealthChecking, clock: any APIClock = SystemAPIClock()) {
        self.client = client
        self.clock = clock
    }

    func check() async {
        guard state != .loading else { return }
        if case .rateLimited(let until) = state, let until, until > clock.now() { return }
        state = .loading
        do {
            let response = try await client.check()
            try Task.checkCancellation()
            state = response.isHealthy ? .reachable(response) : .degraded
        } catch is CancellationError {
            state = .idle
        } catch let error as HTTPError {
            switch error {
            case .cancellation: state = .idle
            case .timeout: state = .timeout
            case .rateLimit(let seconds, _): state = .rateLimited(until: seconds.map { clock.now().addingTimeInterval($0) })
            case .network(URLError.notConnectedToInternet.rawValue), .network(URLError.networkConnectionLost.rawValue): state = .offline
            default: state = .failed
            }
        } catch let error as URLError {
            switch error.code {
            case .cancelled: state = .idle
            case .timedOut: state = .timeout
            case .notConnectedToInternet, .networkConnectionLost: state = .offline
            default: state = .failed
            }
        } catch {
            state = .failed
        }
    }
}

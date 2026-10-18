import Foundation
import Observation

struct DashboardSnapshot: Sendable {
    let stats: Stats
    let streak: Streak
    let badges: BadgesResult
    let due: DueReviews
}

protocol DashboardLoading: Sendable {
    func load() async throws -> DashboardSnapshot
}

struct DashboardRepository: DashboardLoading {
    let api: LexiAPI
    func load() async throws -> DashboardSnapshot {
        async let stats = api.stats.overview()
        async let streak = api.stats.streak()
        async let badges = api.stats.badges()
        async let due = api.review.due(limit: 1)
        return try await DashboardSnapshot(stats: stats, streak: streak, badges: badges, due: due)
    }
}

@MainActor @Observable
final class DashboardViewModel {
    private(set) var snapshot: DashboardSnapshot?
    private(set) var phase: LoadPhase = .idle
    private(set) var feedback: FeatureFeedback?
    private let repository: any DashboardLoading
    private var operation = UUID()

    init(repository: any DashboardLoading) { self.repository = repository }

    func invalidate() {
        operation = UUID()
        phase = snapshot == nil ? .idle : .stale
    }

    func refresh() async {
        guard feedback?.canRetry() != false else { return }
        let id = UUID(); operation = id
        phase = .loading; feedback = nil
        defer {
            if operation == id, phase == .loading { phase = snapshot == nil ? .idle : .stale }
        }
        do {
            let result = try await repository.load()
            try Task.checkCancellation()
            guard operation == id else { return }
            snapshot = result
            phase = result.stats.totalWords == 0 ? .empty : .loaded
        } catch {
            guard operation == id, !isCancellation(error) else { return }
            feedback = FeatureFeedback(error)
            phase = snapshot == nil ? .failed : .stale
        }
    }
}

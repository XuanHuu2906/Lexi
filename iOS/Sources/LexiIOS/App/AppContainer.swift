import Foundation

@MainActor
struct AppContainer {
    let environment: AppEnvironment?
    let health: HealthViewModel?
    let api: LexiAPI?
    let session: SessionViewModel?

    init(environment: AppEnvironment, transport: any HTTPTransport = URLSessionTransport()) {
        self.environment = environment
        let publicClient = APIClient(environment: environment, transport: transport)
        let store = DeviceKeychainStore(service: "app.lexi.ios.refresh." + environment.apiBaseURL.absoluteString)
        let actor = SessionActor(auth: AuthAPI(client: publicClient), store: store)
        let api = LexiAPI(client: APIClient(environment: environment, transport: transport, tokens: actor))
        self.api = api
        self.session = SessionViewModel(session: actor, api: api.auth)
        self.health = HealthViewModel(client: api)
    }

    private init() { environment = nil; health = nil; api = nil; session = nil }

    static func live() -> Self {
        guard let environment = try? AppEnvironment.load() else { return Self() }
        return Self(environment: environment)
    }
}

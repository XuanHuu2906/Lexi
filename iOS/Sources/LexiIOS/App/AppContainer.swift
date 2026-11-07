import Foundation

@MainActor
struct AppContainer {
    let environment: AppEnvironment?
    let health: HealthViewModel?
    let api: LexiAPI?
    let session: SessionViewModel?
    let privacy: PrivacyPreferences?

    init(environment: AppEnvironment, transport: any HTTPTransport = URLSessionTransport()) {
        self.environment = environment
        let privacy = PrivacyPreferences(origin: environment.apiBaseURL.absoluteString,
            aiEnabled: Bundle.main.object(forInfoDictionaryKey: "LexiAIEnabled") as? Bool ?? true,
            audioEnabled: Bundle.main.object(forInfoDictionaryKey: "LexiAudioEnabled") as? Bool ?? true)
        self.privacy = privacy
        let publicClient = APIClient(environment: environment, transport: transport, privacy: privacy)
        let store = DeviceKeychainStore(service: "app.lexi.ios.refresh." + environment.apiBaseURL.absoluteString)
        let actor = SessionActor(auth: AuthAPI(client: publicClient), store: store)
        let api = LexiAPI(client: APIClient(environment: environment, transport: transport, tokens: actor, privacy: privacy))
        self.api = api
        let profileStore = OfflineProfileStore(keychain: DeviceKeychainStore(
            service: "app.lexi.ios.offline-profile." + environment.apiBaseURL.absoluteString))
        self.session = SessionViewModel(session: actor, api: api.auth, offlineProfile: profileStore, privacy: privacy)
        self.health = HealthViewModel(client: api)
    }

    private init() { environment = nil; health = nil; api = nil; session = nil; privacy = nil }

    static func live() -> Self {
        guard let environment = try? AppEnvironment.load() else { return Self() }
        return Self(environment: environment)
    }
}

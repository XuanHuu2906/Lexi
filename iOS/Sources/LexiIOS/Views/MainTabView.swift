#if os(iOS)
import SwiftUI

struct MainTabView: View {
    let model: SessionViewModel
    let me: ApiMe
    @Bindable var navigation: AppNavigation
    let api: LexiAPI
    @State private var features: LearningFeatures
    @State private var study: StudyFeatures
    @State private var ai: AIFeatures
    @State private var audio: AudioFeatures
    private let reminders = LocalReminderService.shared
    @Environment(\.scenePhase) private var scenePhase
    @State private var savingLookup = false

    init(model: SessionViewModel, me: ApiMe, navigation: AppNavigation, api: LexiAPI) {
        self.model = model; self.me = me; self.navigation = navigation; self.api = api
        let features = LearningFeatures(api: api)
        _features = State(initialValue: features)
        _study = State(initialValue: StudyFeatures(api: api, userID: me.id, changed: features.invalidate))
        _ai = State(initialValue: AIFeatures(api: api, userID: me.id))
        _audio = State(initialValue: AudioFeatures(api: api))
    }

    var body: some View {
        TabView(selection: $navigation.selectedTab) {
            ForEach(MainTab.allCases, id: \.self) { tab in
                NavigationStack(path: path(for: tab)) {
                    page(for: tab)
                        .navigationTitle(tab.title)
                        .navigationDestination(for: AppRoute.self) { destination($0) }
                }
                .tabItem { Label(tab.title, systemImage: tab.symbol) }
                .tag(tab)
            }
        }
        .privacySensitive()
        .task {
            savingLookup = model.pendingLookup != nil
            await reminders.reconcile(userID: me.id, draft: me.setting.map(SettingsDraft.init))
        }
        .onDisappear {
            Task { await reminders.deactivate(userID: me.id) }
            audio.deactivate()
            if case .signedOut = model.state { study.deactivate(clear: true); ai.deactivate(clear: true) }
            else { study.deactivate(clear: false); ai.deactivate(clear: false) }
        }
        .onChange(of: scenePhase) { _, phase in if phase != .active { ai.suspend() } }
        .onChange(of: scenePhase) { _, phase in if phase == .background { audio.suspend() } }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                Task {
                    // Re-fetch account preferences on foreground, not in background;
                    // never overwrite an unsaved Settings form just to reschedule.
                    if !features.settings.dirty { await features.settings.load() }
                    await reminders.reconcile(userID: me.id,
                        draft: features.settings.baseline ?? me.setting.map(SettingsDraft.init))
                }
            }
        }
        .sheet(isPresented: $savingLookup, onDismiss: { model.pendingLookup = nil }) {
            if let input = model.pendingLookup {
                AddWordSheet(api: api.words, input: input, changed: features.invalidate)
            }
        }
    }

    private func path(for tab: MainTab) -> Binding<[AppRoute]> {
        Binding(get: { navigation.paths[tab, default: []] }, set: { navigation.paths[tab] = $0 })
    }
    private var audioLocale: String {
        (features.settings.loaded ? features.settings.draft.ttsVoice : me.setting?.ttsVoice ?? .enUS).localeIdentifier
    }

    @ViewBuilder private func page(for tab: MainTab) -> some View {
        switch tab {
        case .home:
            DashboardView(model: features.dashboard, email: me.email, navigation: navigation, revision: features.revision)
        case .vocabulary:
            WordListView(model: features.words, api: api.words, session: model, revision: features.revision, changed: features.invalidate)
        case .review:
            ReviewView(model: study.review, navigation: navigation,
                       locale: audioLocale)
        case .learn:
            LearnHomeView()
        case .settings:
            SettingsView(model: features.settings, session: model, email: me.email,
                         userID: me.id, reminders: reminders, changed: features.invalidate)
        }
    }

    @ViewBuilder private func destination(_ route: AppRoute) -> some View {
        switch route {
        case .word(let id):
            WordDetailView(id: id, api: api.words, locale: audioLocale, changed: features.invalidate)
        case .quizHome:
            QuizView(model: study.quiz)
        case .quiz(let id):
            QuizView(model: study.quiz, requestedID: id)
        case .flashcards:
            FlashcardsView(model: study.flashcards, locale: audioLocale)
        case .tutor:
            TutorChatView(model: ai.tutor, api: api.words, grammar: ai.grammar, changed: features.invalidate)
        case .grammarQA:
            TutorChatView(model: ai.grammarQA, api: api.words, grammar: ai.grammar, changed: features.invalidate)
        case .grammarLibrary:
            GrammarListView(model: ai.grammar)
        case .grammarRule(let id):
            GrammarDetailView(model: ai.grammar, id: id)
        case .writing:
            WritingView(model: ai.writing)
        case .context:
            ContextAnalysisView(model: ai.context, api: api.words, changed: features.invalidate)
        case .conversation:
            ConversationView(model: ai.conversation)
        case .pronunciation:
            PronunciationView(model: audio.pronunciation, locale: audioLocale)
        case .dictation:
            DictationView(model: audio.dictation, locale: audioLocale)
        case .about:
            LexiPage {
                LexiCard {
                    Text("Lexi").font(LexiTypography.hero).accessibilityAddTraits(.isHeader)
                    Text("Mỗi ngày một chút, tiếng Anh tiến xa.")
                    Text("Bản phát triển dành cho iPhone. Các tính năng học tập đang được hoàn thiện.")
                        .foregroundStyle(LexiColors.textSecondary)
                }
            }.navigationTitle("Về Lexi")
        }
    }
}

#endif

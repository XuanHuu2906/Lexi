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
    private let offlineCache: OfflineNotebookCache
    private let reminders = LocalReminderService.shared
    @Environment(\.scenePhase) private var scenePhase
    @State private var savingLookup = false
    @State private var confirmingOfflineLogout = false

    init(model: SessionViewModel, me: ApiMe, navigation: AppNavigation, api: LexiAPI) {
        self.model = model; self.me = me; self.navigation = navigation; self.api = api
        let cache = OfflineNotebookCache(namespace: api.client.environment.apiBaseURL.absoluteString + "|" + me.id)
        offlineCache = cache
        let features = LearningFeatures(api: api, cache: cache)
        _features = State(initialValue: features)
        _study = State(initialValue: StudyFeatures(api: api, userID: me.id,
                                                   changed: features.invalidate, cache: cache))
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
        .safeAreaInset(edge: .top) {
            if model.offlineSession {
                HStack(spacing: 12) {
                    Label("Đang offline · Chỉ xem dữ liệu đã lưu", systemImage: "wifi.slash")
                        .font(.caption)
                    Spacer(minLength: 4)
                    Button("Kết nối lại") { Task { await model.restore(force: true) } }
                        .font(.caption.weight(.semibold))
                        .disabled(model.busy)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(LexiColors.cloud100)
                .accessibilityIdentifier("offline-session-banner")
            }
        }
        .privacySensitive()
        .confirmationDialog("Đăng xuất và xóa dữ liệu offline trên thiết bị?", isPresented: $confirmingOfflineLogout,
                            titleVisibility: .visible) {
            Button("Đăng xuất", role: .destructive) { Task { await model.logout() } }
            Button("Hủy", role: .cancel) {}
        }
        .task {
            savingLookup = model.pendingLookup != nil && !model.offlineSession
            await reminders.reconcile(userID: me.id, draft: me.setting.map(SettingsDraft.init))
        }
        .onDisappear {
            if navigation.ownerID != me.id {
                Task { await offlineCache.close(clear: true) }
            }
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
                    guard !model.offlineSession else { return }
                    // Re-fetch account preferences on foreground, not in background;
                    // never overwrite an unsaved Settings form just to reschedule.
                    if !features.settings.dirty { await features.settings.load() }
                    await reminders.reconcile(userID: me.id,
                        draft: features.settings.baseline ?? me.setting.map(SettingsDraft.init))
                }
            }
        }
        .onChange(of: model.offlineSession) { _, offline in
            if offline { savingLookup = false }
        }
        .sheet(isPresented: $savingLookup, onDismiss: { model.pendingLookup = nil }) {
            if !model.offlineSession, let input = model.pendingLookup {
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
        if model.offlineSession {
            switch tab {
            case .vocabulary:
                WordListView(model: features.words, api: api.words, session: model,
                             revision: features.revision, changed: features.invalidate, offlineOnly: true)
            case .review:
                FlashcardsView(model: study.flashcards, locale: audioLocale, offlineOnly: true)
            case .settings:
                LexiPage {
                    LexiCard {
                        Label("Chế độ học offline", systemImage: "wifi.slash")
                            .font(LexiTypography.heading)
                        Text("Phiên đã xác thực trước đây đang được dùng tạm để xem dữ liệu đã lưu. Kết nối Internet để xác minh lại tài khoản và cập nhật bài học.")
                        LexiButton(title: "Kiểm tra lại kết nối", isLoading: model.busy) {
                            Task { await model.restore(force: true) }
                        }
                        LexiButton(title: "Đăng xuất khỏi thiết bị", variant: .destructive,
                                   isLoading: model.busy) {
                            confirmingOfflineLogout = true
                        }
                    }
                }
            case .home, .learn:
                LexiPage {
                    LexiCard {
                        Text("Học offline").font(LexiTypography.title)
                        Text("Chỉ có sổ từ đã tải và thẻ ghi nhớ. Không chấm phát âm, dùng AI hay cập nhật lịch ôn khi chưa xác minh lại phiên.")
                        LexiButton(title: "Mở từ vựng") { navigation.selectedTab = .vocabulary }
                        LexiButton(title: "Luyện Flashcards", variant: .secondary) {
                            navigation.selectedTab = .review
                        }
                    }
                }
            }
        } else {
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
                         userID: me.id, reminders: reminders, offlineCache: offlineCache,
                         changed: features.invalidate)
        }
        }
    }

    @ViewBuilder private func destination(_ route: AppRoute) -> some View {
        if model.offlineSession {
            LexiPage {
                EmptyState(title: "Tính năng cần kết nối mạng",
                           message: "Phiên hiện ở chế độ offline chỉ đọc. Chọn Từ vựng hoặc Ôn tập để sử dụng nội dung đã lưu.",
                           symbol: "wifi.slash")
            }
        } else {
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
}

#endif

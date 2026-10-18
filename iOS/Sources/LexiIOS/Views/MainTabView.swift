#if os(iOS)
import SwiftUI

struct MainTabView: View {
    let model: SessionViewModel
    let me: ApiMe
    @Bindable var navigation: AppNavigation
    let api: LexiAPI
    @State private var features: LearningFeatures
    @State private var savingLookup = false

    init(model: SessionViewModel, me: ApiMe, navigation: AppNavigation, api: LexiAPI) {
        self.model = model; self.me = me; self.navigation = navigation; self.api = api
        _features = State(initialValue: LearningFeatures(api: api))
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
        .task { savingLookup = model.pendingLookup != nil }
        .sheet(isPresented: $savingLookup, onDismiss: { model.pendingLookup = nil }) {
            if let input = model.pendingLookup {
                AddWordSheet(api: api.words, input: input, changed: features.invalidate)
            }
        }
    }

    private func path(for tab: MainTab) -> Binding<[AppRoute]> {
        Binding(get: { navigation.paths[tab, default: []] }, set: { navigation.paths[tab] = $0 })
    }

    @ViewBuilder private func page(for tab: MainTab) -> some View {
        switch tab {
        case .home:
            DashboardView(model: features.dashboard, email: me.email, navigation: navigation, revision: features.revision)
        case .vocabulary:
            WordListView(model: features.words, api: api.words, session: model, revision: features.revision, changed: features.invalidate)
        case .review:
            LexiPage {
                if let data = features.dashboard.snapshot {
                    LexiCard {
                        Text("\(data.due.total) từ đến hạn ôn").font(LexiTypography.title)
                        if features.dashboard.phase == .stale || features.dashboard.phase == .loading {
                            Text("Số liệu lần tải trước; mở Trang chủ để cập nhật.").font(.caption)
                        }
                    }
                }
                LexiCard {
                    EmptyState(title: "Ôn một chút, nhớ lâu hơn", message: "Lịch ôn và bài kiểm tra sẽ được kết nối trong bản cập nhật tiếp theo.", symbol: tab.symbol)
                    NavigationLink(value: AppRoute.flashcards) { Label("Khám phá thẻ ghi nhớ", systemImage: "rectangle.on.rectangle") }
                        .buttonStyle(LexiButtonStyle(variant: .secondary))
                }
            }
        case .learn:
            LexiPage {
                LexiCard {
                    EmptyState(title: "Học theo cách của bạn", message: "Luyện hội thoại, viết và phát âm cùng Lexi đang được chuẩn bị.", symbol: tab.symbol)
                    NavigationLink(value: AppRoute.tutor) { Label("Tìm hiểu gia sư Lexi", systemImage: "bubble.left") }
                        .buttonStyle(LexiButtonStyle(variant: .secondary))
                }
            }
        case .settings: SettingsView(model: features.settings, session: model, email: me.email, changed: features.invalidate)
        }
    }

    @ViewBuilder private func destination(_ route: AppRoute) -> some View {
        switch route {
        case .word(let id):
            WordDetailView(id: id, api: api.words, changed: features.invalidate)
        case .quiz:
            FeaturePlaceholder(title: "Bài kiểm tra", message: "Bài kiểm tra đang được chuẩn bị.", symbol: "questionmark.circle")
                .navigationTitle("Bài kiểm tra")
        case .flashcards:
            FeaturePlaceholder(title: "Thẻ ghi nhớ", message: "Ôn tập hai mặt thẻ từ sổ từ của bạn. Tính năng này đang được chuẩn bị.", symbol: "rectangle.on.rectangle")
                .navigationTitle("Thẻ ghi nhớ")
        case .tutor:
            FeaturePlaceholder(title: "Gia sư Lexi", message: "Luyện tiếng Anh qua trò chuyện và giải thích theo trình độ của bạn. Tính năng này đang được chuẩn bị.", symbol: "bubble.left.and.bubble.right")
                .navigationTitle("Gia sư Lexi")
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

private struct FeaturePlaceholder: View {
    let title: String
    let message: String
    let symbol: String
    var body: some View {
        LexiPage { LexiCard { EmptyState(title: title, message: message, symbol: symbol) } }
    }
}

#endif

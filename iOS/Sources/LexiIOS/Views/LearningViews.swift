#if os(iOS)
import SwiftUI

struct FeatureErrorView: View {
    let feedback: FeatureFeedback
    var retry: (() -> Void)? = nil
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            VStack(spacing: LexiSpacing.md) {
                ErrorState(title: "Chưa thể hoàn tất", message: feedback.message)
                if let retry {
                    LexiButton(title: "Thử lại", variant: .secondary,
                               isDisabled: !feedback.canRetry(at: context.date), action: retry)
                }
            }
        }
        .accessibilityIdentifier("feature-feedback")
    }
}

struct DashboardView: View {
    let model: DashboardViewModel
    let email: String
    let navigation: AppNavigation
    let revision: Int
    @Environment(\.scenePhase) private var scenePhase
    @State private var attempt = 0

    var body: some View {
        LexiPage {
            Text("Chào bạn, cùng học với Lexi.").font(LexiTypography.hero).accessibilityAddTraits(.isHeader)
            Text(email).font(LexiTypography.secondary).foregroundStyle(LexiColors.textSecondary).textSelection(.enabled)
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if model.phase == .stale {
                FeedbackNotice(message: "Đang hiển thị dữ liệu lần tải trước. Kéo xuống để cập nhật.", symbol: "arrow.clockwise")
            }
            if model.phase == .loading, model.snapshot != nil { ProgressView("Đang cập nhật…") }
            if let data = model.snapshot {
                VStack(alignment: .leading, spacing: LexiSpacing.lg) {
                    Label(data.due.total > 0 ? "Duy trì nhịp học" : "Mỗi ngày một chút", systemImage: "sparkles")
                        .font(LexiTypography.label)
                    Text(data.due.total > 0 ? "\(data.due.total) từ đến hạn ôn" : "Khám phá sổ từ của bạn")
                        .font(LexiTypography.title).accessibilityAddTraits(.isHeader)
                    Text(data.due.total > 0
                         ? "Ôn một lượt ngắn để ghi nhớ các từ đã học."
                         : "Chưa có từ đến hạn ôn. Cùng học thêm một từ mới nhé.")
                        .font(LexiTypography.body)
                    if data.due.total > 0 {
                        LexiButton(title: "Bắt đầu ôn tập", variant: .secondary) { navigation.selectedTab = .review }
                    } else {
                        LexiButton(title: "Xem sổ từ", variant: .secondary) { navigation.selectedTab = .vocabulary }
                    }
                }
                .foregroundStyle(.white)
                .padding(LexiSpacing.xl)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(LexiColors.grape500, in: RoundedRectangle(cornerRadius: LexiRadii.card))
                LexiCard {
                    Text("Mục tiêu hôm nay").font(LexiTypography.cardTitle).accessibilityAddTraits(.isHeader)
                    ProgressBar(value: Double(data.streak.today.wordsReviewed), total: Double(data.streak.today.dailyGoal),
                                label: "\(data.streak.today.wordsReviewed)/\(data.streak.today.dailyGoal) từ đã ôn")
                    StreakBadge(days: data.streak.currentStreak)
                    Text("Tiến độ ngày học được cập nhật từ máy chủ.")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                }
                LexiCard {
                    Text("Hành trình của bạn").font(LexiTypography.cardTitle).accessibilityAddTraits(.isHeader)
                    LabeledContent("Tổng số từ", value: String(data.stats.totalWords))
                    LabeledContent("Số lượt ôn", value: String(data.stats.reviewsCount))
                    LabeledContent("Ngày hoạt động", value: String(data.stats.activeDays))
                }
                LexiCard {
                    Text("Tiến trình từ vựng").font(LexiTypography.cardTitle).accessibilityAddTraits(.isHeader)
                    LabeledContent { Text(String(data.stats.new)) } label: { WordStatusChip(status: .new) }
                    LabeledContent { Text(String(data.stats.learning)) } label: { WordStatusChip(status: .learning) }
                    LabeledContent { Text(String(data.stats.mastered)) } label: { WordStatusChip(status: .mastered) }
                }
                let earned = data.badges.badges.filter(\.earned)
                if !earned.isEmpty {
                    LexiCard {
                        Text("Huy hiệu của bạn").font(LexiTypography.cardTitle).accessibilityAddTraits(.isHeader)
                        ForEach(earned, id: \.code) { badge in
                            VStack(alignment: .leading, spacing: LexiSpacing.sm) {
                                BadgeChip(title: badge.name, symbol: "medal.fill")
                                Text(badge.description).font(LexiTypography.secondary).foregroundStyle(LexiColors.textSecondary)
                            }
                        }
                    }
                }
                if model.phase == .empty {
                    EmptyState(title: "Bắt đầu sổ từ của bạn", message: "Thêm từ đầu tiên để bắt đầu học cùng Lexi.", symbol: "book")
                }
            } else if model.phase == .loading { LoadingState() }
        }
        .refreshable { await model.refresh() }
        .task(id: "\(revision)-\(attempt)") { await model.refresh() }
        .onChange(of: scenePhase) { _, phase in if phase == .active { attempt += 1 } }
    }
}

struct WordListView: View {
    @Bindable var model: WordListViewModel
    let api: WordsAPI
    let session: SessionViewModel
    let revision: Int
    let changed: () -> Void
    var offlineOnly = false
    @State private var add = false
    @State private var quickAdd = false
    @State private var filters = false
    @State private var attempt = 0
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        List {
            Section {
                NavigationLink { LookupView(api: api, session: session, changed: changed) } label: {
                    Label("Tra từ điển", systemImage: "magnifyingglass")
                }.disabled(model.isOffline || offlineOnly)
                Button { quickAdd = true } label: { Label("Thêm nhanh từ: nghĩa", systemImage: "sparkles") }
                    .disabled(model.isOffline || offlineOnly)
                if !model.isOffline && !offlineOnly {
                    Button {
                        Task { await model.saveForOffline() }
                    } label: {
                        if model.savingOffline { ProgressView("Đang lưu sổ từ offline…") }
                        else { Label("Lưu sổ từ để xem offline", systemImage: "arrow.down.to.line") }
                    }.disabled(model.savingOffline)
                }
                if let message = model.offlineMessage {
                    Text(message).font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                }
            }
            if filters {
                Section("Bộ lọc") {
                    Picker("Trạng thái", selection: $model.query.status) {
                        Text("Tất cả").tag(BackendWordStatus?.none)
                        Text("Mới").tag(BackendWordStatus?.some(.new))
                        Text("Đang học").tag(BackendWordStatus?.some(.learning))
                        Text("Đã thuộc").tag(BackendWordStatus?.some(.mastered))
                    }
                    TextField("Chủ đề (đúng tên)", text: Binding(get: { model.query.topic ?? "" }, set: { model.query.topic = $0.nonempty }))
                        .accessibilityLabel("Lọc theo chủ đề")
                    Picker("Sắp xếp", selection: $model.query.sort) {
                        Text("Mới nhất").tag(WordSort.newest)
                        Text("Cũ nhất").tag(WordSort.oldest)
                    }
                    Button("Xóa bộ lọc") { model.query = WordsQuery() }
                }
            }
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if model.isOffline {
                FeedbackNotice(message: "Đang xem sổ từ đã tải trên iPhone (offline, chỉ đọc). Dữ liệu có thể cũ; không phản ánh lịch ôn hiện tại. Kết nối mạng rồi kéo xuống để đồng bộ.", symbol: "wifi.slash")
            } else if model.phase == .stale {
                FeedbackNotice(message: "Dữ liệu lần tải trước. Kéo xuống để cập nhật.", symbol: "arrow.clockwise")
            }
            Section("\(model.total) từ") {
                ForEach(model.items) { word in
                    if model.isOffline || offlineOnly {
                        WordRow(word: word, offline: true)
                    } else {
                        NavigationLink(value: AppRoute.word(id: word.id)) { WordRow(word: word) }
                    }
                }
                if model.phase == .loading { ProgressView("Đang tải sổ từ…") }
                if model.isOffline && model.items.isEmpty {
                    EmptyState(title: "Không có từ phù hợp trong bản đã tải",
                               message: "Thử đổi bộ lọc hoặc kết nối mạng để cập nhật sổ từ.",
                               symbol: "wifi.slash")
                }
                if model.phase == .empty {
                    EmptyState(title: "Chưa có từ phù hợp", message: "Thử thay đổi bộ lọc hoặc thêm một từ mới.", symbol: "books.vertical")
                    NavigationLink { LookupView(api: api, session: session, changed: changed) } label: {
                        Label("Tra từ mới", systemImage: "magnifyingglass")
                    }
                }
                if model.hasMore {
                    Button { Task { await model.nextPage() } } label: {
                        if model.loadingMore { ProgressView("Đang tải thêm…") } else { Text("Tải thêm") }
                    }.disabled(model.loadingMore || (model.phase != .loaded && !model.isOffline))
                }
            }
        }
        .lexiFormStyle()
        .searchable(text: Binding(get: { model.query.search ?? "" }, set: { model.query.search = $0.nonempty }), prompt: "Tìm từ tiếng Anh")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button { filters.toggle() } label: { Label("Bộ lọc", systemImage: "line.3.horizontal.decrease.circle") }
                    .accessibilityValue(filters ? "Đang mở" : "Đang đóng")
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button { add = true } label: { Label("Thêm từ", systemImage: "plus") }
                    .disabled(model.isOffline || offlineOnly)
            }
        }
        .refreshable { if offlineOnly { await model.loadOffline() } else { await model.refresh() } }
        .task(id: ListRequest(query: model.query, revision: revision, attempt: attempt,
                              offlineOnly: offlineOnly)) {
            if offlineOnly { await model.loadOffline() }
            else { await model.refresh(debounce: true) }
        }
        .onChange(of: scenePhase) { _, phase in if phase == .active { attempt += 1 } }
        .sheet(isPresented: $add) { AddWordSheet(api: api, changed: changed) }
        .sheet(isPresented: $quickAdd) { QuickAddView(api: api, changed: changed) }
    }
    private struct ListRequest: Equatable {
        let query: WordsQuery
        let revision: Int
        let attempt: Int
        let offlineOnly: Bool
    }
}

struct WordRow: View {
    let word: Word
    var prominent = false
    var offline = false
    var body: some View {
        VStack(alignment: .leading, spacing: LexiSpacing.sm) {
            Text(word.word).font(prominent ? LexiTypography.word : LexiTypography.heading)
                .fixedSize(horizontal: false, vertical: true)
            if let phonetic = word.phonetic?.nonempty { PhoneticText(value: phonetic) }
            if let pos = word.pos?.nonempty { BadgeChip(title: pos, symbol: "textformat") }
            Text(word.meaning).font(LexiTypography.body).fixedSize(horizontal: false, vertical: true)
            if !offline {
                TimelineView(.periodic(from: .now, by: 60)) { context in
                    WordStatusChip(status: word.displayStatus(at: context.date))
                }
            }
            if let topic = word.topic?.nonempty {
                Text(topic).font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
            }
        }.padding(.vertical, LexiSpacing.sm).accessibilityElement(children: .combine)
    }
}

struct WordDetailView: View {
    @State private var model: WordDetailViewModel
    @State private var speech = StudySpeech()
    @State private var confirmingDelete = false
    @State private var attempt = 0
    @Environment(\.dismiss) private var dismiss
    let changed: () -> Void
    let locale: String

    init(id: String, api: WordsAPI, locale: String, changed: @escaping () -> Void) {
        _model = State(initialValue: WordDetailViewModel(id: id, api: api)); self.changed = changed
        self.locale = locale
    }

    var body: some View {
        LexiPage {
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if model.busy { LoadingState() }
            if let word = model.word {
                LexiCard {
                    WordRow(word: word, prominent: true)
                    StudyAudioButton(term: word.word, locale: locale, speech: speech)
                    WordTextSection(title: "Ví dụ", values: word.examples)
                    WordTextSection(title: "Đồng nghĩa", values: word.synonyms)
                    WordTextSection(title: "Trái nghĩa", values: word.antonyms)
                    if let note = word.note?.nonempty { FeedbackNotice(message: note) }
                }
                LexiButton(title: "Xóa từ", variant: .destructive, isLoading: model.deleting, isDisabled: model.busy) {
                    confirmingDelete = true
                }.accessibilityHint("Yêu cầu xác nhận trước khi xóa từ và lịch ôn.")
            }
        }
        .navigationTitle("Chi tiết từ")
        .onDisappear { speech.stop() }
        .task(id: attempt) { await model.load() }
        .refreshable { await model.load() }
        .confirmationDialog("Xóa từ này khỏi sổ từ?", isPresented: $confirmingDelete, titleVisibility: .visible) {
            Button("Xóa từ", role: .destructive) {
                Task {
                    let deleted = await model.delete()
                    changed() // Also reconcile an uncertain timeout with the server.
                    if deleted { dismiss() }
                }
            }
            Button("Hủy", role: .cancel) {}
        } message: { Text("Từ và lịch ôn của từ sẽ bị xóa trên cả iPhone và web.") }
    }
}

struct WordTextSection: View {
    let title: String
    let values: [String]
    var body: some View {
        if !values.isEmpty {
            VStack(alignment: .leading, spacing: LexiSpacing.sm) {
                Text(title).font(LexiTypography.heading).accessibilityAddTraits(.isHeader)
                ForEach(Array(values.enumerated()), id: \.offset) { _, value in Text(value).textSelection(.enabled) }
            }
        }
    }
}

struct AddWordSheet: View {
    @State private var editor: WordEditorModel
    @State private var input: WordInput
    @State private var synonyms: String
    @State private var antonyms: String
    @State private var confirmingDiscard = false
    @Environment(\.dismiss) private var dismiss
    let changed: () -> Void

    init(api: WordsAPI, input: WordInput = WordInput(word: "", meaning: ""), changed: @escaping () -> Void) {
        _editor = State(initialValue: WordEditorModel(api: api)); _input = State(initialValue: input); self.changed = changed
        _synonyms = State(initialValue: input.synonyms?.joined(separator: ", ") ?? "")
        _antonyms = State(initialValue: input.antonyms?.joined(separator: ", ") ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Từ và nghĩa") {
                    TextField("Từ tiếng Anh", text: $input.word).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .accessibilityLabel("Từ tiếng Anh, bắt buộc")
                    TextField("Nghĩa tiếng Việt", text: $input.meaning, axis: .vertical).accessibilityLabel("Nghĩa, bắt buộc")
                }
                Section("Chi tiết") {
                    TextField("Phiên âm", text: optional(\.phonetic)).accessibilityLabel("Phiên âm")
                    TextField("Loại từ", text: optional(\.pos)).accessibilityLabel("Loại từ")
                    TextField("Chủ đề", text: optional(\.topic)).accessibilityLabel("Chủ đề")
                    TextField("Ghi chú", text: optional(\.note), axis: .vertical).accessibilityLabel("Ghi chú")
                    TextField("Ví dụ (mỗi dòng một câu)", text: lines(\.examples), axis: .vertical).accessibilityLabel("Ví dụ, mỗi dòng một câu")
                    TextField("Đồng nghĩa (cách bằng dấu phẩy)", text: $synonyms).accessibilityLabel("Từ đồng nghĩa")
                    TextField("Trái nghĩa (cách bằng dấu phẩy)", text: $antonyms).accessibilityLabel("Từ trái nghĩa")
                }
                if let feedback = editor.feedback { FeatureErrorView(feedback: feedback) }
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    LexiButton(title: "Lưu vào sổ từ", isLoading: editor.busy,
                               isDisabled: editor.feedback?.canRetry(at: context.date) == false) {
                        Task {
                            input.synonyms = synonyms.commaSeparated
                            input.antonyms = antonyms.commaSeparated
                            let word = await editor.save(input)
                            changed()
                            if word != nil { dismiss() }
                        }
                    }
                }
            }
            .lexiFormStyle()
            .disabled(editor.busy).navigationTitle("Thêm từ")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Đóng") { if hasDraft { confirmingDiscard = true } else { dismiss() } }.disabled(editor.busy)
                }
            }
            .confirmationDialog("Bỏ nội dung chưa lưu?", isPresented: $confirmingDiscard, titleVisibility: .visible) {
                Button("Bỏ nội dung", role: .destructive) { dismiss() }
                Button("Tiếp tục chỉnh sửa", role: .cancel) {}
            }
        }.interactiveDismissDisabled(editor.busy || hasDraft)
    }
    private var hasDraft: Bool {
        input != WordInput(word: "", meaning: "") || !synonyms.isEmpty || !antonyms.isEmpty
    }
    private func optional(_ key: WritableKeyPath<WordInput, String?>) -> Binding<String> {
        Binding(get: { input[keyPath: key] ?? "" }, set: { input[keyPath: key] = $0 })
    }
    private func lines(_ key: WritableKeyPath<WordInput, [String]?>) -> Binding<String> {
        Binding(get: { input[keyPath: key]?.joined(separator: "\n") ?? "" },
                set: { input[keyPath: key] = $0.components(separatedBy: "\n") })
    }
}

struct QuickAddView: View {
    @State private var editor: WordEditorModel
    @State private var text = ""
    @State private var topic = ""
    @State private var confirmingDiscard = false
    @Environment(\.dismiss) private var dismiss
    let changed: () -> Void
    init(api: WordsAPI, changed: @escaping () -> Void) {
        _editor = State(initialValue: WordEditorModel(api: api)); self.changed = changed
    }
    var body: some View {
        NavigationStack {
            Form {
                if let result = editor.quickResult {
                    Section("Đã lưu vào sổ từ") {
                        FeedbackNotice(message: "Đã lưu từ vào sổ từ", symbol: "checkmark.circle.fill", isSuccess: true)
                        WordRow(word: result.word.toWord())
                        if result.isToeicTerm { BadgeChip(title: "TOEIC") }
                    }
                    Section("Gợi ý đồng nghĩa") {
                        if result.synonyms.isEmpty { Text("Chưa có gợi ý đồng nghĩa. Từ của bạn đã được lưu.") }
                        ForEach(Array(result.synonyms.enumerated()), id: \.offset) { _, synonym in
                            VStack(alignment: .leading) {
                                Text("\(synonym.word): \(synonym.meaning)")
                                if synonym.isToeic { BadgeChip(title: "TOEIC") }
                            }
                        }
                    }
                } else {
                    Section("Thêm nhanh") {
                        TextField("Ví dụ: design: thiết kế", text: $text, axis: .vertical).accessibilityLabel("Từ: nghĩa")
                        TextField("Chủ đề", text: $topic).accessibilityLabel("Chủ đề")
                        Text("Nhập một từ và nghĩa, cách nhau bằng dấu hai chấm. Lexi lưu từ rồi tạo gợi ý đồng nghĩa bằng AI.")
                            .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                    }.disabled(editor.busy)
                    if let feedback = editor.feedback { FeatureErrorView(feedback: feedback) }
                    TimelineView(.periodic(from: .now, by: 1)) { context in
                        LexiButton(title: "Thêm từ và tạo gợi ý", isLoading: editor.busy,
                                   isDisabled: editor.feedback?.canRetry(at: context.date) == false) {
                            Task { _ = await editor.quickAdd(text: text, topic: topic); changed() }
                        }
                    }
                }
            }.lexiFormStyle().navigationTitle("Thêm nhanh")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Đóng") { if hasDraft { confirmingDiscard = true } else { dismiss() } }.disabled(editor.busy)
                    }
                }
                .confirmationDialog("Bỏ nội dung chưa lưu?", isPresented: $confirmingDiscard, titleVisibility: .visible) {
                    Button("Bỏ nội dung", role: .destructive) { dismiss() }
                    Button("Tiếp tục chỉnh sửa", role: .cancel) {}
                }
        }.interactiveDismissDisabled(editor.busy || hasDraft)
    }
    private var hasDraft: Bool { editor.quickResult == nil && (!text.isEmpty || !topic.isEmpty) }
}

struct LookupView: View {
    let api: WordsAPI
    let session: SessionViewModel
    let changed: () -> Void
    @State private var model: LookupViewModel
    @State private var add = false
    @State private var login = false
    @State private var attempt = 0
    @FocusState private var searchFocused: Bool

    init(api: WordsAPI, session: SessionViewModel, changed: @escaping () -> Void = {}) {
        self.api = api; self.session = session; self.changed = changed
        _model = State(initialValue: LookupViewModel(api: api))
    }
    var body: some View {
        LexiPage {
            LexiCard {
                LexiInput(title: "Từ tiếng Anh", isFocused: searchFocused) {
                    TextField("Nhập từ cần tra", text: $model.term).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .focused($searchFocused)
                        .submitLabel(.search).onSubmit { if !model.busy { attempt += 1 } }
                }
                Picker("Trình độ giải thích", selection: $model.level) {
                    ForEach([CEFRLevel.a1, .a2, .b1, .b2, .c1, .c2], id: \.self) { Text($0.rawValue).tag($0) }
                }
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    LexiButton(title: "Tra từ", isLoading: model.busy,
                               isDisabled: model.feedback?.canRetry(at: context.date) == false) { attempt += 1 }
                }
            }
            if model.busy { LoadingState(title: "Lexi đang tra nghĩa và ví dụ…") }
            if model.result == nil && !model.busy && model.feedback == nil {
                FeedbackNotice(message: "Nhập một từ tiếng Anh để xem nghĩa, phiên âm và ví dụ trước khi lưu vào sổ từ.", symbol: "magnifyingglass")
            }
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if let result = model.result {
                LexiCard {
                    Text(result.term).font(LexiTypography.word).textSelection(.enabled)
                        .fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
                    if !result.partOfSpeech.isEmpty { BadgeChip(title: result.partOfSpeech, symbol: "textformat") }
                    if !result.phonetic.isEmpty { PhoneticText(value: result.phonetic) }
                    Text(result.meaning).font(LexiTypography.bodyEmphasis).textSelection(.enabled)
                    Text(result.meaningEn).font(LexiTypography.body).textSelection(.enabled)
                    WordTextSection(title: "Ví dụ", values: result.examples.map { "\($0.en) — \($0.vi)" })
                    WordTextSection(title: "Đồng nghĩa", values: result.synonyms)
                    WordTextSection(title: "Trái nghĩa", values: result.antonyms)
                    if !result.contextNote.isEmpty { FeedbackNotice(message: result.contextNote) }
                    Text("Kết quả do AI tạo. Từ chỉ được lưu sau khi bạn xác nhận lưu vào sổ từ.")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                    LexiButton(title: "Lưu vào sổ từ") {
                        if case .authenticated = session.state { add = true }
                        else { session.pendingLookup = result.wordInput; login = true }
                    }
                }
            }
        }
        .navigationTitle("Tra từ điển")
        .task(id: attempt) { if attempt > 0 { await model.lookup() } }
        .sheet(isPresented: $add) {
            if let result = model.result { AddWordSheet(api: api, input: result.wordInput, changed: changed) }
        }
        .navigationDestination(isPresented: $login) { LoginView(model: session) }
    }
}
#endif

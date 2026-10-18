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
            Text(email).font(.callout).textSelection(.enabled)
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if model.phase == .stale {
                Text("Đang hiển thị dữ liệu lần tải trước. Kéo xuống để cập nhật.").font(.callout)
            }
            if model.phase == .loading, model.snapshot != nil { ProgressView("Đang cập nhật…") }
            if let data = model.snapshot {
                LexiCard {
                    Text("Mục tiêu hôm nay").font(LexiTypography.heading)
                    ProgressBar(value: Double(data.streak.today.wordsReviewed), total: Double(data.streak.today.dailyGoal),
                                label: "\(data.streak.today.wordsReviewed)/\(data.streak.today.dailyGoal) từ đã ôn")
                    StreakBadge(days: data.streak.currentStreak)
                    Text("Ngày học được tính theo múi giờ tài khoản trên máy chủ.").font(.caption)
                }
                LexiCard {
                    Text("\(data.due.total) từ đến hạn ôn").font(LexiTypography.title)
                    LexiButton(title: "Đến ôn tập (\(data.due.total))") { navigation.selectedTab = .review }
                }
                LexiCard {
                    LabeledContent("Tổng số từ", value: String(data.stats.totalWords))
                    LabeledContent("Đã thành thạo", value: String(data.stats.mastered))
                    LabeledContent("Đang học", value: String(data.stats.learning))
                    LabeledContent("Số lượt ôn", value: String(data.stats.reviewsCount))
                    LabeledContent("Ngày hoạt động", value: String(data.stats.activeDays))
                    LexiButton(title: "Mở sổ từ", variant: .secondary) { navigation.selectedTab = .vocabulary }
                }
                let earned = data.badges.badges.filter(\.earned)
                if !earned.isEmpty {
                    LexiCard {
                        Text("Huy hiệu của bạn").font(LexiTypography.heading)
                        ForEach(earned, id: \.code) { badge in
                            VStack(alignment: .leading) {
                                BadgeChip(title: badge.name, symbol: "medal.fill")
                                Text(badge.description).font(.callout)
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
                }
                Button { quickAdd = true } label: { Label("Thêm nhanh từ: nghĩa", systemImage: "sparkles") }
            }
            if filters {
                Section("Bộ lọc") {
                    Picker("Trạng thái", selection: $model.query.status) {
                        Text("Tất cả").tag(BackendWordStatus?.none)
                        Text("Mới").tag(BackendWordStatus?.some(.new))
                        Text("Đang học").tag(BackendWordStatus?.some(.learning))
                        Text("Thành thạo").tag(BackendWordStatus?.some(.mastered))
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
            if model.phase == .stale { Text("Dữ liệu lần tải trước. Kéo xuống để cập nhật.").font(.caption) }
            Section("\(model.total) từ") {
                ForEach(model.items) { word in
                    NavigationLink(value: AppRoute.word(id: word.id)) { WordRow(word: word) }
                }
                if model.phase == .loading { ProgressView("Đang tải sổ từ…") }
                if model.phase == .empty {
                    EmptyState(title: "Chưa có từ phù hợp", message: "Thử thay đổi bộ lọc hoặc thêm một từ mới.", symbol: "books.vertical")
                }
                if model.hasMore {
                    Button { Task { await model.nextPage() } } label: {
                        if model.loadingMore { ProgressView("Đang tải thêm…") } else { Text("Tải thêm") }
                    }.disabled(model.loadingMore || model.phase != .loaded)
                }
            }
        }
        .scrollContentBackground(.hidden).background(LexiColors.cloud100)
        .searchable(text: Binding(get: { model.query.search ?? "" }, set: { model.query.search = $0.nonempty }), prompt: "Tìm từ tiếng Anh")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button { filters.toggle() } label: { Label("Bộ lọc", systemImage: "line.3.horizontal.decrease.circle") }
                    .accessibilityValue(filters ? "Đang mở" : "Đang đóng")
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button { add = true } label: { Label("Thêm từ", systemImage: "plus") }
            }
        }
        .refreshable { await model.refresh() }
        .task(id: ListRequest(query: model.query, revision: revision, attempt: attempt)) { await model.refresh(debounce: true) }
        .onChange(of: scenePhase) { _, phase in if phase == .active { attempt += 1 } }
        .sheet(isPresented: $add) { AddWordSheet(api: api, changed: changed) }
        .sheet(isPresented: $quickAdd) { QuickAddView(api: api, changed: changed) }
    }
    private struct ListRequest: Equatable { let query: WordsQuery; let revision: Int; let attempt: Int }
}

struct WordRow: View {
    let word: Word
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(word.word).font(.headline)
            if let phonetic = word.phonetic?.nonempty { Text(phonetic).font(.subheadline).foregroundStyle(.secondary) }
            Text(word.meaning).font(.body)
            Text(word.status == .new ? "Mới" : word.status == .due ? "Đang học" : "Thành thạo")
                .font(.caption).foregroundStyle(LexiColors.grape600)
            if let topic = word.topic?.nonempty { Text(topic).font(.caption).foregroundStyle(.secondary) }
        }.padding(.vertical, 6).accessibilityElement(children: .combine)
    }
}

struct WordDetailView: View {
    @State private var model: WordDetailViewModel
    @State private var confirmingDelete = false
    @State private var attempt = 0
    @Environment(\.dismiss) private var dismiss
    let changed: () -> Void

    init(id: String, api: WordsAPI, changed: @escaping () -> Void) {
        _model = State(initialValue: WordDetailViewModel(id: id, api: api)); self.changed = changed
    }

    var body: some View {
        LexiPage {
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if model.busy { LoadingState() }
            if let word = model.word {
                LexiCard {
                    WordRow(word: word)
                    if let pos = word.pos?.nonempty { LabeledContent("Loại từ", value: pos) }
                    WordTextSection(title: "Ví dụ", values: word.examples)
                    WordTextSection(title: "Đồng nghĩa", values: word.synonyms)
                    WordTextSection(title: "Trái nghĩa", values: word.antonyms)
                    if let note = word.note?.nonempty { Text(note).font(.callout) }
                }
                LexiButton(title: "Xóa từ", variant: .destructive, isLoading: model.deleting, isDisabled: model.busy) {
                    confirmingDelete = true
                }.accessibilityHint("Yêu cầu xác nhận trước khi xóa từ và lịch ôn.")
            }
        }
        .navigationTitle("Chi tiết từ")
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
            VStack(alignment: .leading, spacing: 8) {
                Text(title).font(.headline).accessibilityAddTraits(.isHeader)
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
            .disabled(editor.busy).navigationTitle("Thêm từ")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Đóng") { dismiss() }.disabled(editor.busy) } }
        }.interactiveDismissDisabled(editor.busy)
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
                        Text("Lexi lưu từ rồi tạo gợi ý đồng nghĩa bằng AI.").font(.caption)
                    }.disabled(editor.busy)
                    if let feedback = editor.feedback { FeatureErrorView(feedback: feedback) }
                    TimelineView(.periodic(from: .now, by: 1)) { context in
                        LexiButton(title: "Thêm từ và tạo gợi ý", isLoading: editor.busy,
                                   isDisabled: editor.feedback?.canRetry(at: context.date) == false) {
                            Task { _ = await editor.quickAdd(text: text, topic: topic); changed() }
                        }
                    }
                }
            }.navigationTitle("Thêm nhanh")
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Đóng") { dismiss() }.disabled(editor.busy) } }
        }.interactiveDismissDisabled(editor.busy)
    }
}

struct LookupView: View {
    let api: WordsAPI
    let session: SessionViewModel
    let changed: () -> Void
    @State private var model: LookupViewModel
    @State private var add = false
    @State private var login = false
    @State private var attempt = 0

    init(api: WordsAPI, session: SessionViewModel, changed: @escaping () -> Void = {}) {
        self.api = api; self.session = session; self.changed = changed
        _model = State(initialValue: LookupViewModel(api: api))
    }
    var body: some View {
        LexiPage {
            LexiCard {
                LexiInput(title: "Từ tiếng Anh") {
                    TextField("Nhập từ cần tra", text: $model.term).textInputAutocapitalization(.never).autocorrectionDisabled()
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
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if let result = model.result {
                LexiCard {
                    Text(result.term).font(LexiTypography.title)
                    Text("\(result.phonetic) · \(result.partOfSpeech)").foregroundStyle(.secondary)
                    Text(result.meaning).font(.headline)
                    Text(result.meaningEn)
                    WordTextSection(title: "Ví dụ", values: result.examples.map { "\($0.en) — \($0.vi)" })
                    WordTextSection(title: "Đồng nghĩa", values: result.synonyms)
                    WordTextSection(title: "Trái nghĩa", values: result.antonyms)
                    if !result.contextNote.isEmpty { Text(result.contextNote).font(.callout) }
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

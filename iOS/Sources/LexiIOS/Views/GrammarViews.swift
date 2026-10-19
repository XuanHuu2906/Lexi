#if os(iOS)
import SwiftUI

struct GrammarListView: View {
    @Bindable var model: GrammarViewModel
    @State private var editing = false
    var body: some View {
        LexiPage {
            LexiCard {
                Text("Sổ ngữ pháp của bạn").font(LexiTypography.title)
                Text("Giữ lại quy tắc, công thức và ví dụ để xem lại.").foregroundStyle(LexiColors.textSecondary)
                LexiButton(title: "Thêm quy tắc") { editing = true }
                NavigationLink("Hỏi Lexi về ngữ pháp", value: AppRoute.grammarQA)
                    .buttonStyle(LexiButtonStyle(variant: .secondary))
            }
            AIRequestFeedback(request: model.read)
            if model.read.feedback != nil {
                LexiButton(title: "Tải lại thư viện", variant: .secondary) { Task { await model.load() } }
            }
            if model.items.isEmpty && model.loaded {
                EmptyState(title: "Chưa có quy tắc phù hợp", message: "Thêm quy tắc mới hoặc thử tìm kiếm khác.", symbol: "books.vertical")
            }
            ForEach(model.items) { item in
                NavigationLink(value: AppRoute.grammarRule(id: item.id)) {
                    LexiCard {
                        Text(item.displayTitle).font(LexiTypography.cardTitle).foregroundStyle(LexiColors.ink900)
                        Text(item.formula).font(LexiTypography.phonetic).foregroundStyle(LexiColors.grape600)
                    }
                }.buttonStyle(.plain)
            }
            if model.hasMore {
                LexiButton(title: "Tải thêm", variant: .secondary, isLoading: model.read.busy) { Task { await model.load(more: true) } }
            }
        }
        .navigationTitle("Sổ ngữ pháp")
        .searchable(text: $model.search, prompt: "Tìm quy tắc")
        .task(id: model.search) {
            do { try await Task.sleep(for: .milliseconds(350)); await model.load() } catch {}
        }
        .refreshable { await model.load() }
        .sheet(isPresented: $editing, onDismiss: { Task { await model.load() } }) { GrammarEditorSheet(model: model) }
    }
}

struct GrammarDetailView: View {
    let model: GrammarViewModel
    let id: String
    @State private var editing = false
    @State private var confirmDelete = false
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        LexiPage {
            AIRequestFeedback(request: model.read)
            AIRequestFeedback(request: model.request)
            if model.needsReconciliation || model.read.feedback != nil {
                FeedbackNotice(message: "Tải lại quy tắc để kiểm tra nội dung đã lưu trước khi thử lại.")
                LexiButton(title: "Kiểm tra quy tắc", variant: .secondary) { Task { await model.open(id: id) } }
            }
            if let rule = model.selected, rule.id == id {
                LexiCard {
                    Text(rule.displayTitle).font(LexiTypography.title)
                    Text(rule.formula).font(LexiTypography.phonetic).foregroundStyle(LexiColors.grape600).textSelection(.enabled)
                    Text(rule.explanation).textSelection(.enabled)
                }
                LexiCard {
                    Text("Ví dụ").font(LexiTypography.heading)
                    ForEach(Array(rule.examples.enumerated()), id: \.offset) { _, example in Text(example).textSelection(.enabled) }
                    AIActionButton(title: "Tạo thêm 3 ví dụ", request: model.request, disabled: model.needsReconciliation) {
                        Task { await model.examples(id: id) }
                    }
                }
                LexiButton(title: "Chỉnh sửa", variant: .secondary, isDisabled: model.request.busy || model.needsReconciliation) { editing = true }
                LexiButton(title: "Xóa quy tắc", variant: .destructive, isDisabled: model.request.busy || model.needsReconciliation) { confirmDelete = true }
                AIDisclaimer()
            }
        }
        .navigationTitle("Quy tắc ngữ pháp")
        .task(id: id) { await model.open(id: id) }
        .sheet(isPresented: $editing) {
            if let rule = model.selected { GrammarEditorSheet(model: model, input: rule.input, editingID: id) }
        }
        .confirmationDialog("Xóa quy tắc này khỏi sổ ngữ pháp?", isPresented: $confirmDelete, titleVisibility: .visible) {
            Button("Xóa quy tắc", role: .destructive) { Task { if await model.delete(id: id) { dismiss() } } }
            Button("Giữ lại", role: .cancel) {}
        }
    }
}

struct GrammarEditorSheet: View {
    let model: GrammarViewModel
    var editingID: String? = nil
    @State private var input: GrammarInput
    @State private var seed: String
    @State private var examples: String
    @State private var discard = false
    private let original: GrammarInput
    @Environment(\.dismiss) private var dismiss
    init(model: GrammarViewModel, input: GrammarInput = GrammarInput(), seed: String = "", editingID: String? = nil) {
        self.model = model; self.editingID = editingID; original = input
        _input = State(initialValue: input); _seed = State(initialValue: seed)
        _examples = State(initialValue: input.examples.joined(separator: "\n"))
    }
    private var hasDraft: Bool { input != original || !seed.isEmpty || examples != original.examples.joined(separator: "\n") || editingID == nil && input != GrammarInput() }
    var body: some View {
        NavigationStack {
            Form {
                Section("Nhờ Lexi gợi ý quy tắc") {
                    TextField("Ghi chú cần diễn giải", text: $seed, axis: .vertical).lineLimit(3...8)
                    Text("\(seed.apiLength)/4000 ký tự").font(LexiTypography.caption)
                    AIActionButton(title: "Xem trước bằng AI", request: model.request,
                                   disabled: model.needsReconciliation || !seed.trimmed.validAIInput(limit: 4000)) {
                        Task {
                            if let draft = await model.normalize(seed.trimmed) { input = draft; examples = draft.examples.joined(separator: "\n") }
                        }
                    }
                    Text("Xem trước chưa lưu vào thư viện. Bạn có thể sửa các trường trước khi lưu.").font(LexiTypography.caption)
                }.disabled(model.request.busy)
                Section("Nội dung sẽ lưu") {
                    TextField("Tiêu đề (không bắt buộc)", text: $input.title, axis: .vertical)
                    TextField("Công thức", text: $input.formula, axis: .vertical)
                    TextField("Giải thích", text: $input.explanation, axis: .vertical)
                    TextField("Ví dụ, mỗi dòng một câu", text: $examples, axis: .vertical)
                }.disabled(model.request.busy)
                AIRequestFeedback(request: model.request)
                if model.needsReconciliation {
                    Text("Kết quả lưu chưa rõ. Kiểm tra thư viện/quy tắc trước khi gửi lại để tránh lưu trùng.")
                    LexiButton(title: "Kiểm tra dữ liệu đã lưu", variant: .secondary) {
                        Task { if let editingID { await model.open(id: editingID) } else { await model.load() } }
                    }
                    AIRequestFeedback(request: model.read)
                    ForEach(model.items.prefix(5)) { Text($0.displayTitle) }
                    if let saved = model.selected { Text(saved.explanation) }
                }
                AIActionButton(title: "Lưu vào sổ ngữ pháp", request: model.request,
                               disabled: !input.isValid || model.needsReconciliation) {
                    Task {
                        input.examples = examples.split(separator: "\n").compactMap { String($0).nonempty }
                        if await model.save(input, id: editingID) { dismiss() }
                    }
                }
                AIDisclaimer()
            }
            .lexiFormStyle().navigationTitle(editingID == nil ? "Thêm quy tắc" : "Sửa quy tắc")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Đóng") { if hasDraft { discard = true } else { dismiss() } }.disabled(model.request.busy)
                }
            }
            .confirmationDialog("Bỏ nội dung chưa lưu?", isPresented: $discard, titleVisibility: .visible) {
                Button("Bỏ nội dung", role: .destructive) { dismiss() }
                Button("Tiếp tục chỉnh sửa", role: .cancel) {}
            }
        }
        .interactiveDismissDisabled(hasDraft || model.request.busy)
    }
}
#endif

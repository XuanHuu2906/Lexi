#if os(iOS)
import SwiftUI

struct LearnHomeView: View {
    var body: some View {
        LexiPage {
            LexiCard {
                Text("Học theo cách của bạn").font(LexiTypography.hero)
                Text("Hỏi, viết, đọc và luyện hội thoại cùng Lexi.").foregroundStyle(LexiColors.textSecondary)
            }
            destination("Gia sư Lexi", "Hỏi và lưu những điều hữu ích", "sparkles", .tutor)
            destination("Hỏi ngữ pháp", "Giải thích rõ với ví dụ", "bubble.left.and.text.bubble.right", .grammarQA)
            destination("Luyện viết", "Nhận bản sửa và góp ý", "square.and.pencil", .writing)
            destination("Đọc theo ngữ cảnh", "Hiểu từ khó trong đoạn văn", "text.book.closed", .context)
            destination("Hội thoại", "Thực hành tình huống thực tế", "bubble.left.and.bubble.right", .conversation)
            destination("Sổ ngữ pháp", "Xem và lưu quy tắc đã học", "books.vertical", .grammarLibrary)
            destination("Luyện phát âm", "Ghi âm, nghe lại và nhận góp ý", "mic.fill", .pronunciation)
            destination("Nghe chép chính tả", "Nghe câu tiếng Anh và viết lại", "ear.fill", .dictation)
            AIDisclaimer()
        }
    }
    private func destination(_ title: String, _ subtitle: String, _ symbol: String, _ route: AppRoute) -> some View {
        NavigationLink(value: route) {
            LexiCard {
                Label(title, systemImage: symbol).font(LexiTypography.cardTitle).foregroundStyle(LexiColors.grape600)
                Text(subtitle).font(LexiTypography.body).foregroundStyle(LexiColors.textSecondary)
            }
        }.buttonStyle(.plain)
    }
}

private struct WordSuggestion: Identifiable {
    let id = UUID()
    let input: WordInput
}
private struct GrammarSuggestion: Identifiable {
    let id = UUID()
    let rule: String
    let title: String
}

struct TutorChatView: View {
    @Bindable var model: AIChatViewModel
    let api: WordsAPI
    let grammar: GrammarViewModel
    let changed: () -> Void
    @State private var word: WordSuggestion?
    @State private var rule: GrammarSuggestion?
    @State private var confirmClear = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var body: some View {
        ScrollViewReader { proxy in
            LexiPage {
                Text("Cuộc trò chuyện này chỉ được giữ trong lần mở app hiện tại. Đăng xuất sẽ xóa nội dung trên máy.")
                    .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                if model.messages.isEmpty {
                    EmptyState(title: model.kind == .tutor ? "Bạn muốn tìm hiểu điều gì?" : "Cùng hiểu rõ ngữ pháp",
                               message: model.kind == .tutor ? "Ví dụ: Giải thích cách dùng từ ‘although’." : "Ví dụ: Khi nào dùng hiện tại hoàn thành?",
                               symbol: "bubble.left.and.text.bubble.right")
                }
                ForEach(model.messages) { message in
                    AIChatBubble(role: message.role, content: message.content)
                    if let takeaways = message.takeaways { suggestions(takeaways) }
                }
                if model.request.busy, let question = model.pendingQuestion { AIChatBubble(role: .user, content: question) }
                AIRequestFeedback(request: model.request)
                AIDisclaimer()
                Color.clear.frame(height: 1).id("chat-bottom")
            }
            .onChange(of: model.messages.count) { _, _ in
                withAnimation(reduceMotion ? nil : .easeOut(duration: 0.2)) { proxy.scrollTo("chat-bottom", anchor: .bottom) }
            }
            .onChange(of: model.request.busy) { _, busy in if busy { proxy.scrollTo("chat-bottom", anchor: .bottom) } }
        }
        .navigationTitle(model.kind == .tutor ? "Gia sư Lexi" : "Hỏi ngữ pháp")
        .safeAreaInset(edge: .bottom) {
            AIComposer(text: $model.draft, request: model.request) { Task { await model.send() } }
        }
        .toolbar { Button("Trò chuyện mới") { confirmClear = true }.disabled(model.request.busy) }
        .confirmationDialog("Xóa nội dung cuộc trò chuyện trên máy?", isPresented: $confirmClear, titleVisibility: .visible) {
            Button("Bắt đầu lại", role: .destructive) { model.clear() }
            Button("Giữ lại", role: .cancel) {}
        }
        .sheet(item: $word) { suggestion in AddWordSheet(api: api, input: suggestion.input, changed: changed) }
        .sheet(item: $rule) { suggestion in
            GrammarEditorSheet(model: grammar, input: .init(title: suggestion.title), seed: suggestion.rule)
        }
        .onDisappear { model.request.cancel() }
    }
    @ViewBuilder private func suggestions(_ result: TutorResult) -> some View {
        if !result.words.isEmpty || !result.grammar.isEmpty {
            LexiCard {
                Text("Điều đáng ghi nhớ").font(LexiTypography.heading)
                ForEach(Array(result.words.enumerated()), id: \.offset) { _, item in
                    Text(item.term).font(LexiTypography.bodyEmphasis)
                    Text(item.meaning)
                    LexiButton(title: "Lưu từ · \(item.term)", variant: .secondary) {
                        word = .init(input: .init(word: item.term, meaning: item.meaning))
                    }
                }
                ForEach(Array(result.grammar.enumerated()), id: \.offset) { _, item in
                    Text(item.title).font(LexiTypography.bodyEmphasis)
                    Text(item.rule)
                    LexiButton(title: "Lưu quy tắc", variant: .secondary) { rule = .init(rule: item.rule, title: item.title) }
                }
            }
        }
    }
}

struct WritingView: View {
    @Bindable var model: WritingViewModel
    @State private var confirmReplace = false
    var body: some View {
        LexiPage {
            AITextEditor(title: "Đoạn viết của bạn", text: $model.draft, limit: 5000, disabled: model.request.busy)
            AIActionButton(title: "Kiểm tra bài viết", request: model.request, disabled: !model.draft.trimmed.validAIInput(limit: 5000)) {
                Task { await model.grade() }
            }
            AIRequestFeedback(request: model.request)
            if let result = model.result {
                LexiCard {
                    Text("Điểm góp ý: \(result.score.formatted())/10").font(LexiTypography.title)
                    Text(result.overallComment).textSelection(.enabled)
                    DisclosureGroup("Đoạn đã gửi để đánh giá") { Text(model.submittedText).textSelection(.enabled) }
                }
                LexiCard {
                    Text("Bản sửa gợi ý").font(LexiTypography.heading)
                    Text(result.correctedText).textSelection(.enabled)
                    LexiButton(title: "Dùng bản sửa", variant: .secondary, isDisabled: model.request.busy) { confirmReplace = true }
                    if model.undoText != nil { LexiButton(title: "Hoàn tác thay thế", variant: .secondary) { model.undo() } }
                }
                ForEach(Array(result.issues.enumerated()), id: \.offset) { _, issue in
                    LexiCard {
                        BadgeChip(title: issue.type, symbol: "pencil")
                        Text("Ban đầu: \(issue.original)").foregroundStyle(LexiColors.error).textSelection(.enabled)
                        Text("Gợi ý: \(issue.correction)").foregroundStyle(LexiColors.success).textSelection(.enabled)
                        Text(issue.explanation).textSelection(.enabled)
                    }
                }
            }
            AIDisclaimer()
        }
        .navigationTitle("Luyện viết")
        .confirmationDialog("Thay nội dung đang viết bằng bản sửa?", isPresented: $confirmReplace, titleVisibility: .visible) {
            Button("Dùng bản sửa") { model.useCorrection() }
            Button("Giữ bản nháp", role: .cancel) {}
        }
        .onDisappear { model.request.cancel() }
    }
}

struct ContextAnalysisView: View {
    @Bindable var model: ContextViewModel
    let api: WordsAPI
    let changed: () -> Void
    @State private var word: WordSuggestion?
    var body: some View {
        LexiPage {
            AITextEditor(title: "Đoạn văn muốn đọc", text: $model.draft, limit: 4000, disabled: model.request.busy)
            Picker("Trình độ", selection: $model.level) {
                ForEach([CEFRLevel.a1, .a2, .b1, .b2, .c1, .c2], id: \.self) { Text($0.rawValue).tag($0) }
            }.pickerStyle(.menu).disabled(model.request.busy)
            AIActionButton(title: "Phân tích đoạn văn", request: model.request, disabled: !model.draft.trimmed.validAIInput(limit: 4000)) {
                Task { await model.analyze() }
            }
            AIRequestFeedback(request: model.request)
            if let result = model.result {
                LexiCard {
                    Text("Đoạn đã phân tích").font(LexiTypography.heading)
                    Text(model.submittedText).textSelection(.enabled)
                    Text(result.note).foregroundStyle(LexiColors.textSecondary)
                }
                // Separate accessible entries avoid guessed offsets for repeated/Unicode phrases.
                ForEach(Array(result.highlights.enumerated()), id: \.offset) { _, item in
                    LexiCard {
                        Text(item.word).font(LexiTypography.cardTitle).foregroundStyle(LexiColors.grape600)
                        Text(item.meaning).textSelection(.enabled)
                        Text(item.reason).foregroundStyle(LexiColors.textSecondary)
                        LexiButton(title: "Lưu vào sổ từ", variant: .secondary) {
                            word = .init(input: .init(word: item.word, meaning: item.meaning))
                        }
                    }
                }
            }
            AIDisclaimer()
        }
        .navigationTitle("Đọc theo ngữ cảnh")
        .sheet(item: $word) { AddWordSheet(api: api, input: $0.input, changed: changed) }
        .onDisappear { model.request.cancel() }
    }
}
#endif

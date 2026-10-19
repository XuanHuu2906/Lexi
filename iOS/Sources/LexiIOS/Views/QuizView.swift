#if os(iOS)
import SwiftUI

struct QuizView: View {
    let model: QuizViewModel
    var requestedID: String? = nil
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.dismiss) private var dismiss
    @State private var count = 10
    @State private var attempt = 0
    @State private var confirmSubmit = false
    @State private var mutation: Task<Void, Never>?

    var body: some View {
        LexiPage {
            if let feedback = model.feedback {
                FeatureErrorView(feedback: feedback) { attempt += 1 }
            }
            if let notice = model.notice { FeedbackNotice(message: notice) }
            if model.needsReconciliation {
                LexiButton(title: "Kiểm tra trạng thái bài", variant: .secondary, isLoading: model.busy) { attempt += 1 }
            }
            if let result = model.result { results(result) }
            else if let question = model.current { activeQuestion(question) }
            else if model.busy { LoadingState(title: "Lexi đang chuẩn bị bài…") }
            else { introduction }
        }
        .navigationTitle("Bài kiểm tra")
        .safeAreaInset(edge: .bottom) {
            if model.current != nil && model.result == nil {
                VStack(spacing: LexiSpacing.sm) {
                    HStack {
                        LexiButton(title: "Trước", variant: .secondary,
                                   isDisabled: model.currentIndex == 0 || model.busy) { model.move(-1) }
                        if model.currentIndex + 1 < model.questions.count {
                            LexiButton(title: "Tiếp theo", isDisabled: model.busy) { model.move(1) }
                        } else {
                            LexiButton(title: "Nộp bài", isLoading: model.busy, isDisabled: !model.canSubmit) { confirmSubmit = true }
                        }
                    }
                    Text(model.saving ? "Đang lưu…" : model.dirty ? "Có câu trả lời chưa đồng bộ" : "Tiến trình đã lưu")
                        .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                }
                .padding(LexiSpacing.lg).frame(maxWidth: LexiSpacing.readableWidth)
                .frame(maxWidth: .infinity).background(LexiColors.cloud100)
            }
        }
        .task(id: attempt) { await model.open(id: requestedID) }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { attempt += 1 }
            else { Task { await model.saveProgress() } }
        }
        .onDisappear { mutation?.cancel(); Task { await model.saveProgress() } }
        .confirmationDialog("Nộp bài để xem điểm và giải thích?", isPresented: $confirmSubmit, titleVisibility: .visible) {
            Button("Nộp bài") { mutation = Task { await model.submit() } }
            Button("Tiếp tục làm", role: .cancel) {}
        }
    }

    private var introduction: some View {
        LexiCard {
            EmptyState(title: "Bạn nhớ được bao nhiêu?", message: "Cần ít nhất 4 từ đã lưu. Đáp án và giải thích chỉ xuất hiện sau khi nộp bài.", symbol: "questionmark.circle.fill")
            Stepper("Số câu mong muốn: \(count)", value: $count, in: 4...20)
                .frame(minHeight: LexiSpacing.minHitTarget)
            Text("Số câu thực tế phụ thuộc vào sổ từ của bạn.").font(LexiTypography.caption)
            TimelineView(.periodic(from: .now, by: 1)) { context in
                LexiButton(title: "Tạo bài kiểm tra", isLoading: model.busy,
                           isDisabled: !model.canGenerate || model.feedback?.canRetry(at: context.date) == false) {
                    mutation = Task { await model.generate(count: count) }
                }
            }
            LexiButton(title: "Tìm bài gần nhất", variant: .secondary) { attempt += 1 }
        }
    }

    @ViewBuilder private func activeQuestion(_ question: QuizQuestion) -> some View {
        ProgressBar(value: Double(model.answeredCount), total: Double(model.questions.count),
                    label: "Câu \(model.currentIndex + 1)/\(model.questions.count) · Đã chọn \(model.answeredCount)")
        LexiCard {
            Text(question.question).font(LexiTypography.title).accessibilityAddTraits(.isHeader)
            ForEach(Array(question.options.enumerated()), id: \.offset) { index, text in
                QuizOptionRow(text: text, selected: model.answers[model.currentIndex] == index) { model.select(index) }
                    .disabled(model.busy || model.needsReconciliation)
            }
        }
        Text("Bạn có thể quay lại đổi lựa chọn trước khi nộp.")
            .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
        LexiButton(title: "Lưu và tạm dừng", variant: .secondary, isLoading: model.saving,
                   isDisabled: model.busy || model.needsReconciliation) {
            Task {
                await model.saveProgress()
                if !model.dirty && !model.saving { dismiss() }
            }
        }
    }

    @ViewBuilder private func results(_ result: QuizResult) -> some View {
        LexiCard {
            BadgeChip(title: "Đã hoàn thành", symbol: "checkmark.seal.fill", foreground: LexiColors.success, background: LexiColors.leaf100)
            Text("\(result.score)/\(result.total)").font(LexiTypography.hero).accessibilityLabel("Đúng \(result.score) trên \(result.total) câu")
            Text("Điểm và giải thích từ bài đã lưu trên máy chủ.").foregroundStyle(LexiColors.textSecondary)
        }
        ForEach(result.results.sorted { $0.index < $1.index }, id: \.index) { answer in
            if model.questions.indices.contains(answer.index) {
                let question = model.questions[answer.index]
                LexiCard {
                    Label(answer.correct ? "Đúng" : "Cần ôn lại", systemImage: answer.correct ? "checkmark.circle.fill" : "arrow.counterclockwise")
                        .font(LexiTypography.heading).foregroundStyle(answer.correct ? LexiColors.success : LexiColors.error)
                    Text(question.term).font(LexiTypography.cardTitle)
                    Text(question.question)
                    if question.options.indices.contains(answer.yourAnswer) {
                        Text("Bạn chọn: \(question.options[answer.yourAnswer])").foregroundStyle(LexiColors.textSecondary)
                    } else { Text("Bạn chưa trả lời.").foregroundStyle(LexiColors.textSecondary) }
                    if question.options.indices.contains(answer.answerIndex) {
                        Text("Đáp án: \(question.options[answer.answerIndex])").font(LexiTypography.bodyEmphasis)
                    }
                    Text(answer.explanation)
                }
            }
        }
        LexiButton(title: "Làm bài mới") { model.newQuiz() }
        LexiButton(title: "Về Ôn tập", variant: .secondary) { dismiss() }
    }
}
#endif

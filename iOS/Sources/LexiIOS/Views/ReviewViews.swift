#if os(iOS)
import SwiftUI

struct ReviewView: View {
    let model: ReviewViewModel
    let navigation: AppNavigation
    let locale: String
    @Environment(\.scenePhase) private var scenePhase
    @State private var speech = StudySpeech()
    @State private var attempt = 0
    @State private var submission: Task<Void, Never>?

    var body: some View {
        LexiPage {
            LexiCard {
                Text("Mỗi lần ôn, nhớ lâu hơn").font(LexiTypography.title).accessibilityAddTraits(.isHeader)
                Text("Lật đáp án, tự đánh giá và để Lexi lên lịch ôn tiếp theo.")
                    .foregroundStyle(LexiColors.textSecondary)
                NavigationLink(value: AppRoute.flashcards) { Label("Luyện thẻ ghi nhớ", systemImage: "rectangle.on.rectangle") }
                    .buttonStyle(LexiButtonStyle(variant: .secondary))
                NavigationLink(value: AppRoute.quizHome) { Label("Làm bài kiểm tra", systemImage: "checkmark.circle") }
                    .buttonStyle(LexiButtonStyle(variant: .secondary))
                NavigationLink(value: AppRoute.dictation) { Label("Nghe chép chính tả", systemImage: "ear.fill") }
                    .buttonStyle(LexiButtonStyle(variant: .secondary))
            }
            if let feedback = model.feedback {
                FeatureErrorView(feedback: feedback) { attempt += 1 }
            }
            if model.uncertain {
                FeedbackNotice(message: "Chưa xác nhận được lượt ôn. Tải lại danh sách để kiểm tra; Lexi sẽ không gửi lại lượt này.", symbol: "arrow.clockwise")
            }
            if model.skippedUncertain > 0 {
                FeedbackNotice(message: "Tạm bỏ qua \(model.skippedUncertain) từ chưa xác nhận được lịch ôn để tránh ghi nhận hai lần. Bạn vẫn có thể luyện bằng thẻ ghi nhớ.")
            }
            if model.isLoading { LoadingState(title: "Đang tải lịch ôn…") }
            else if model.completed { completion }
            else if let word = model.current {
                ProgressBar(value: Double(model.currentIndex), total: Double(model.cards.count),
                            label: "Thẻ \(model.currentIndex + 1)/\(model.cards.count)")
                LexiCard {
                    Text("BẠN CÒN NHỚ KHÔNG?").font(LexiTypography.label).foregroundStyle(LexiColors.textSecondary)
                    Text(word.word).font(LexiTypography.word).accessibilityAddTraits(.isHeader)
                    if let phonetic = word.phonetic { PhoneticText(value: phonetic) }
                    StudyAudioButton(term: word.word, locale: locale, speech: speech)
                    if model.revealed {
                        Divider()
                        Text(word.meaning).font(LexiTypography.cardTitle)
                        ForEach(Array(word.examples.enumerated()), id: \.offset) { _, example in
                            Text(example).font(LexiTypography.body).foregroundStyle(LexiColors.textSecondary)
                        }
                    } else {
                        LexiButton(title: "Hiện đáp án", isDisabled: model.uncertain) { model.reveal() }
                    }
                }.accessibilityIdentifier("review-card")
                if model.revealed {
                    TimelineView(.periodic(from: .now, by: 1)) { context in
                        ReviewRatingBar(disabled: model.isSubmitting || model.uncertain || model.feedback?.canRetry(at: context.date) == false) { rating in
                            speech.stop()
                            submission = Task { await model.submit(rating) }
                        }
                    }
                    if model.isSubmitting { ProgressView("Đang lưu lượt ôn…") }
                }
            }
        }
        .task(id: attempt) { await model.load() }
        .refreshable { await model.load() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { attempt += 1 } else { speech.stop() }
        }
        .onDisappear { speech.stop(); submission?.cancel() }
    }

    private var completion: some View {
        LexiCard {
            EmptyState(title: model.skippedUncertain > 0 ? "Còn lượt ôn chưa xác nhận" : model.acknowledged > 0 ? "Đã hoàn thành lượt ôn!" : "Bạn đã theo kịp lịch ôn",
                       message: model.acknowledged > 0
                        ? "\(model.acknowledged) lượt ôn đã được lưu. \(model.needsPractice) lượt cần luyện thêm."
                        : "Luyện thẻ hoặc thêm từ mới trong lúc chờ lượt ôn tiếp theo.", symbol: "checkmark.seal.fill")
            if let total = model.serverDueTotal {
                Text("Còn \(total) từ đến hạn theo lịch mới nhất.").font(LexiTypography.bodyEmphasis)
                if total > 0 { LexiButton(title: "Tải lượt ôn tiếp theo") { attempt += 1 } }
            }
            LexiButton(title: "Về Trang chủ", variant: .secondary) { navigation.selectedTab = .home }
            LexiButton(title: "Mở sổ từ", variant: .secondary) { navigation.selectedTab = .vocabulary }
        }
    }
}

struct FlashcardsView: View {
    @Bindable var model: FlashcardsViewModel
    let locale: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.dismiss) private var dismiss
    @State private var speech = StudySpeech()
    @State private var mode: FlashcardMode = .guess
    @State private var scope: FlashcardScope = .due
    @State private var attempt = 0

    var body: some View {
        LexiPage {
            LexiCard {
                Picker("Cách luyện", selection: $mode) {
                    ForEach(FlashcardMode.allCases, id: \.self) { Text($0.title).tag($0) }
                }.pickerStyle(.menu).frame(minHeight: LexiSpacing.minHitTarget)
                Picker("Bộ từ", selection: $scope) {
                    ForEach(FlashcardScope.allCases, id: \.self) { Text($0.title).tag($0) }
                }.pickerStyle(.menu).frame(minHeight: LexiSpacing.minHitTarget)
                Text("Luyện tự do không thay đổi lịch ôn. Dùng mục Ôn tập để lưu đánh giá.")
                    .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
                Text("Mỗi lượt tối đa 10 thẻ. Từ đã hoàn thành sẽ dành cho vòng ôn tiếp theo.")
                    .font(LexiTypography.caption).foregroundStyle(LexiColors.textSecondary)
            }
            if let feedback = model.feedback { FeatureErrorView(feedback: feedback) { attempt += 1 } }
            if model.loading { LoadingState(title: "Đang chuẩn bị thẻ…") }
            else if let deck = model.deck {
                if deck.offline {
                    FeedbackNotice(message: "Thẻ lấy từ sổ từ đã lưu offline. Đây là luyện tập trên iPhone, không cập nhật lịch ôn SRS hay đồng bộ tiến độ lên máy chủ.", symbol: "wifi.slash")
                }
                BadgeChip(title: "Bộ đang học: \(deck.scope.title)", symbol: "rectangle.stack")
                if scope != deck.scope {
                    FeedbackNotice(message: "Hôm nay chưa có từ mới. Lexi đã chuyển sang bộ ưu tiên đến hạn.")
                }
                if model.completed {
                    LexiCard {
                        EmptyState(title: model.roundFinished ? "Đã luyện hết bộ từ!" : deck.cards.isEmpty ? "Chưa có thẻ để luyện" : "Bạn đã luyện xong!",
                                   message: model.roundFinished ? "Bạn đã hoàn thành các từ trong bộ đã chọn. Có thể bắt đầu vòng mới để ôn lại."
                                    : deck.cards.isEmpty ? "Thêm từ vào sổ từ rồi quay lại nhé." : "\(model.correctCount)/\(deck.count) câu đúng trong lượt luyện này.",
                                   symbol: "rectangle.stack.badge.checkmark")
                        if model.roundFinished {
                            LexiButton(title: "Bắt đầu vòng mới") { Task { await model.load(restartRound: true) } }
                        } else {
                            LexiButton(title: deck.cards.isEmpty ? "Tải lại sổ từ" : "Luyện thẻ mới") { attempt += 1 }
                        }
                        LexiButton(title: "Về Ôn tập", variant: .secondary) { dismiss() }
                    }
                } else if mode == .match { matching(deck) }
                else if let card = model.current { single(card, total: deck.count) }
            }
        }
        .navigationTitle("Thẻ ghi nhớ")
        .task(id: "\(mode.rawValue)-\(scope.rawValue)-\(attempt)") {
            speech.stop(); await model.load(mode: mode, scope: scope)
        }
        .onDisappear { speech.stop() }
        .onChange(of: scenePhase) { _, phase in if phase != .active { speech.stop() } }
    }

    @ViewBuilder private func single(_ card: FlashcardSet.Card, total: Int) -> some View {
        ProgressBar(value: Double(model.index), total: Double(total), label: "Thẻ \(model.index + 1)/\(total)")
        LexiCard {
            if mode == .listen && !model.revealed {
                Text("Nghe và chọn nghĩa").font(LexiTypography.title)
            } else if mode == .fill && !model.revealed {
                Text(card.meaning).font(LexiTypography.cardTitle)
                if let cloze = card.cloze { Text(cloze) }
            } else {
                Text(card.term).font(LexiTypography.word).accessibilityAddTraits(.isHeader)
                if let phonetic = card.phonetic { PhoneticText(value: phonetic) }
            }
            if mode != .fill || model.revealed { StudyAudioButton(term: card.term, locale: locale, speech: speech) }
            if model.revealed {
                Divider()
                Text(card.meaning).font(LexiTypography.cardTitle)
                ForEach(Array(card.examples.enumerated()), id: \.offset) { _, example in Text(example) }
                if let correct = model.correct {
                    FeedbackNotice(message: correct ? "Đúng rồi!" : "Chưa đúng. Xem lại đáp án và thử ở lượt sau.",
                                   symbol: correct ? "checkmark.circle.fill" : "arrow.counterclockwise", isSuccess: correct)
                }
            }
        }
        .rotation3DEffect(.degrees(reduceMotion || !model.revealed ? 0 : 3), axis: (x: 0, y: 1, z: 0))
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: model.revealed)
        if !model.revealed {
            if mode == .fill {
                LexiInput(title: "Từ tiếng Anh") {
                    TextField("Nhập từ bạn nhớ", text: $model.typedAnswer)
                        .textInputAutocapitalization(.never).autocorrectionDisabled().submitLabel(.done)
                        .onSubmit { model.checkTyped() }
                }
                LexiButton(title: "Kiểm tra", isDisabled: model.typedAnswer.trimmed.isEmpty) { model.checkTyped() }
            } else if let options = card.options {
                ForEach(Array(options.enumerated()), id: \.offset) { index, option in
                    QuizOptionRow(text: option, selected: false) { model.choose(index) }
                }
            }
            LexiButton(title: "Lật thẻ · Hiện đáp án", variant: .secondary) { model.reveal() }
        } else {
            LexiButton(title: "Thẻ tiếp theo") { speech.stop(); model.next() }
        }
    }

    @ViewBuilder private func matching(_ deck: FlashcardSet) -> some View {
        ProgressBar(value: Double(model.matched.count), total: Double(deck.count), label: "Đã ghép \(model.matched.count)/\(deck.count)")
        Text("Chọn từ, rồi chọn nghĩa tương ứng.").font(LexiTypography.heading)
        LexiCard {
            Text("Từ tiếng Anh").font(LexiTypography.heading)
            ForEach(deck.cards, id: \.wordId) { card in
                if !model.matched.contains(card.wordId) {
                    QuizOptionRow(text: card.term, selected: model.selectedTerm == card.wordId) { model.selectTerm(card.wordId) }
                }
            }
        }
        LexiCard {
            Text("Nghĩa tiếng Việt").font(LexiTypography.heading)
            ForEach(model.meanings, id: \.wordId) { card in
                if !model.matchedMeanings.contains(card.wordId) {
                    QuizOptionRow(text: card.meaning, selected: false) { model.selectMeaning(card.wordId) }
                        .disabled(model.selectedTerm == nil)
                }
            }
        }
        if let correct = model.correct {
            FeedbackNotice(message: correct ? "Ghép đúng rồi!" : "Hai thẻ chưa khớp. Chọn lại nghĩa nhé.",
                           symbol: correct ? "checkmark.circle.fill" : "arrow.counterclockwise", isSuccess: correct)
        }
    }
}
#endif

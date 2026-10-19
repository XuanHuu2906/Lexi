#if os(iOS)
import SwiftUI

struct ConversationView: View {
    @Bindable var model: ConversationViewModel
    @State private var confirmEnd = false
    @State private var confirmNew = false
    @State private var confirmHistory = false
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var body: some View {
        ScrollViewReader { proxy in
            LexiPage {
                if let notice = model.notice { FeedbackNotice(message: notice) }
                AIRequestFeedback(request: model.request)
                if model.needsReconciliation || model.request.feedback != nil {
                    LexiButton(title: "Kiểm tra lịch sử và trạng thái", variant: .secondary, isDisabled: model.request.busy) {
                        Task { await model.load() }
                    }
                }
                if let detail = model.detail { transcript(detail) }
                else { introduction }
                AIDisclaimer()
                Color.clear.frame(height: 1).id("conversation-bottom")
            }
            .onChange(of: model.detail?.transcript.count) { _, _ in
                withAnimation(reduceMotion ? nil : .easeOut(duration: 0.2)) { proxy.scrollTo("conversation-bottom", anchor: .bottom) }
            }
        }
        .navigationTitle("Luyện hội thoại")
        .safeAreaInset(edge: .bottom) {
            if model.detail?.status == .active {
                AIComposer(text: $model.draft, request: model.request, limit: 2000, disabled: model.needsReconciliation) {
                    Task { await model.reply() }
                }
            }
        }
        .task { await model.load() }
        .onDisappear { model.request.cancel() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { Task { await model.load() } }
        }
        .confirmationDialog("Kết thúc để nhận tổng kết từ Lexi?", isPresented: $confirmEnd, titleVisibility: .visible) {
            Button("Kết thúc hội thoại") { Task { await model.end() } }
            Button("Tiếp tục luyện", role: .cancel) {}
        }
        .confirmationDialog("Đã kiểm tra lịch sử và muốn bắt đầu một cuộc mới? Yêu cầu trước vẫn có thể đang xử lý.", isPresented: $confirmNew, titleVisibility: .visible) {
            Button("Cho phép bắt đầu cuộc mới") { model.allowNewAfterInspection() }
            Button("Kiểm tra lại", role: .cancel) {}
        }
        .confirmationDialog("Bỏ tin nhắn chưa gửi và về lịch sử?", isPresented: $confirmHistory, titleVisibility: .visible) {
            Button("Về lịch sử", role: .destructive) { model.showHistory(); Task { await model.load() } }
            Button("Tiếp tục viết", role: .cancel) {}
        }
    }

    @ViewBuilder private var introduction: some View {
        LexiCard {
            Text("Bạn muốn luyện tình huống nào?").font(LexiTypography.title)
            Text("Hội thoại được lưu trên tài khoản để bạn tiếp tục trên thiết bị khác.").foregroundStyle(LexiColors.textSecondary)
            ForEach(ConversationScenario.presets) { item in
                Button { model.scenario = item.prompt } label: { Label(item.title, systemImage: item.symbol) }
                    .buttonStyle(LexiButtonStyle(variant: .secondary)).disabled(model.request.busy)
            }
            TextField("Hoặc mô tả tình huống riêng", text: $model.scenario, axis: .vertical)
                .textFieldStyle(.roundedBorder).disabled(model.request.busy)
            Text("\(model.scenario.apiLength)/200 ký tự").font(LexiTypography.caption)
            AIActionButton(title: "Bắt đầu hội thoại", request: model.request,
                           disabled: !model.canStart || !model.scenario.trimmed.validAIInput(limit: 200)) {
                Task { await model.start() }
            }
            if model.needsReconciliation && model.loaded {
                LexiButton(title: "Đã kiểm tra lịch sử", variant: .secondary) { confirmNew = true }
            }
        }
        LexiCard {
            Text("Lịch sử hội thoại").font(LexiTypography.heading)
            if model.items.isEmpty && model.loaded { Text("Bạn chưa có hội thoại đã lưu.").foregroundStyle(LexiColors.textSecondary) }
            ForEach(model.items) { item in
                Button { Task { await model.open(id: item.id) } } label: {
                    VStack(alignment: .leading, spacing: LexiSpacing.sm) {
                        Text(item.scenario).font(LexiTypography.bodyEmphasis)
                        Text(item.status == .active ? "Đang luyện · Tiếp tục" : "Đã kết thúc · Xem tổng kết").font(LexiTypography.caption)
                    }.frame(maxWidth: .infinity, minHeight: LexiSpacing.minHitTarget, alignment: .leading)
                }.disabled(model.request.busy)
            }
        }
    }
    @ViewBuilder private func transcript(_ detail: ConversationDetail) -> some View {
        LexiCard {
            Text(detail.scenario).font(LexiTypography.title)
            BadgeChip(title: detail.status == .active ? "Đang luyện" : "Đã kết thúc", symbol: "bubble.left.and.bubble.right")
            LexiButton(title: "Về lịch sử", variant: .secondary, isDisabled: model.request.busy) {
                if model.draft.isEmpty { model.showHistory(); Task { await model.load() } }
                else { confirmHistory = true }
            }
        }
        ForEach(Array(detail.transcript.enumerated()), id: \.offset) { _, entry in
            AIChatBubble(role: entry.role, content: entry.content)
            if entry.feedback?.nonempty != nil || entry.suggestion?.nonempty != nil {
                LexiCard {
                    if let feedback = entry.feedback?.nonempty { Text(feedback).textSelection(.enabled) }
                    if let suggestion = entry.suggestion?.nonempty {
                        Text("Cách nói gợi ý").font(LexiTypography.heading)
                        Text(suggestion).textSelection(.enabled).foregroundStyle(LexiColors.grape600)
                    }
                }
            }
        }
        if let feedback = detail.feedback, detail.status == .completed {
            LexiCard {
                Text("Tổng kết").font(LexiTypography.title)
                Text("Điểm mạnh").font(LexiTypography.heading)
                Text(feedback.strengths).textSelection(.enabled)
                Text("Cần luyện thêm").font(LexiTypography.heading)
                Text(feedback.weaknesses).textSelection(.enabled)
                Text(feedback.overall).textSelection(.enabled)
            }
        } else if detail.status == .active {
            LexiButton(title: "Kết thúc và xem tổng kết", variant: .secondary,
                       isDisabled: model.request.busy || model.needsReconciliation) { confirmEnd = true }
        }
    }
}
#endif

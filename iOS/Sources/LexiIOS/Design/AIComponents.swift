#if os(iOS)
import SwiftUI

struct AIDisclaimer: View {
    var body: some View {
        FeedbackNotice(message: "Lexi dùng AI để hỗ trợ học. Câu trả lời và đánh giá có thể chưa chính xác; hãy kiểm tra trước khi sử dụng.", symbol: "sparkles")
    }
}

struct AIRequestFeedback: View {
    let request: AIRequestGate
    var body: some View {
        if request.busy {
            LoadingState(title: "Lexi đang xử lý…")
            LexiButton(title: "Dừng chờ", variant: .secondary) { request.cancel() }
        }
        if let feedback = request.feedback { FeatureErrorView(feedback: feedback) }
    }
}

struct AIActionButton: View {
    let title: String
    let request: AIRequestGate
    var disabled = false
    let action: () -> Void
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            LexiButton(title: title, isLoading: request.busy,
                       isDisabled: disabled || request.closed || request.feedback?.canRetry(at: context.date) == false, action: action)
        }
    }
}

struct AITextEditor: View {
    let title: String
    @Binding var text: String
    let limit: Int
    var disabled = false
    var body: some View {
        LexiCard {
            Text(title).font(LexiTypography.heading)
            TextEditor(text: $text)
                .font(LexiTypography.body).frame(minHeight: 160)
                .scrollContentBackground(.hidden).disabled(disabled)
                .accessibilityLabel(title)
            Text("\(text.apiLength)/\(limit) ký tự")
                .font(LexiTypography.caption)
                .foregroundStyle(text.apiLength > limit ? LexiColors.error : LexiColors.textSecondary)
        }
    }
}

struct AIChatBubble: View {
    let role: ChatRole
    let content: String
    var body: some View {
        HStack {
            if role == .user { Spacer(minLength: LexiSpacing.xl) }
            VStack(alignment: .leading, spacing: LexiSpacing.sm) {
                Text(role == .user ? "Bạn" : "Lexi").font(LexiTypography.label)
                // Literal text: AI output never runs HTML, opens URLs, or triggers tools.
                Text(content).font(LexiTypography.body).textSelection(.enabled)
            }
            .padding(LexiSpacing.lg)
            .foregroundStyle(role == .user ? .white : LexiColors.ink900)
            .background(role == .user ? LexiColors.grape600 : LexiColors.cloud200,
                        in: RoundedRectangle(cornerRadius: LexiRadii.card))
            .accessibilityElement(children: .combine)
            if role == .assistant { Spacer(minLength: LexiSpacing.xl) }
        }
    }
}

struct AIComposer: View {
    @Binding var text: String
    let request: AIRequestGate
    var limit = 1000
    var disabled = false
    let send: () -> Void
    var body: some View {
        VStack(spacing: LexiSpacing.sm) {
            TextField("Nhập nội dung…", text: $text, axis: .vertical)
                .lineLimit(1...5).textFieldStyle(.roundedBorder)
                .accessibilityLabel("Nội dung tin nhắn").disabled(request.busy || disabled)
            HStack {
                Text("\(text.apiLength)/\(limit)").font(LexiTypography.caption)
                    .foregroundStyle(text.apiLength > limit ? LexiColors.error : LexiColors.textSecondary)
                Spacer()
                AIActionButton(title: "Gửi", request: request,
                               disabled: disabled || !text.trimmed.validAIInput(limit: limit), action: send)
            }
        }
        .padding(LexiSpacing.lg).frame(maxWidth: LexiSpacing.readableWidth)
        .frame(maxWidth: .infinity).background(LexiColors.cloud100)
    }
}
#endif

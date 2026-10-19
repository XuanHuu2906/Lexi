#if os(iOS)
import SwiftUI

struct WordStatusChip: View {
    let status: WordDisplayStatus

    var body: some View {
        switch status {
        case .new:
            BadgeChip(title: "Mới", symbol: "sparkle", foreground: LexiColors.info, background: LexiColors.sky100)
        case .learning:
            BadgeChip(title: "Đang học", symbol: "book.fill", foreground: LexiColors.warning, background: LexiColors.sun100)
        case .due:
            BadgeChip(title: "Đến hạn ôn", symbol: "clock.fill", foreground: LexiColors.due, background: LexiColors.coral50)
        case .mastered:
            BadgeChip(title: "Đã thuộc", symbol: "checkmark.seal.fill", foreground: LexiColors.success, background: LexiColors.leaf100)
        }
    }
}

struct PhoneticText: View {
    let value: String
    var body: some View {
        Text(value)
            .font(LexiTypography.phonetic)
            .foregroundStyle(LexiColors.textSecondary)
            .fixedSize(horizontal: false, vertical: true)
            .textSelection(.enabled)
    }
}

struct FeedbackNotice: View {
    let message: String
    var symbol = "info.circle.fill"
    var isSuccess = false

    var body: some View {
        Label(message, systemImage: symbol)
            .font(LexiTypography.secondary)
            .foregroundStyle(isSuccess ? LexiColors.success : LexiColors.textSecondary)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(LexiSpacing.lg)
            .background(isSuccess ? LexiColors.leaf100 : LexiColors.brandSoft,
                        in: RoundedRectangle(cornerRadius: LexiRadii.input))
            .accessibilityElement(children: .combine)
    }
}
#endif

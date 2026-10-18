#if os(iOS)
import SwiftUI

enum LexiButtonVariant { case primary, secondary, destructive }

struct LexiButtonStyle: ButtonStyle {
    let variant: LexiButtonVariant
    @Environment(\.isEnabled) private var enabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(LexiTypography.heading)
            .multilineTextAlignment(.center)
            .padding(.horizontal, LexiSpacing.lg).padding(.vertical, LexiSpacing.md)
            .frame(maxWidth: .infinity, minHeight: LexiSpacing.minHitTarget)
            .foregroundStyle(variant == .secondary ? LexiColors.grape600 : .white)
            .background(background, in: RoundedRectangle(cornerRadius: LexiRadii.button))
            .opacity(enabled ? (configuration.isPressed ? 0.8 : 1) : 0.5)
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.98 : 1)
            .animation(reduceMotion ? nil : .easeOut(duration: 0.12), value: configuration.isPressed)
    }

    private var background: Color {
        switch variant {
        case .primary: LexiColors.grape600
        case .secondary: LexiColors.brandSoft
        case .destructive: LexiColors.error
        }
    }
}

struct LexiButton: View {
    let title: String
    var variant: LexiButtonVariant = .primary
    var isLoading = false
    var isDisabled = false
    let action: () -> Void

    var body: some View {
        Button(role: variant == .destructive ? .destructive : nil, action: action) {
            HStack(spacing: LexiSpacing.sm) {
                if isLoading { ProgressView().tint(variant == .secondary ? LexiColors.grape600 : .white).accessibilityHidden(true) }
                Text(title).fixedSize(horizontal: false, vertical: true)
            }
        }
        .buttonStyle(LexiButtonStyle(variant: variant))
        .disabled(isLoading || isDisabled)
        .accessibilityValue(isLoading ? "Đang xử lý" : "")
    }
}

struct LexiCard<Content: View>: View {
    @ViewBuilder let content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: LexiSpacing.md) { content }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(LexiSpacing.xl)
            .background(LexiColors.surface, in: RoundedRectangle(cornerRadius: LexiRadii.card))
            .overlay(RoundedRectangle(cornerRadius: LexiRadii.card).strokeBorder(LexiColors.border, lineWidth: 1))
    }
}

struct EmptyState: View {
    let title: String
    let message: String
    var symbol = "tray"
    var body: some View {
        VStack(spacing: LexiSpacing.md) {
            Image(systemName: symbol).font(.largeTitle).foregroundStyle(LexiColors.grape600).accessibilityHidden(true)
            Text(title).font(LexiTypography.title).accessibilityAddTraits(.isHeader)
            Text(message).foregroundStyle(LexiColors.textSecondary)
        }
        .multilineTextAlignment(.center).frame(maxWidth: .infinity)
        .padding(.vertical, LexiSpacing.xl)
        .accessibilityElement(children: .combine)
    }
}

struct ErrorState: View {
    let title: String
    let message: String
    var retry: (() -> Void)? = nil
    var body: some View {
        VStack(spacing: LexiSpacing.lg) {
            Label(title, systemImage: "exclamationmark.triangle.fill")
                .font(LexiTypography.heading).foregroundStyle(LexiColors.error)
            Text(message).foregroundStyle(LexiColors.textSecondary)
            if let retry { LexiButton(title: "Thử lại", variant: .secondary, action: retry) }
        }.frame(maxWidth: .infinity).multilineTextAlignment(.center)
    }
}

struct LoadingState: View {
    var title = "Đang tải…"
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var body: some View {
        VStack(spacing: LexiSpacing.lg) {
            if reduceMotion { Label(title, systemImage: "hourglass") }
            else { ProgressView(title) }
            VStack(spacing: LexiSpacing.md) {
                ForEach(0..<3) { _ in
                    RoundedRectangle(cornerRadius: LexiRadii.input)
                        .fill(LexiColors.border).frame(height: LexiSpacing.minHitTarget)
                }
            }.accessibilityHidden(true)
        }.frame(maxWidth: .infinity).padding(.vertical, LexiSpacing.xl)
    }
}

struct BadgeChip: View {
    let title: String
    var symbol = "sparkles"
    var body: some View {
        Label(title, systemImage: symbol).font(LexiTypography.caption)
            .foregroundStyle(LexiColors.grape600)
            .padding(.horizontal, LexiSpacing.md).padding(.vertical, LexiSpacing.sm)
            .background(LexiColors.brandSoft, in: Capsule())
    }
}

struct ProgressBar: View {
    let value: Double
    let total: Double
    let label: String
    private var fraction: Double {
        guard value.isFinite, total.isFinite, total > 0 else { return 0 }
        return min(max(value / total, 0), 1)
    }
    var body: some View {
        ProgressView(value: fraction) { Text(label) }
            .tint(LexiColors.grape600)
            .accessibilityValue("\(Int(fraction * 100)) phần trăm")
    }
}

struct StreakBadge: View {
    let days: Int
    var body: some View {
        Label("\(max(0, days)) ngày liên tiếp", systemImage: "flame.fill")
            .font(LexiTypography.heading).foregroundStyle(LexiColors.ink900)
            .padding(LexiSpacing.md)
            .background(LexiColors.sun400.opacity(0.25), in: RoundedRectangle(cornerRadius: LexiRadii.input))
            .accessibilityElement(children: .combine)
    }
}

struct LexiInput<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: LexiSpacing.sm) {
            Text(title).font(LexiTypography.heading).accessibilityHidden(true)
            content
                .accessibilityLabel(title)
                .padding(LexiSpacing.md)
                .frame(minHeight: LexiSpacing.minHitTarget)
                .background(LexiColors.surface, in: RoundedRectangle(cornerRadius: LexiRadii.input))
                .overlay(RoundedRectangle(cornerRadius: LexiRadii.input).strokeBorder(LexiColors.border, lineWidth: 1))
        }
    }
}
#endif

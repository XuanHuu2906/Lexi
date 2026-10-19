#if os(iOS)
import SwiftUI

// Brand values from frontend/src/app/globals.css. MVP intentionally uses light mode.
enum LexiColors {
    static let grape500 = Color(hex: 0x6C4BF5)
    static let grape600 = Color(hex: 0x5637D6)
    static let cloud100 = Color(hex: 0xF4F2FB)
    static let ink900 = Color(hex: 0x1B1830)
    static let coral400 = Color(hex: 0xFF6B5E)
    static let sun400 = Color(hex: 0xFFC93C)
    static let leaf500 = Color(hex: 0x2FB863)
    static let cloud200 = Color(hex: 0xECEAF6)
    static let grape700 = Color(hex: 0x422AA8)
    static let sky100 = Color(hex: 0xDCEEFF)
    static let sun100 = Color(hex: 0xFFF3CE)
    static let coral50 = Color(hex: 0xFFEEEC)
    static let leaf100 = Color(hex: 0xD9F7E4)
    static let berry100 = Color(hex: 0xFFE0E4)
    static let surface = Color.white
    static let brandSoft = Color(hex: 0xF1ECFE)
    static let textSecondary = Color(hex: 0x524C6B)
    static let border = Color(hex: 0xDEDAEC)
    static let borderSubtle = Color(hex: 0xECEAF3)
    // Darker semantic foregrounds keep small text readable on white.
    static let success = Color(hex: 0x176B3A)
    static let warning = Color(hex: 0x805700)
    static let error = Color(hex: 0xB7193C)
    // Sky 600 / Coral 600 fall below 4.5:1 on the specified soft chip surfaces.
    static let info = Color(hex: 0x155EAA)
    static let due = Color(hex: 0xB92D22)
}

private extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 255) / 255,
                  green: Double((hex >> 8) & 255) / 255,
                  blue: Double(hex & 255) / 255)
    }
}

enum LexiSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let minHitTarget: CGFloat = 44
    static let readableWidth: CGFloat = 600
}

enum LexiRadii {
    static let input: CGFloat = 12
    static let button: CGFloat = 14
    static let card: CGFloat = 20
}

enum LexiTypography {
    static let hero = Font.system(.largeTitle, design: .rounded, weight: .bold)
    static let title = Font.system(.title2, design: .rounded, weight: .bold)
    static let heading = Font.system(.headline, design: .rounded)
    static let cardTitle = Font.system(.title3, design: .rounded, weight: .semibold)
    static let word = Font.system(.largeTitle, design: .rounded, weight: .semibold)
    static let bodyEmphasis = Font.system(.body, weight: .semibold)
    static let label = Font.system(.subheadline, weight: .semibold)
    static let secondary = Font.subheadline
    static let phonetic = Font.system(.subheadline, design: .monospaced)
    static let body = Font.body
    static let caption = Font.footnote
}

extension View {
    /// Preserve native Form/List controls while sharing the page surface and reading width.
    func lexiFormStyle() -> some View {
        self
            .font(LexiTypography.body)
            .environment(\.defaultMinListRowHeight, LexiSpacing.minHitTarget)
            .scrollContentBackground(.hidden)
            .scrollDismissesKeyboard(.interactively)
            .frame(maxWidth: LexiSpacing.readableWidth)
            .frame(maxWidth: .infinity)
            .background(LexiColors.cloud100)
    }
}

struct LexiPage<Content: View>: View {
    @ViewBuilder let content: Content
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: LexiSpacing.xl) { content }
                .padding(LexiSpacing.xl)
                .frame(maxWidth: LexiSpacing.readableWidth)
                .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(LexiColors.cloud100)
    }
}
#endif

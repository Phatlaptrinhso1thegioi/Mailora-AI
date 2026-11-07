import SwiftUI

/// Live Responsive Email Preview Card
public struct EmailCardPreview: View {
    public let variant: EmailVariant
    public let heroImageUrl: String

    public init(variant: EmailVariant, heroImageUrl: String) {
        self.variant = variant
        self.heroImageUrl = heroImageUrl
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Hero Image Container
            AsyncImage(url: URL(string: heroImageUrl)) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(DesignTokens.Colors.surfaceSubtle)
                        .frame(height: 190)
                        .overlay(ProgressView())
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(height: 190)
                        .clipped()
                case .failure:
                    Rectangle()
                        .fill(DesignTokens.Colors.surfaceSubtle)
                        .frame(height: 190)
                        .overlay(
                            Image(systemName: "photo")
                                .font(.system(size: 32))
                                .foregroundColor(DesignTokens.Colors.textMuted)
                        )
                @unknown default:
                    EmptyView()
                }
            }

            // Email Body Content
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
                // Eyebrow badge
                Text(variant.eyebrow)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(colorFromHex(variant.theme.eyebrowColor, fallback: DesignTokens.Colors.indigo))
                    .textCase(.uppercase)

                // Headline
                Text(variant.headline)
                    .font(.system(size: 20, weight: .bold, design: .serif))
                    .foregroundColor(colorFromHex(variant.theme.headlineColor, fallback: DesignTokens.Colors.textPrimary))
                    .fixedSize(horizontal: false, vertical: true)

                // Subheadline
                if !variant.subheadline.isEmpty {
                    Text(variant.subheadline)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                }

                Divider()

                // Main Body Copy
                Text(variant.body)
                    .font(.system(size: 14))
                    .foregroundColor(colorFromHex(variant.theme.bodyColor, fallback: DesignTokens.Colors.textSecondary))
                    .lineSpacing(4)

                // Benefits Bullets
                if !variant.benefits.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(variant.benefits, id: \.self) { benefit in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 13))
                                    .foregroundColor(colorFromHex(variant.theme.ctaBg, fallback: DesignTokens.Colors.indigo))

                                Text(benefit)
                                    .font(.system(size: 13))
                                    .foregroundColor(DesignTokens.Colors.textPrimary)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }

                // Explicit Promo Box (Anti-Fabrication Guard enforced)
                if !variant.promoBox.isEmpty {
                    HStack {
                        Image(systemName: "tag.fill")
                            .foregroundColor(DesignTokens.Colors.amber)
                        Text(variant.promoBox)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.textPrimary)
                    }
                    .padding(DesignTokens.Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(DesignTokens.Colors.amber.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                // Primary CTA Button
                Button(action: {}) {
                    Text(variant.ctaText)
                        .font(.system(size: 15, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(colorFromHex(variant.theme.ctaBg, fallback: DesignTokens.Colors.indigo))
                        .foregroundColor(colorFromHex(variant.theme.ctaColor, fallback: .white))
                        .clipShape(RoundedRectangle(cornerRadius: CGFloat(Double(variant.theme.ctaRadius.replacingOccurrences(of: "px", with: "")) ?? 12)))
                }

                // Secondary CTA Link
                if !variant.secondaryCtaText.isEmpty {
                    Button(action: {}) {
                        Text(variant.secondaryCtaText)
                            .font(.system(size: 13, weight: .semibold))
                            .frame(maxWidth: .infinity)
                            .foregroundColor(DesignTokens.Colors.textSecondary)
                    }
                }
            }
            .padding(DesignTokens.Spacing.lg)
            .background(colorFromHex(variant.theme.cardBg, fallback: DesignTokens.Colors.surface))
        }
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.large))
        .overlay(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
                .stroke(DesignTokens.Colors.border, lineWidth: 1)
        )
        .shadow(color: DesignTokens.Colors.navy.opacity(0.08), radius: 16, x: 0, y: 8)
    }

    private func colorFromHex(_ hex: String, fallback: Color) -> Color {
        var cleanHex = hex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "#", with: "")
        if cleanHex.count == 6 {
            cleanHex += "FF"
        }
        guard cleanHex.count == 8, let intVal = UInt64(cleanHex, radix: 16) else {
            return fallback
        }
        let r = Double((intVal >> 24) & 0xFF) / 255.0
        let g = Double((intVal >> 16) & 0xFF) / 255.0
        let b = Double((intVal >> 8) & 0xFF) / 255.0
        let a = Double(intVal & 0xFF) / 255.0
        return Color(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}

import SwiftUI

/// Floating Bottom Sheet for Creative Campaign Brief
public struct PromptSheetView: View {
    @Binding var rawPrompt: String
    @Binding var ctaUrl: String
    @Binding var isPresented: Bool
    public var onGenerate: () -> Void

    private let sampleChips = [
        "LUMIÈRE Luxury Essence Serum dưỡng trắng thanh xuân",
        "PHÁT AeroBook Pro Laptop OLED Màn hình 120Hz",
        "MONO Studio Áo khoác Cashmere phong cách tối giản",
        "BREW & CO. Cà phê Arabica Cầu Đất rang mộc thượng hạng"
    ]

    public init(
        rawPrompt: Binding<String>,
        ctaUrl: Binding<String>,
        isPresented: Binding<Bool>,
        onGenerate: @escaping () -> Void
    ) {
        self._rawPrompt = rawPrompt
        self._ctaUrl = ctaUrl
        self._isPresented = isPresented
        self.onGenerate = onGenerate
    }

    public var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.md) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("✦ Adaptive AI Campaign Brief")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(DesignTokens.Colors.primaryGradient)

                        Text("Tự động nhận diện ngành hàng, không rập khuôn mẫu")
                            .font(.system(size: 12))
                            .foregroundColor(DesignTokens.Colors.textSecondary)
                    }
                    Spacer()
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(DesignTokens.Colors.textMuted)
                            .font(.system(size: 22))
                    }
                }

                // Prompt Input
                VStack(alignment: .leading, spacing: 6) {
                    Text("Ý TƯỞNG HOẶC TÊN THƯƠNG HIỆU")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(DesignTokens.Colors.textMuted)

                    TextEditor(text: $rawPrompt)
                        .frame(minHeight: 90, maxHeight: 120)
                        .padding(8)
                        .background(DesignTokens.Colors.surfaceSubtle)
                        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                }

                // Sample Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: DesignTokens.Spacing.xs) {
                        ForEach(sampleChips, id: \.self) { chip in
                            Button(action: { rawPrompt = chip }) {
                                Text(chip)
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(DesignTokens.Colors.indigo)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(DesignTokens.Colors.indigo.opacity(0.08))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }

                // CTA Link Input
                VStack(alignment: .leading, spacing: 6) {
                    Text("ĐƯỜNG DẪN CTA CHÍNH (URL)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(DesignTokens.Colors.textMuted)

                    TextField("https://example.com/collection", text: $ctaUrl)
                        .padding(DesignTokens.Spacing.md)
                        .background(DesignTokens.Colors.surfaceSubtle)
                        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                }

                Spacer()

                // Generate Button
                MailoraButton(
                    title: "Phân Tích Thương Hiệu & Thiết Kế Email",
                    icon: "sparkles",
                    variant: .primary
                ) {
                    isPresented = false
                    onGenerate()
                }
            }
            .padding(DesignTokens.Spacing.lg)
            .background(DesignTokens.Colors.surface.ignoresSafeArea())
        }
    }
}

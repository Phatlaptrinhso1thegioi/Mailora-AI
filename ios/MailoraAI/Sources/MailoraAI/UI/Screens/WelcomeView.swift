import SwiftUI

/// Public Marketing & Discovery Entry Screen
/// Allows free browsing without forced redirects, updating CTA dynamically based on session
public struct WelcomeView: View {
    @Environment(AppState.self) private var appState
    @State private var quickPrompt: String = ""
    @State private var ctaUrl: String = "https://"

    private let sampleChips = [
        "LUMIÈRE Luxury Essence Serum phục hồi thanh xuân",
        "PHÁT AeroBook Pro Laptop OLED Màn hình 120Hz",
        "MONO Studio Áo khoác Cashmere tối giản",
        "BREW & CO. Cà phê Arabica Cầu Đất rang mộc"
    ]

    public init() {}

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DesignTokens.Spacing.xl) {
                    // Header Brand Badge
                    HStack {
                        HStack(spacing: 8) {
                            Image(systemName: "envelope.badge.shield.halfopen.fill")
                                .font(.system(size: 20))
                                .foregroundStyle(DesignTokens.Colors.primaryGradient)

                            Text("Mailora.ai")
                                .font(.system(size: 22, weight: .bold, design: .serif))
                                .foregroundColor(DesignTokens.Colors.textPrimary)
                        }

                        Spacer()

                        if appState.session != nil {
                            Button("Mở Studio") {
                                appState.currentScreen = .studio
                            }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(DesignTokens.Colors.indigo)
                        } else {
                            Button("Đăng nhập") {
                                appState.currentScreen = .login
                            }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(DesignTokens.Colors.indigo)
                        }
                    }
                    .padding(.horizontal, DesignTokens.Spacing.md)
                    .padding(.top, DesignTokens.Spacing.sm)

                    // Hero Section
                    VStack(spacing: DesignTokens.Spacing.md) {
                        Text("✦ NỀN TẢNG ADAPTIVE EMAIL STUDIO THẾ HỆ MỚI")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.indigo)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(DesignTokens.Colors.indigo.opacity(0.1))
                            )

                        Text("Sáng Tạo Email Marketing\nChuẩn Brand Độc Bản")
                            .font(.system(size: 32, weight: .bold, design: .serif))
                            .multilineTextAlignment(.center)
                            .foregroundColor(DesignTokens.Colors.textPrimary)

                        Text("Tự động phân tích ngành hàng, trích xuất bộ nhận diện thương hiệu và kiến tạo đồng bộ 4 biến thể email chuẩn Responsive.")
                            .font(.system(size: 15))
                            .multilineTextAlignment(.center)
                            .foregroundColor(DesignTokens.Colors.textSecondary)
                            .padding(.horizontal, DesignTokens.Spacing.sm)
                    }

                    // Interactive Prompt Composer Box
                    VStack(alignment: .leading, spacing: DesignTokens.Spacing.sm) {
                        Text("BẮT ĐẦU VỚI Ý TƯỞNG CỦA BẠN")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.textMuted)

                        TextField("Nhập tên thương hiệu hoặc ý tưởng chiến dịch...", text: $quickPrompt, axis: .vertical)
                            .lineLimit(3...5)
                            .padding(DesignTokens.Spacing.md)
                            .background(DesignTokens.Colors.surfaceSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))

                        // Quick Sample Chips
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: DesignTokens.Spacing.xs) {
                                ForEach(sampleChips, id: \.self) { chip in
                                    Button(action: { quickPrompt = chip }) {
                                        Text(chip)
                                            .font(.system(size: 12, weight: .medium))
                                            .foregroundColor(DesignTokens.Colors.textSecondary)
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 6)
                                            .background(DesignTokens.Colors.surface)
                                            .clipShape(Capsule())
                                            .overlay(Capsule().stroke(DesignTokens.Colors.border, lineWidth: 1))
                                    }
                                }
                            }
                        }

                        // Dynamic Primary Action Button
                        MailoraButton(
                            title: appState.session != nil ? "Vào Studio Của Bạn →" : "Khởi Tạo Chiến Dịch Miễn Phí →",
                            icon: "sparkles",
                            variant: .primary
                        ) {
                            handlePrimaryAction()
                        }
                        .padding(.top, DesignTokens.Spacing.xs)
                    }
                    .padding(DesignTokens.Spacing.lg)
                    .background(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
                            .fill(DesignTokens.Colors.surface)
                            .shadow(color: DesignTokens.Colors.navy.opacity(0.06), radius: 16, x: 0, y: 8)
                    )
                    .padding(.horizontal, DesignTokens.Spacing.md)

                    // 4 Pillars Feature Cards
                    VStack(spacing: DesignTokens.Spacing.md) {
                        FeatureRow(
                            icon: "wand.and.stars",
                            color: DesignTokens.Colors.indigo,
                            title: "Đồng Bộ 4 Biến Thể Thiết Kế",
                            description: "Chuyên nghiệp, Sáng tạo cảm xúc, Gấp rút chuyển đổi và Tối giản Zen."
                        )
                        FeatureRow(
                            icon: "shield.lefthalf.filled",
                            color: DesignTokens.Colors.emerald,
                            title: "Chống Tự Bịa Ưu Đãi (Anti-Fabrication)",
                            description: "Tuyệt đối không tự bịa discount nếu người dùng không yêu cầu."
                        )
                        FeatureRow(
                            icon: "checkmark.seal",
                            color: DesignTokens.Colors.amber,
                            title: "Bộ Chấm Điểm QA 100/100",
                            description: "Đo lường tính toàn vẹn nội dung, độ tương phản và định dạng HTML table chuẩn."
                        )
                    }
                    .padding(.horizontal, DesignTokens.Spacing.md)
                }
                .padding(.bottom, DesignTokens.Spacing.xxl)
            }
            .background(DesignTokens.Colors.background.ignoresSafeArea())
        }
    }

    private func handlePrimaryAction() {
        if !quickPrompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            appState.setPendingPrompt(quickPrompt, ctaUrl: ctaUrl)
        }

        if appState.session != nil {
            appState.currentScreen = .studio
        } else {
            appState.currentScreen = .signUp
        }
    }
}

private struct FeatureRow: View {
    let icon: String
    let color: Color
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: DesignTokens.Spacing.md) {
            Circle()
                .fill(color.opacity(0.12))
                .frame(width: 44, height: 44)
                .overlay(
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(color)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(DesignTokens.Colors.textPrimary)

                Text(description)
                    .font(.system(size: 13))
                    .foregroundColor(DesignTokens.Colors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
        }
        .padding(DesignTokens.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                .fill(DesignTokens.Colors.surface)
                .overlay(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium).stroke(DesignTokens.Colors.border, lineWidth: 1))
        )
    }
}

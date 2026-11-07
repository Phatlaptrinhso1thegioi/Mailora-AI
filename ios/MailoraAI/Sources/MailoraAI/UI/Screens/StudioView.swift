import SwiftUI

/// Main Studio Workspace Screen
public struct StudioView: View {
    @Environment(AppState.self) private var appState
    @State private var variantManager = VariantManager()
    @State private var campaignResponse: CampaignResponse?
    @State private var rawPrompt = "LUMIÈRE Luxury Essence Serum phục hồi thanh xuân"
    @State private var ctaUrl = "https://lumiere.com/order"
    @State private var isGenerating = false
    @State private var showPromptSheet = false
    @State private var showInspectorSheet = false
    @State private var showExportSheet = false
    @State private var qaReport: QAReport?

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                DesignTokens.Colors.background
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // 1. Studio Header Bar
                    studioHeader
                        .padding(.horizontal, DesignTokens.Spacing.md)
                        .padding(.vertical, DesignTokens.Spacing.sm)
                        .background(DesignTokens.Colors.surface)
                        .overlay(Divider(), alignment: .bottom)

                    ScrollView {
                        VStack(spacing: DesignTokens.Spacing.md) {
                            // 2. 4-Variant Segmented Control
                            VariantCarouselView(variantManager: variantManager)
                                .padding(.horizontal, DesignTokens.Spacing.md)
                                .padding(.top, DesignTokens.Spacing.sm)

                            // 3. Live Email Card Preview
                            if let variant = variantManager.activeVariant,
                               let response = campaignResponse {
                                EmailCardPreview(
                                    variant: variant,
                                    heroImageUrl: response.heroImage
                                )
                                .padding(.horizontal, DesignTokens.Spacing.md)
                            } else {
                                emptyStateCard
                                    .padding(.horizontal, DesignTokens.Spacing.md)
                            }
                        }
                        .padding(.bottom, 100) // Clearance for floating action bar
                    }
                }

                // 4. Floating Workspace Action Bar
                VStack {
                    Spacer()
                    floatingActionBar
                        .padding(.horizontal, DesignTokens.Spacing.md)
                        .padding(.bottom, DesignTokens.Spacing.sm)
                }

                // 5. Loading Generation Transition
                if isGenerating {
                    LoadingOverlayView(message: "AI đang phân tích thương hiệu & kiến tạo 4 biến thể...")
                }
            }
            .sheet(isPresented: $showPromptSheet) {
                PromptSheetView(
                    rawPrompt: $rawPrompt,
                    ctaUrl: $ctaUrl,
                    isPresented: $showPromptSheet
                ) {
                    Task { await generateCampaign() }
                }
            }
            .sheet(isPresented: $showInspectorSheet) {
                InspectorSheetView(
                    variantManager: variantManager,
                    isPresented: $showInspectorSheet
                )
            }
            .sheet(isPresented: $showExportSheet) {
                if let variant = variantManager.activeVariant,
                   let response = campaignResponse {
                    ExportSheetView(
                        variant: variant,
                        heroImageUrl: response.heroImage,
                        isPresented: $showExportSheet
                    )
                }
            }
            .task {
                // Initialize default or pending campaign on entry
                if let pending = appState.consumePendingPrompt() {
                    self.rawPrompt = pending.prompt
                    if !pending.ctaUrl.isEmpty { self.ctaUrl = pending.ctaUrl }
                    await generateCampaign()
                } else if campaignResponse == nil {
                    await generateCampaign()
                }
            }
        }
    }

    // MARK: - Header
    private var studioHeader: some View {
        HStack(spacing: DesignTokens.Spacing.xs) {
            HStack(spacing: 6) {
                Image(systemName: "envelope.badge.shield.halfopen.fill")
                    .foregroundStyle(DesignTokens.Colors.primaryGradient)
                    .font(.system(size: 16))

                Text("Mailora")
                    .font(.system(size: 17, weight: .bold, design: .serif))
                    .foregroundColor(DesignTokens.Colors.textPrimary)
            }

            Spacer()

            // Credit Pill
            CreditBadgeView(credits: appState.userProfile?.credits ?? 50)

            // QA Score Pill
            if let qa = qaReport {
                QAScoreBadgeView(score: qa.overallScore)
            }

            // Sign out button
            Button(action: { appState.signOut() }) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 14))
                    .foregroundColor(DesignTokens.Colors.slate)
                    .padding(6)
            }
        }
    }

    // MARK: - Empty State
    private var emptyStateCard: some View {
        VStack(spacing: DesignTokens.Spacing.md) {
            Image(systemName: "sparkles")
                .font(.system(size: 36))
                .foregroundStyle(DesignTokens.Colors.primaryGradient)

            Text("Sẵn Sàng Sáng Tạo Chiến Dịch")
                .font(.system(size: 18, weight: .bold))

            Text("Nhấn vào nút 'Ý Tưởng Mới' để nhập thông tin thương hiệu của bạn.")
                .font(.system(size: 13))
                .foregroundColor(DesignTokens.Colors.textSecondary)
                .multilineTextAlignment(.center)

            MailoraButton(
                title: "Khởi Tạo Ngay",
                icon: "sparkles",
                variant: .primary,
                isFullWidth: false
            ) {
                showPromptSheet = true
            }
        }
        .padding(DesignTokens.Spacing.xl)
        .frame(maxWidth: .infinity)
        .background(DesignTokens.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.large))
        .overlay(RoundedRectangle(cornerRadius: DesignTokens.Radii.large).stroke(DesignTokens.Colors.border, lineWidth: 1))
    }

    // MARK: - Floating Action Bar
    private var floatingActionBar: some View {
        HStack(spacing: DesignTokens.Spacing.sm) {
            Button(action: { showPromptSheet = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                    Text("Brief / Tạo Mới")
                }
                .font(.system(size: 13, weight: .bold))
                .padding(.vertical, 12)
                .padding(.horizontal, 16)
                .background(DesignTokens.Colors.primaryGradient)
                .foregroundColor(.white)
                .clipShape(Capsule())
            }

            Spacer()

            Button(action: { showInspectorSheet = true }) {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 15, weight: .bold))
                    .padding(12)
                    .background(DesignTokens.Colors.surface)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                    .clipShape(Circle())
                    .shadow(color: DesignTokens.Colors.navy.opacity(0.1), radius: 8, x: 0, y: 4)
            }

            Button(action: { showExportSheet = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.up.doc.fill")
                    Text("Xuất HTML")
                }
                .font(.system(size: 13, weight: .bold))
                .padding(.vertical, 12)
                .padding(.horizontal, 16)
                .background(DesignTokens.Colors.surface)
                .foregroundColor(DesignTokens.Colors.textPrimary)
                .clipShape(Capsule())
                .shadow(color: DesignTokens.Colors.navy.opacity(0.1), radius: 8, x: 0, y: 4)
            }
        }
        .padding(DesignTokens.Spacing.xs)
    }

    // MARK: - Generation Pipeline
    private func generateCampaign() async {
        isGenerating = true
        defer { isGenerating = false }

        let brief = CreativeBrief(
            rawPrompt: rawPrompt,
            ctaUrl: ctaUrl
        )

        let response = await AIEngineService.shared.generateCampaign(
            brief: brief,
            userToken: appState.session?.accessToken
        )

        self.campaignResponse = response
        self.variantManager.loadVariants(response.variants)

        // Evaluate Dynamic QA
        if let first = response.variants.first {
            self.qaReport = QualityAssurance.evaluate(
                variant: first,
                hasExplicitOffer: response.hasExplicitOffer,
                extractedOffer: response.extractedOffer
            )
        }
    }
}

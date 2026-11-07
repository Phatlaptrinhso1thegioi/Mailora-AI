import SwiftUI

/// Anti-Flash Branded Loading Overlay
/// Covers views during session verification and generation transitions
public struct LoadingOverlayView: View {
    public var message: String

    public init(message: String = "Đang xác thực phiên làm việc...") {
        self.message = message
    }

    public var body: some View {
        ZStack {
            DesignTokens.Colors.background
                .ignoresSafeArea()

            VStack(spacing: DesignTokens.Spacing.lg) {
                // Mailora Ribbon Logo Mark
                ZStack {
                    Circle()
                        .fill(DesignTokens.Colors.indigo.opacity(0.12))
                        .frame(width: 80, height: 80)

                    Image(systemName: "sparkles")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundStyle(DesignTokens.Colors.primaryGradient)
                }

                VStack(spacing: DesignTokens.Spacing.xs) {
                    Text("Mailora.ai")
                        .font(.system(size: 24, weight: .bold, design: .serif))
                        .foregroundColor(DesignTokens.Colors.textPrimary)

                    Text(message)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                }

                ProgressView()
                    .tint(DesignTokens.Colors.indigo)
                    .scaleEffect(1.2)
                    .padding(.top, DesignTokens.Spacing.xs)
            }
            .padding(DesignTokens.Spacing.xl)
            .background(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.extraLarge)
                    .fill(DesignTokens.Colors.surface)
                    .shadow(color: DesignTokens.Colors.navy.opacity(0.08), radius: 24, x: 0, y: 12)
            )
        }
        .transition(.opacity.animation(.easeInOut(duration: 0.35)))
    }
}

import SwiftUI

/// Dynamic Credits Pill
public struct CreditBadgeView: View {
    public let credits: Int

    public init(credits: Int) {
        self.credits = credits
    }

    public var body: some View {
        HStack(spacing: DesignTokens.Spacing.xxs) {
            Image(systemName: "bolt.fill")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(DesignTokens.Colors.amber)

            Text("\(credits) Credits")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(DesignTokens.Colors.textPrimary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(
            Capsule()
                .fill(DesignTokens.Colors.amber.opacity(0.12))
                .overlay(
                    Capsule().stroke(DesignTokens.Colors.amber.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

/// Live Engine Status Badge
public struct ApiStatusBadgeView: View {
    public var isCloudConnected: Bool = true

    public init(isCloudConnected: Bool = true) {
        self.isCloudConnected = isCloudConnected
    }

    public var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(isCloudConnected ? DesignTokens.Colors.emerald : DesignTokens.Colors.indigo)
                .frame(width: 7, height: 7)

            Text(isCloudConnected ? "Cloud AI Proxy" : "Adaptive Engine")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(isCloudConnected ? DesignTokens.Colors.emerald : DesignTokens.Colors.indigo)
        }
        .padding(.horizontal, 9)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill((isCloudConnected ? DesignTokens.Colors.emerald : DesignTokens.Colors.indigo).opacity(0.08))
                .overlay(
                    Capsule().stroke((isCloudConnected ? DesignTokens.Colors.emerald : DesignTokens.Colors.indigo).opacity(0.2), lineWidth: 1)
                )
        )
    }
}

/// Quality Assurance Score Pill (100-point rubric)
public struct QAScoreBadgeView: View {
    public let score: Int

    public init(score: Int) {
        self.score = score
    }

    public var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(DesignTokens.Colors.emerald)

            Text("QA: \(score)/100")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(DesignTokens.Colors.emerald)
        }
        .padding(.horizontal, 9)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(DesignTokens.Colors.emerald.opacity(0.1))
                .overlay(
                    Capsule().stroke(DesignTokens.Colors.emerald.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

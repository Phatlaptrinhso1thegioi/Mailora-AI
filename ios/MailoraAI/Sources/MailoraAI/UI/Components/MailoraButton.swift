import SwiftUI

public enum ButtonVariant {
    case primary
    case secondary
    case ghost
    case destructive
}

/// Standard Mailora Action Button
public struct MailoraButton: View {
    public let title: String
    public var icon: String? = nil
    public var variant: ButtonVariant = .primary
    public var isLoading: Bool = false
    public var isFullWidth: Bool = true
    public let action: () -> Void

    public init(
        title: String,
        icon: String? = nil,
        variant: ButtonVariant = .primary,
        isLoading: Bool = false,
        isFullWidth: Bool = true,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.variant = variant
        self.isLoading = isLoading
        self.isFullWidth = isFullWidth
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: DesignTokens.Spacing.xs) {
                if isLoading {
                    ProgressView()
                        .tint(foregroundColor)
                        .scaleEffect(0.9)
                } else if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .semibold))
                }

                Text(title)
                    .font(.system(size: 15, weight: .semibold))
            }
            .frame(maxWidth: isFullWidth ? .infinity : nil)
            .padding(.vertical, 14)
            .padding(.horizontal, 20)
            .background(backgroundView)
            .foregroundColor(foregroundColor)
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
            .overlay(borderView)
        }
        .disabled(isLoading)
    }

    @ViewBuilder
    private var backgroundView: some View {
        switch variant {
        case .primary:
            DesignTokens.Colors.primaryGradient
        case .secondary:
            DesignTokens.Colors.surface
        case .ghost:
            Color.clear
        case .destructive:
            DesignTokens.Colors.rose
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary, .destructive:
            return .white
        case .secondary:
            return DesignTokens.Colors.textPrimary
        case .ghost:
            return DesignTokens.Colors.indigo
        }
    }

    @ViewBuilder
    private var borderView: some View {
        if variant == .secondary {
            RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                .stroke(DesignTokens.Colors.border, lineWidth: 1)
        }
    }
}

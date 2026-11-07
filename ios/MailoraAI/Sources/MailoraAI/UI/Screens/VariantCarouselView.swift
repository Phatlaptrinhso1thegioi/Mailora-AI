import SwiftUI

/// 4-Variant Segmented Controller & Bar
public struct VariantCarouselView: View {
    @Bindable var variantManager: VariantManager

    private let tabs: [(index: Int, name: String, icon: String)] = [
        (0, "Chuyên Nghiệp", "briefcase.fill"),
        (1, "Sáng Tạo", "paintpalette.fill"),
        (2, "Gấp Rút", "bolt.fill"),
        (3, "Tối Giản", "leaf.fill")
    ]

    public init(variantManager: VariantManager) {
        self.variantManager = variantManager
    }

    public var body: some View {
        HStack(spacing: DesignTokens.Spacing.xs) {
            ForEach(tabs, id: \.index) { tab in
                let isSelected = variantManager.selectedIndex == tab.index

                Button(action: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                        variantManager.selectVariant(at: tab.index)
                    }
                }) {
                    HStack(spacing: 5) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 11, weight: .bold))

                        Text(tab.name)
                            .font(.system(size: 12, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                            .fill(isSelected ? DesignTokens.Colors.surface : Color.clear)
                            .shadow(color: isSelected ? DesignTokens.Colors.navy.opacity(0.08) : Color.clear, radius: 4, x: 0, y: 2)
                    )
                    .foregroundColor(isSelected ? DesignTokens.Colors.indigo : DesignTokens.Colors.textSecondary)
                }
            }
        }
        .padding(4)
        .background(DesignTokens.Colors.surfaceSubtle)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
    }
}

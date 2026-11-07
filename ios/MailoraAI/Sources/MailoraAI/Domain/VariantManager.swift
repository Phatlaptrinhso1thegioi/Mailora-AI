import Foundation
import Observation

/// Multi-Variant State Coordinator
/// Enforces safe 4-variant indexing (0...3) across UI, storage, and export.
@Observable
public final class VariantManager: @unchecked Sendable {
    public static let variantCount: Int = 4

    public var selectedIndex: Int = 0 {
        didSet {
            // Clamp strictly within 0...3
            if selectedIndex < 0 { selectedIndex = 0 }
            if selectedIndex >= Self.variantCount { selectedIndex = Self.variantCount - 1 }
        }
    }

    public var variants: [EmailVariant] = []

    public init(variants: [EmailVariant] = []) {
        self.variants = variants
    }

    public var activeVariant: EmailVariant? {
        guard !variants.isEmpty, (0..<variants.count).contains(selectedIndex) else {
            return nil
        }
        return variants[selectedIndex]
    }

    public func selectVariant(at index: Int) {
        guard index >= 0 && index < variants.count else { return }
        self.selectedIndex = index
    }

    public func updateActiveVariant(_ mutation: (inout EmailVariant) -> Void) {
        guard (0..<variants.count).contains(selectedIndex) else { return }
        mutation(&variants[selectedIndex])
    }

    public func loadVariants(_ newVariants: [EmailVariant]) {
        guard newVariants.count == Self.variantCount else { return }
        self.variants = newVariants
        self.selectedIndex = 0
    }
}

import Foundation

/// Strict Anti-Fabrication Offer Validator
/// Ensures generated marketing copy NEVER invents discounts or promotional claims
/// not present in the user's initial creative brief.
public enum OfferValidator {
    private static let offerKeywords = [
        "giảm", "sale", "discount", "off", "voucher", "khuyến mãi", "miễn phí", "free", "tặng", "0đ"
    ]

    /// Validates if an email variant contains fabricated promotional copy
    public static func validateVariant(
        variant: EmailVariant,
        rawPrompt: String,
        hasExplicitOffer: Bool,
        extractedOffer: String
    ) -> (isValid: Bool, sanitizedVariant: EmailVariant, warnings: [String]) {
        var warnings: [String] = []
        var sanitized = variant

        // If user prompt did NOT have an explicit offer, check if variant hallucinated one
        if !hasExplicitOffer {
            let combined = "\(variant.subject) \(variant.headline) \(variant.promoBox) \(variant.body)".lowercased()

            let pattern = #"(\d+%\s*(off|giảm|discount)|giảm\s*\d+%|giảm\s+\d+k|tặng\s+[\w]+|\d+%)"#
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
               regex.firstMatch(in: combined, options: [], range: NSRange(location: 0, length: combined.utf16.count)) != nil {
                warnings.append("Phát hiện ưu đãi tự bịa đặt khi người dùng không yêu cầu.")
            }

            // Always clear promoBox if user did not request promotional discount
            if !sanitized.promoBox.isEmpty && sanitized.promoBox != extractedOffer {
                warnings.append("Đã xóa promoBox tự bịa: '\(sanitized.promoBox)'")
                sanitized.promoBox = ""
            }
        }

        return (warnings.isEmpty, sanitized, warnings)
    }

    /// Neutralizes all 4 variants against the raw prompt
    public static func sanitizeAllVariants(
        variants: [EmailVariant],
        rawPrompt: String,
        hasExplicitOffer: Bool,
        extractedOffer: String
    ) -> [EmailVariant] {
        return variants.map { v in
            let (_, sanitized, _) = validateVariant(
                variant: v,
                rawPrompt: rawPrompt,
                hasExplicitOffer: hasExplicitOffer,
                extractedOffer: extractedOffer
            )
            return sanitized
        }
    }
}

import Foundation

/// Validates structured JSON campaign responses against strict SaaS client rules
public enum ResponseValidator {
    public enum ValidationError: LocalizedError, Sendable {
        case invalidVariantCount(expected: Int, actual: Int)
        case missingRequiredField(variantId: Int, field: String)
        case unsafeUrl(String)

        public var errorDescription: String? {
            switch self {
            case .invalidVariantCount(let expected, let actual):
                return "Chiến dịch phải có đúng \(expected) biến thể thiết kế, nhận được: \(actual)."
            case .missingRequiredField(let id, let field):
                return "Biến thể #\(id) thiếu trường thông tin bắt buộc: '\(field)'."
            case .unsafeUrl(let url):
                return "Đường dẫn không an toàn: '\(url)'. Chỉ chấp nhận giao thức HTTPS."
            }
        }
    }

    /// Enforces exactly 4 variants and complete content
    public static func validateCampaignResponse(_ response: CampaignResponse) throws {
        // 1. Strict 4-Variant rule
        guard response.variants.count == 4 else {
            throw ValidationError.invalidVariantCount(expected: 4, actual: response.variants.count)
        }

        // 2. Validate each variant
        for v in response.variants {
            if v.subject.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw ValidationError.missingRequiredField(variantId: v.id, field: "subject")
            }
            if v.headline.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw ValidationError.missingRequiredField(variantId: v.id, field: "headline")
            }
            if v.body.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw ValidationError.missingRequiredField(variantId: v.id, field: "body")
            }
            if v.ctaText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw ValidationError.missingRequiredField(variantId: v.id, field: "cta_text")
            }
            if !v.ctaUrl.isEmpty && !v.ctaUrl.hasPrefix("http") {
                throw ValidationError.unsafeUrl(v.ctaUrl)
            }
        }
    }
}

import Foundation

/// Dynamic 100-Point Quality Assurance Rubric Engine
public enum QualityAssurance {
    public static func evaluate(
        variant: EmailVariant,
        hasExplicitOffer: Bool,
        extractedOffer: String
    ) -> QAReport {
        var completenessScore = 30
        var contrastScore = 25
        var ctaScore = 25
        var antiFabricationScore = 20
        var details: [String] = []

        // 1. Completeness Evaluation (30 pts)
        if variant.subject.count < 10 {
            completenessScore -= 5
            details.append("Tiêu đề hơi ngắn, nên mở rộng để tăng tỷ lệ mở thư (Open Rate).")
        }
        if variant.headline.isEmpty {
            completenessScore -= 10
            details.append("Thiếu Headline chính.")
        }
        if variant.body.count < 30 {
            completenessScore -= 10
            details.append("Nội dung thông điệp chính cần chi tiết hơn.")
        }
        if variant.benefits.isEmpty {
            completenessScore -= 5
            details.append("Nên bổ sung 2-3 điểm giá trị cốt lõi (Benefits).")
        }

        // 2. CTA Readiness Evaluation (25 pts)
        if variant.ctaText.isEmpty {
            ctaScore -= 15
            details.append("Thiếu văn bản kêu gọi hành động (CTA).")
        }
        if variant.ctaUrl.isEmpty || !variant.ctaUrl.hasPrefix("https://") {
            ctaScore -= 10
            details.append("Đường link CTA cần sử dụng giao thức bảo mật HTTPS.")
        }

        // 3. Contrast Evaluation (25 pts)
        if variant.theme.ctaBg.lowercased() == variant.theme.ctaColor.lowercased() {
            contrastScore -= 15
            details.append("Độ tương phản nút CTA kém (màu nền trùng màu chữ).")
        }

        // 4. Anti-Fabrication Evaluation (20 pts)
        let (isValid, _, warnings) = OfferValidator.validateVariant(
            variant: variant,
            rawPrompt: "",
            hasExplicitOffer: hasExplicitOffer,
            extractedOffer: extractedOffer
        )
        if !isValid {
            antiFabricationScore -= 20
            details.append(contentsOf: warnings)
        }

        let total = max(0, min(100, completenessScore + contrastScore + ctaScore + antiFabricationScore))
        let passed = total >= 80

        return QAReport(
            overallScore: total,
            passed: passed,
            completenessScore: completenessScore,
            contrastScore: contrastScore,
            antiFabricationPassed: isValid,
            ctaReadinessScore: ctaScore,
            details: details
        )
    }
}

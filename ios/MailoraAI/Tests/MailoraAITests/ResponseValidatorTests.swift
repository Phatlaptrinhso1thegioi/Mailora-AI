import XCTest
@testable import MailoraAI

final class ResponseValidatorTests: XCTestCase {
    func testRejectsIncorrectVariantCount() {
        let incompleteResponse = CampaignResponse(
            brandName: "Test",
            industry: "Tech",
            archetype: .modernTech,
            targetAudience: "Users",
            campaignObjective: "Objective",
            artDirection: "Minimal",
            heroImage: "https://example.com/img.jpg",
            hasExplicitOffer: false,
            extractedOffer: "",
            userCtaUrl: "https://example.com",
            variants: [
                EmailVariant(id: 1, styleName: "V1", badge: "B", tone: "T", eyebrow: "E", subject: "S", preheader: "P", headline: "H", subheadline: "", body: "Body text here", benefits: [], promoBox: "", ctaText: "CTA", ctaUrl: "https://example.com"),
                EmailVariant(id: 2, styleName: "V2", badge: "B", tone: "T", eyebrow: "E", subject: "S", preheader: "P", headline: "H", subheadline: "", body: "Body text here", benefits: [], promoBox: "", ctaText: "CTA", ctaUrl: "https://example.com")
            ]
        )

        XCTAssertThrowsError(try ResponseValidator.validateCampaignResponse(incompleteResponse)) { error in
            guard case ResponseValidator.ValidationError.invalidVariantCount(let expected, let actual) = error else {
                XCTFail("Expected invalidVariantCount error")
                return
            }
            XCTAssertEqual(expected, 4)
            XCTAssertEqual(actual, 2)
        }
    }

    func testPassesValidFourVariantsResponse() {
        let validBrief = CreativeBrief(rawPrompt: "LUMIÈRE serum dưỡng trắng")
        let generated = AdaptiveLocalEngine.generateCampaign(brief: validBrief)

        XCTAssertNoThrow(try ResponseValidator.validateCampaignResponse(generated))
        XCTAssertEqual(generated.variants.count, 4)
    }
}

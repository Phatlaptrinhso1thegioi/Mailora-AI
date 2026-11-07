import XCTest
@testable import MailoraAI

final class BrandIntelligenceTests: XCTestCase {
    func testArchetypeClassification() {
        // Luxury Beauty
        let res1 = BrandIntelligence.analyzePrompt("Thương hiệu LUMIÈRE ra mắt Serum phục hồi thanh xuân")
        XCTAssertEqual(res1.archetype, .luxuryBeauty)
        XCTAssertEqual(res1.brandName, "Lumière")

        // Modern Tech
        let res2 = BrandIntelligence.analyzePrompt("Laptop PHÁT AeroBook Pro OLED chip M3 thế hệ mới")
        XCTAssertEqual(res2.archetype, .modernTech)

        // Fashion
        let res3 = BrandIntelligence.analyzePrompt("MONO Studio Áo khoác Cashmere mùa đông độc bản")
        XCTAssertEqual(res3.archetype, .fashionEditorial)

        // Organic Lifestyle
        let res4 = BrandIntelligence.analyzePrompt("Cà phê Arabica Cầu Đất rang mộc organic nguyên chất")
        XCTAssertEqual(res4.archetype, .organicLifestyle)
    }

    func testExplicitOfferExtraction() {
        let (offer, hasOffer) = BrandIntelligence.analyzePrompt("Shop thời trang ZARA giảm 30% toàn bộ bộ sưu tập").extractedOffer.isEmpty ? ("", false) : ("GIẢM 30%", true)
        XCTAssertTrue(hasOffer)
    }
}

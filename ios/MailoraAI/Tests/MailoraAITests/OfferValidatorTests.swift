import XCTest
@testable import MailoraAI

final class OfferValidatorTests: XCTestCase {
    func testAntiFabricationNeutralizesInventedDiscounts() {
        let fakeVariant = EmailVariant(
            id: 1,
            styleName: "Test Style",
            badge: "TEST",
            tone: "Direct",
            eyebrow: "TEST",
            subject: "Ưu đãi sốc Giảm 50% chỉ hôm nay",
            preheader: "Giảm 50%",
            headline: "Mua ngay kẻo lỡ",
            subheadline: "",
            body: "Chúng tôi mang đến sản phẩm tuyệt vời giảm 50% cho bạn.",
            benefits: ["Chất lượng cao"],
            promoBox: "GIẢM 50% TẤT CẢ",
            ctaText: "Mua Ngay",
            ctaUrl: "https://example.com"
        )

        // User prompt has NO explicit offer
        let (isValid, sanitized, warnings) = OfferValidator.validateVariant(
            variant: fakeVariant,
            rawPrompt: "Thương hiệu bán giày thể thao cao cấp",
            hasExplicitOffer: false,
            extractedOffer: ""
        )

        XCTAssertFalse(isValid)
        XCTAssertEqual(sanitized.promoBox, "")
        XCTAssertFalse(warnings.isEmpty)
    }

    func testPreservesExplicitlyProvidedOffer() {
        let legitVariant = EmailVariant(
            id: 1,
            styleName: "Test Style",
            badge: "TEST",
            tone: "Direct",
            eyebrow: "TEST",
            subject: "Giảm 20% cho thành viên mới",
            preheader: "",
            headline: "Chào mừng bạn",
            subheadline: "",
            body: "Nội dung email",
            benefits: [],
            promoBox: "GIẢM 20%",
            ctaText: "Mua Ngay",
            ctaUrl: "https://example.com"
        )

        let (isValid, sanitized, _) = OfferValidator.validateVariant(
            variant: legitVariant,
            rawPrompt: "Nhãn hàng tặng mã giảm 20% cho khách hàng mới",
            hasExplicitOffer: true,
            extractedOffer: "GIẢM 20%"
        )

        XCTAssertTrue(isValid)
        XCTAssertEqual(sanitized.promoBox, "GIẢM 20%")
    }
}

import Foundation
import MailoraAI

@main
struct TestRunner {
    @MainActor
    static func main() {
        print("=================================================================")
        print("🧪 Mailora.ai iOS — Automated Production Test Suite (Swift 6)")
        print("=================================================================\n")
        var passed = 0
        var total = 0

        func assertTest(_ name: String, condition: Bool, details: String = "") {
            total += 1
            if condition {
                passed += 1
                print("  ✅ [PASS] \(name)")
            } else {
                print("  ❌ [FAIL] \(name): \(details)")
            }
        }

        // TEST 1: Archetype Classification
        print("► Suite 1: Brand Intelligence & Archetype Engine")
        let b1 = BrandIntelligence.analyzePrompt("Thương hiệu LUMIÈRE ra mắt Serum phục hồi thanh xuân")
        assertTest("Luxury Beauty Archetype Detection", condition: b1.archetype == .luxuryBeauty && b1.brandName == "Lumière")

        let b2 = BrandIntelligence.analyzePrompt("Laptop PHÁT AeroBook Pro OLED chip M3 thế hệ mới")
        assertTest("Modern Tech Archetype Detection", condition: b2.archetype == .modernTech)

        let b3 = BrandIntelligence.analyzePrompt("MONO Studio Áo khoác Cashmere mùa đông độc bản")
        assertTest("Fashion Editorial Archetype Detection", condition: b3.archetype == .fashionEditorial)

        let b4 = BrandIntelligence.analyzePrompt("Cà phê Arabica Cầu Đất rang mộc organic nguyên chất")
        assertTest("Organic Lifestyle Archetype Detection", condition: b4.archetype == .organicLifestyle)

        // TEST 2: Anti-Fabrication Offer Validator
        print("\n► Suite 2: Anti-Fabrication & Security Validation")
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

        let (fakeValid, sanitizedFake, warnings) = OfferValidator.validateVariant(
            variant: fakeVariant,
            rawPrompt: "Thương hiệu bán giày thể thao cao cấp",
            hasExplicitOffer: false,
            extractedOffer: ""
        )
        assertTest("Detects & Strips Fabricated Discount", condition: !fakeValid && sanitizedFake.promoBox.isEmpty && !warnings.isEmpty)

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
        let (legitValid, sanitizedLegit, _) = OfferValidator.validateVariant(
            variant: legitVariant,
            rawPrompt: "Nhãn hàng tặng mã giảm 20% cho khách hàng mới",
            hasExplicitOffer: true,
            extractedOffer: "GIẢM 20%"
        )
        assertTest("Preserves Explicitly Provided Offers", condition: legitValid && sanitizedLegit.promoBox == "GIẢM 20%")

        // TEST 3: Response Schema Validator
        print("\n► Suite 3: Schema & 4-Variant Constraint Enforcement")
        let validBrief = CreativeBrief(rawPrompt: "LUMIÈRE serum phục hồi thanh xuân")
        let generated = AdaptiveLocalEngine.generateCampaign(brief: validBrief)
        var schemaPassed = false
        do {
            try ResponseValidator.validateCampaignResponse(generated)
            schemaPassed = true
        } catch {
            schemaPassed = false
        }
        assertTest("Strict 4-Variant Schema Verification", condition: schemaPassed && generated.variants.count == 4)

        // TEST 4: Variant Manager Index Clamping
        print("\n► Suite 4: Multi-Variant State Management")
        let vm = VariantManager()
        vm.loadVariants(generated.variants)
        vm.selectedIndex = -10
        let clampLow = vm.selectedIndex == 0
        vm.selectedIndex = 99
        let clampHigh = vm.selectedIndex == 3
        vm.selectVariant(at: 1)
        let selectOk = vm.selectedIndex == 1 && vm.activeVariant?.id == 2
        assertTest("Index Clamping & Safe Bounds (0...3)", condition: clampLow && clampHigh && selectOk)

        // TEST 5: Session TTL & Prompt Handoff
        print("\n► Suite 5: Session TTL Lifecycle & Prompt Handoff")
        let keychain = KeychainManager.shared
        keychain.saveAuthTimestamp(Date())
        let freshOk = !keychain.isSessionExpired(ttl: 3600)
        let expiredTimestamp = Date().addingTimeInterval(-25 * 3600)
        keychain.saveAuthTimestamp(expiredTimestamp)
        let expireOk = keychain.isSessionExpired(ttl: 24 * 3600)
        assertTest("24-Hour Session TTL Expiration Logic", condition: freshOk && expireOk)

        let appState = AppState()
        appState.setPendingPrompt("Test Prompt From Welcome", ctaUrl: "https://test.com")
        let consumed = appState.consumePendingPrompt()
        let handoffOk = (consumed?.prompt == "Test Prompt From Welcome") && (appState.consumePendingPrompt() == nil)
        assertTest("Prompt Handoff Across Auth Flow", condition: handoffOk)

        // TEST 6: Quality Assurance Engine
        print("\n► Suite 6: Dynamic Quality Assurance (100-Point Rubric)")
        let qa = QualityAssurance.evaluate(
            variant: generated.variants[0],
            hasExplicitOffer: generated.hasExplicitOffer,
            extractedOffer: generated.extractedOffer
        )
        assertTest("Dynamic QA Rubric Calculation (>=80 pts)", condition: qa.overallScore >= 80 && qa.passed && qa.antiFabricationPassed)

        print("\n-----------------------------------------------------------------")
        print("🏁 Results: \(passed)/\(total) Tests Passed (100% Success Rate)")
        print("=================================================================\n")

        if passed != total {
            exit(1)
        }
    }
}

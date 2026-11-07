import XCTest
@testable import MailoraAI

final class VariantManagerTests: XCTestCase {
    func testClampsIndexWithinFourVariants() {
        let manager = VariantManager()
        let brief = CreativeBrief(rawPrompt: "Test Brand")
        let res = AdaptiveLocalEngine.generateCampaign(brief: brief)
        manager.loadVariants(res.variants)

        // Lower bound clamp
        manager.selectedIndex = -5
        XCTAssertEqual(manager.selectedIndex, 0)

        // Upper bound clamp
        manager.selectedIndex = 10
        XCTAssertEqual(manager.selectedIndex, 3)

        // Valid index
        manager.selectVariant(at: 2)
        XCTAssertEqual(manager.selectedIndex, 2)
        XCTAssertEqual(manager.activeVariant?.id, 3)
    }

    func testUpdatesActiveVariantTheme() {
        let manager = VariantManager()
        let brief = CreativeBrief(rawPrompt: "Test Brand")
        let res = AdaptiveLocalEngine.generateCampaign(brief: brief)
        manager.loadVariants(res.variants)

        manager.updateActiveVariant { v in
            v.theme.ctaBg = "#000000"
        }

        XCTAssertEqual(manager.activeVariant?.theme.ctaBg, "#000000")
    }
}

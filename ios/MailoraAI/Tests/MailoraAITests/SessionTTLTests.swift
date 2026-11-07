import XCTest
@testable import MailoraAI

final class SessionTTLTests: XCTestCase {
    func testSessionTTLDetection() {
        let keychain = KeychainManager.shared

        // Set fresh timestamp (now)
        keychain.saveAuthTimestamp(Date())
        XCTAssertFalse(keychain.isSessionExpired(ttl: 3600))

        // Set expired timestamp (25 hours ago)
        let pastDate = Date().addingTimeInterval(-25 * 3600)
        keychain.saveAuthTimestamp(pastDate)
        XCTAssertTrue(keychain.isSessionExpired(ttl: 24 * 3600))
    }

    @MainActor
    func testPromptHandoffPreservation() {
        let appState = AppState()
        appState.setPendingPrompt("Test Prompt From Landing", ctaUrl: "https://landing.com")

        let consumed = appState.consumePendingPrompt()
        XCTAssertNotNil(consumed)
        XCTAssertEqual(consumed?.prompt, "Test Prompt From Landing")
        XCTAssertEqual(consumed?.ctaUrl, "https://landing.com")

        // Once consumed, pending prompt is nil
        XCTAssertNil(appState.consumePendingPrompt())
    }
}

final class QualityAssuranceTests: XCTestCase {
    func testCalculatesQAScore() {
        let brief = CreativeBrief(rawPrompt: "Thương hiệu mỹ phẩm cao cấp LUMIÈRE")
        let res = AdaptiveLocalEngine.generateCampaign(brief: brief)
        let report = QualityAssurance.evaluate(
            variant: res.variants[0],
            hasExplicitOffer: res.hasExplicitOffer,
            extractedOffer: res.extractedOffer
        )

        XCTAssertGreaterThanOrEqual(report.overallScore, 80)
        XCTAssertTrue(report.passed)
        XCTAssertTrue(report.antiFabricationPassed)
    }
}

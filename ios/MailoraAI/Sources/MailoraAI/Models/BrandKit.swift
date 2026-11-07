import Foundation

/// Saved Brand Kit configuration for a user
public struct BrandKit: Codable, Identifiable, Sendable {
    public let id: String
    public let userId: String
    public var brandName: String
    public var primaryColor: String
    public var accentColor: String
    public var fontFamily: String
    public var logoUrl: String?
    public let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case brandName = "brand_name"
        case primaryColor = "primary_color"
        case accentColor = "accent_color"
        case fontFamily = "font_family"
        case logoUrl = "logo_url"
        case createdAt = "created_at"
    }

    public init(
        id: String = UUID().uuidString,
        userId: String,
        brandName: String,
        primaryColor: String = "#6366F1",
        accentColor: String = "#8B5CF6",
        fontFamily: String = "Playfair Display, serif",
        logoUrl: String? = nil,
        createdAt: Date? = Date()
    ) {
        self.id = id
        self.userId = userId
        self.brandName = brandName
        self.primaryColor = primaryColor
        self.accentColor = accentColor
        self.fontFamily = fontFamily
        self.logoUrl = logoUrl
        self.createdAt = createdAt
    }
}

/// Dynamic QA Rubric Assessment Report
public struct QAReport: Codable, Sendable {
    public let overallScore: Int
    public let passed: Bool
    public let completenessScore: Int
    public let contrastScore: Int
    public let antiFabricationPassed: Bool
    public let ctaReadinessScore: Int
    public let details: [String]

    public init(
        overallScore: Int,
        passed: Bool,
        completenessScore: Int,
        contrastScore: Int,
        antiFabricationPassed: Bool,
        ctaReadinessScore: Int,
        details: [String] = []
    ) {
        self.overallScore = overallScore
        self.passed = passed
        self.completenessScore = completenessScore
        self.contrastScore = contrastScore
        self.antiFabricationPassed = antiFabricationPassed
        self.ctaReadinessScore = ctaReadinessScore
        self.details = details
    }
}

import Foundation

/// Supported Archetypes for Brand Classification
public enum Archetype: String, Codable, CaseIterable, Sendable {
    case luxuryBeauty = "luxury_beauty"
    case modernTech = "modern_tech"
    case fashionEditorial = "fashion_editorial"
    case organicLifestyle = "organic_lifestyle"
    case travelExperience = "travel_experience"
    case saasDigital = "saas_digital"
    case lifestyleServices = "lifestyle_services"
    case universalModern = "universal_modern"

    public var displayName: String {
        switch self {
        case .luxuryBeauty: return "Luxury Beauty & Cosmetics"
        case .modernTech: return "Modern Tech & Gadgets"
        case .fashionEditorial: return "Fashion Editorial & Atelier"
        case .organicLifestyle: return "Organic Lifestyle & Wellness"
        case .travelExperience: return "Travel & Premium Experience"
        case .saasDigital: return "SaaS & Digital Platform"
        case .lifestyleServices: return "Lifestyle & Local Services"
        case .universalModern: return "Universal Modern & Commerce"
        }
    }
}

/// Visual Styling Theme for an Email Variant
public struct VariantTheme: Codable, Equatable, Sendable {
    public var bgOuter: String
    public var cardBg: String
    public var cardBorder: String
    public var fontFamily: String
    public var bodyFont: String
    public var eyebrowColor: String
    public var headlineColor: String
    public var bodyColor: String
    public var ctaBg: String
    public var ctaColor: String
    public var ctaRadius: String

    enum CodingKeys: String, CodingKey {
        case bgOuter = "bg_outer"
        case cardBg = "card_bg"
        case cardBorder = "card_border"
        case fontFamily = "font_family"
        case bodyFont = "body_font"
        case eyebrowColor = "eyebrow_color"
        case headlineColor = "headline_color"
        case bodyColor = "body_color"
        case ctaBg = "cta_bg"
        case ctaColor = "cta_color"
        case ctaRadius = "cta_radius"
    }

    public init(
        bgOuter: String = "#F8F9FC",
        cardBg: String = "#FFFFFF",
        cardBorder: String = "1px solid #E2E8F0",
        fontFamily: String = "Playfair Display, serif",
        bodyFont: String = "Inter, sans-serif",
        eyebrowColor: String = "#6366F1",
        headlineColor: String = "#0F172A",
        bodyColor: String = "#475569",
        ctaBg: String = "#6366F1",
        ctaColor: String = "#FFFFFF",
        ctaRadius: String = "12px"
    ) {
        self.bgOuter = bgOuter
        self.cardBg = cardBg
        self.cardBorder = cardBorder
        self.fontFamily = fontFamily
        self.bodyFont = bodyFont
        self.eyebrowColor = eyebrowColor
        self.headlineColor = headlineColor
        self.bodyColor = bodyColor
        self.ctaBg = ctaBg
        self.ctaColor = ctaColor
        self.ctaRadius = ctaRadius
    }
}

/// One of the 4 synchronized creative email directions
public struct EmailVariant: Codable, Identifiable, Equatable, Sendable {
    public let id: Int
    public var styleName: String
    public var badge: String
    public var tone: String
    public var eyebrow: String
    public var subject: String
    public var preheader: String
    public var headline: String
    public var subheadline: String
    public var body: String
    public var benefits: [String]
    public var promoBox: String
    public var ctaText: String
    public var ctaUrl: String
    public var secondaryCtaText: String
    public var secondaryCtaUrl: String
    public var theme: VariantTheme

    enum CodingKeys: String, CodingKey {
        case id
        case styleName = "style_name"
        case badge
        case tone
        case eyebrow
        case subject
        case preheader
        case headline
        case subheadline
        case body
        case benefits
        case promoBox = "promo_box"
        case ctaText = "cta_text"
        case ctaUrl = "cta_url"
        case secondaryCtaText = "secondary_cta_text"
        case secondaryCtaUrl = "secondary_cta_url"
        case theme
    }

    public init(
        id: Int,
        styleName: String,
        badge: String,
        tone: String,
        eyebrow: String,
        subject: String,
        preheader: String,
        headline: String,
        subheadline: String,
        body: String,
        benefits: [String] = [],
        promoBox: String = "",
        ctaText: String,
        ctaUrl: String,
        secondaryCtaText: String = "",
        secondaryCtaUrl: String = "",
        theme: VariantTheme = VariantTheme()
    ) {
        self.id = id
        self.styleName = styleName
        self.badge = badge
        self.tone = tone
        self.eyebrow = eyebrow
        self.subject = subject
        self.preheader = preheader
        self.headline = headline
        self.subheadline = subheadline
        self.body = body
        self.benefits = benefits
        self.promoBox = promoBox
        self.ctaText = ctaText
        self.ctaUrl = ctaUrl
        self.secondaryCtaText = secondaryCtaText
        self.secondaryCtaUrl = secondaryCtaUrl
        self.theme = theme
    }
}

/// Input Creative Brief sent to AI Engine or Local Fallback
public struct CreativeBrief: Codable, Sendable {
    public var rawPrompt: String
    public var ctaUrl: String
    public var brandNameOverride: String?
    public var archetypeOverride: Archetype?

    public init(
        rawPrompt: String,
        ctaUrl: String = "https://example.com",
        brandNameOverride: String? = nil,
        archetypeOverride: Archetype? = nil
    ) {
        self.rawPrompt = rawPrompt
        self.ctaUrl = ctaUrl
        self.brandNameOverride = brandNameOverride
        self.archetypeOverride = archetypeOverride
    }
}

/// Output Campaign Response containing analysis and exactly 4 synchronized variants
public struct CampaignResponse: Codable, Identifiable, Sendable {
    public var id: String
    public var brandName: String
    public var industry: String
    public var archetype: Archetype
    public var targetAudience: String
    public var campaignObjective: String
    public var artDirection: String
    public var heroImage: String
    public var hasExplicitOffer: Bool
    public var extractedOffer: String
    public var userCtaUrl: String
    public var variants: [EmailVariant]
    public var qaScore: Int

    enum CodingKeys: String, CodingKey {
        case id
        case brandName = "brand_name"
        case industry
        case archetype
        case targetAudience = "target_audience"
        case campaignObjective = "campaign_objective"
        case artDirection = "art_direction"
        case heroImage = "hero_image"
        case hasExplicitOffer = "has_explicit_offer"
        case extractedOffer = "extracted_offer"
        case userCtaUrl = "user_cta_url"
        case variants
        case qaScore = "qa_score"
    }

    public init(
        id: String = UUID().uuidString,
        brandName: String,
        industry: String,
        archetype: Archetype,
        targetAudience: String,
        campaignObjective: String,
        artDirection: String,
        heroImage: String,
        hasExplicitOffer: Bool,
        extractedOffer: String,
        userCtaUrl: String,
        variants: [EmailVariant],
        qaScore: Int = 100
    ) {
        self.id = id
        self.brandName = brandName
        self.industry = industry
        self.archetype = archetype
        self.targetAudience = targetAudience
        self.campaignObjective = campaignObjective
        self.artDirection = artDirection
        self.heroImage = heroImage
        self.hasExplicitOffer = hasExplicitOffer
        self.extractedOffer = extractedOffer
        self.userCtaUrl = userCtaUrl
        self.variants = variants
        self.qaScore = qaScore
    }
}

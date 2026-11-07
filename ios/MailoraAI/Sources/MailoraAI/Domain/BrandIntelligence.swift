import Foundation

/// Pure Swift Brand Intelligence Classifier and Token Generator
public struct BrandIntelligenceResult: Sendable {
    public let brandName: String
    public let industry: String
    public let archetype: Archetype
    public let targetAudience: String
    public let artDirection: String
    public let tone: String
    public let primaryColor: String
    public let accentColor: String
    public let cardBackground: String
    public let textColor: String
    public let headingFont: String
    public let bodyFont: String
    public let extractedOffer: String
    public let hasExplicitOffer: Bool
}

public enum BrandIntelligence {
    public static func analyzePrompt(_ rawPrompt: String, userCtaUrl: String = "") -> BrandIntelligenceResult {
        let text = rawPrompt.lowercased()

        // 1. Detect Brand Name
        let brandName = extractBrandName(from: rawPrompt)

        // 2. Classify Archetype
        let archetype: Archetype
        if text.contains("mỹ phẩm") || text.contains("serum") || text.contains("nước hoa") || text.contains("son môi") || text.contains("beauty") || text.contains("cosmetic") {
            archetype = .luxuryBeauty
        } else if text.contains("laptop") || text.contains("oled") || text.contains("phần mềm") || text.contains("chip") || text.contains("ai") || text.contains("tech") {
            archetype = .modernTech
        } else if text.contains("thời trang") || text.contains("áo khoác") || text.contains("cashmere") || text.contains("fashion") || text.contains("collection") {
            archetype = .fashionEditorial
        } else if text.contains("cà phê") || text.contains("organic") || text.contains("trà") || text.contains("healthy") || text.contains("nông sản") {
            archetype = .organicLifestyle
        } else if text.contains("du lịch") || text.contains("resort") || text.contains("khách sạn") || text.contains("tour") || text.contains("vé máy bay") {
            archetype = .travelExperience
        } else if text.contains("crm") || text.contains("saas") || text.contains("b2b") || text.contains("dashboard") || text.contains("tự động hóa") {
            archetype = .saasDigital
        } else if text.contains("gym") || text.contains("spa") || text.contains("nha khoa") || text.contains("salon") || text.contains("dịch vụ") {
            archetype = .lifestyleServices
        } else {
            archetype = .universalModern
        }

        // 3. Detect Explicit Offers (Anti-Fabrication extraction)
        let (extractedOffer, hasOffer) = extractExplicitOffer(from: rawPrompt)

        // 4. Resolve Brand Design System Tokens
        switch archetype {
        case .luxuryBeauty:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Mỹ phẩm & Chăm sóc sắc đẹp",
                archetype: archetype,
                targetAudience: "Phái đẹp hiện đại tìm kiếm liệu pháp phục hồi thanh xuân đẳng cấp",
                artDirection: "Luminous Radiance & Gold Leaf",
                tone: "Sang trọng, quyến rũ, tinh tế, khẳng định vị thế đỉnh cao",
                primaryColor: "#9333EA",
                accentColor: "#F59E0B",
                cardBackground: "#FAF5FF",
                textColor: "#1E1B4B",
                headingFont: "Playfair Display, serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .modernTech:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Công nghệ tiên phong & Thiết bị",
                archetype: archetype,
                targetAudience: "Giới sáng tạo, lập trình viên và người đam mê công nghệ cao",
                artDirection: "Cyber Minimalist & OLED Dark",
                tone: "Hiện đại, sắc bén, định chuẩn công nghệ dẫn đầu",
                primaryColor: "#2563EB",
                accentColor: "#38BDF8",
                cardBackground: "#0F172A",
                textColor: "#F8FAFC",
                headingFont: "Plus Jakarta Sans, sans-serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .fashionEditorial:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Thời trang cao cấp & Thiết kế độc bản",
                archetype: archetype,
                targetAudience: "Tín đồ thời trang yêu chuộng nét tối giản thanh lịch vượt thời gian",
                artDirection: "High-Fashion Editorial & Architectural Cut",
                tone: "Sắc sảo, chuẩn mực, kiêu kỳ, đậm chất sàn diễn",
                primaryColor: "#18181B",
                accentColor: "#D97706",
                cardBackground: "#FAFAFA",
                textColor: "#09090B",
                headingFont: "Cinzel, serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .organicLifestyle:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Thực dưỡng & Lối sống Xanh hữu cơ",
                archetype: archetype,
                targetAudience: "Người quan tâm lối sống bền vững, sức khỏe thuần khiết",
                artDirection: "Earthy Warmth & Botanical Harmony",
                tone: "Ấm áp, chân thành, mộc mạc, gần gũi thiên nhiên",
                primaryColor: "#15803D",
                accentColor: "#84CC16",
                cardBackground: "#F0FDF4",
                textColor: "#14532D",
                headingFont: "Lora, serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .travelExperience:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Du lịch nghỉ dưỡng & Trải nghiệm",
                archetype: archetype,
                targetAudience: "Khách hàng khát khao kỳ nghỉ xa hoa, tái tạo năng lượng",
                artDirection: "Tropical Azure & Sunset Glow",
                tone: "Thư thái, gọi mời, phóng khoáng, khơi gợi cảm hứng xê dịch",
                primaryColor: "#0284C7",
                accentColor: "#F97316",
                cardBackground: "#F0F9FF",
                textColor: "#0C4A6E",
                headingFont: "Merriweather, serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .saasDigital:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Giải pháp SaaS & Phần mềm chuyển đổi số",
                archetype: archetype,
                targetAudience: "Doanh nghiệp SMB & Đội ngũ cần tối ưu năng suất làm việc",
                artDirection: "Clean Velocity & Metrics Grid",
                tone: "Đáng tin cậy, chuyên nghiệp, tập trung vào hiệu suất đo lường",
                primaryColor: "#4F46E5",
                accentColor: "#06B6D4",
                cardBackground: "#EEF2FF",
                textColor: "#1E1B4B",
                headingFont: "Inter, sans-serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .lifestyleServices:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Dịch vụ đời sống, Thể hình & Chăm sóc sức khỏe",
                archetype: archetype,
                targetAudience: "Hội viên mong muốn nâng tầm thể chất và lối sống năng động",
                artDirection: "Vibrant Energy & Dynamic Focus",
                tone: "Tràn đầy nhiệt huyết, kích thích hành động, tích cực",
                primaryColor: "#E11D48",
                accentColor: "#FBBF24",
                cardBackground: "#FFF1F2",
                textColor: "#4C0519",
                headingFont: "Montserrat, sans-serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )

        case .universalModern:
            return BrandIntelligenceResult(
                brandName: brandName,
                industry: "Thương mại & Dịch vụ đa ngành",
                archetype: archetype,
                targetAudience: "Khách hàng đại chúng mong muốn trải nghiệm chất lượng uy tín",
                artDirection: "Modern Clean & Universal Elegance",
                tone: "Thân thiện, tin cậy, rõ ràng, giàu tính thuyết phục",
                primaryColor: "#6366F1",
                accentColor: "#8B5CF6",
                cardBackground: "#FFFFFF",
                textColor: "#0F172A",
                headingFont: "Playfair Display, serif",
                bodyFont: "Inter, sans-serif",
                extractedOffer: extractedOffer,
                hasExplicitOffer: hasOffer
            )
        }
    }

    private static func extractBrandName(from prompt: String) -> String {
        let prefixes = ["thương hiệu", "quán", "nhãn hàng", "shop", "công ty", "brand"]
        for prefix in prefixes {
            if let range = prompt.range(of: prefix, options: .caseInsensitive) {
                let remainder = prompt[range.upperBound...].trimmingCharacters(in: .whitespacesAndNewlines)
                let words = remainder.components(separatedBy: CharacterSet(charactersIn: " ,.:;\n"))
                if let firstWord = words.first, !firstWord.isEmpty {
                    return firstWord.capitalized
                }
            }
        }
        // Extract capitalized words
        let words = prompt.components(separatedBy: .whitespacesAndNewlines)
        for word in words where word.count > 2 && word.first?.isUppercase == true {
            return word
        }
        return "Mailora Premium"
    }

    private static func extractExplicitOffer(from prompt: String) -> (String, Bool) {
        let pattern = #"(\d+%\s*(off|giảm|discount)|giảm\s*\d+%|tặng\s+[\w\s]+|miễn\s*phí\s*[\w\s]+|freeship|mua\s*\d+\s*tặng\s*\d+)"#
        if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
           let match = regex.firstMatch(in: prompt, options: [], range: NSRange(location: 0, length: prompt.utf16.count)) {
            if let range = Range(match.range, in: prompt) {
                return (String(prompt[range]).uppercased(), true)
            }
        }
        return ("", false)
    }
}

import SwiftUI

/// Design System Tokens for Mailora.ai iOS Application
public enum DesignTokens {
    // MARK: - Color Palette
    public enum Colors {
        public static let navy = Color(red: 15/255, green: 23/255, blue: 42/255)       // #0F172A
        public static let deepNavy = Color(red: 10/255, green: 15/255, blue: 30/255)   // #0A0F1E
        public static let indigo = Color(red: 99/255, green: 102/255, blue: 241/255)   // #6366F1
        public static let purple = Color(red: 139/255, green: 92/255, blue: 246/255)   // #8B5CF6
        public static let emerald = Color(red: 16/255, green: 185/255, blue: 129/255)  // #10B981
        public static let amber = Color(red: 245/255, green: 158/255, blue: 11/255)    // #F59E0B
        public static let rose = Color(red: 244/255, green: 63/255, blue: 94/255)      // #F43F5E
        public static let slate = Color(red: 100/255, green: 116/255, blue: 139/255)  // #64748B
        
        // Backgrounds & Surfaces
        public static let background = Color(red: 248/255, green: 249/255, blue: 252/255) // #F8F9FC
        public static let surface = Color.white
        public static let surfaceSubtle = Color(red: 241/255, green: 245/255, blue: 249/255) // #F1F5F9
        public static let border = Color(red: 226/255, green: 232/255, blue: 240/255)  // #E2E8F0
        public static let borderFocus = Color(red: 99/255, green: 102/255, blue: 241/255)
        
        // Text
        public static let textPrimary = Color(red: 15/255, green: 23/255, blue: 42/255)
        public static let textSecondary = Color(red: 100/255, green: 116/255, blue: 139/255)
        public static let textMuted = Color(red: 148/255, green: 163/255, blue: 184/255)
        public static let textOnPrimary = Color.white
        
        // Brand Gradients
        public static let primaryGradient = LinearGradient(
            colors: [indigo, purple],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        
        public static let brandDarkGradient = LinearGradient(
            colors: [deepNavy, navy],
            startPoint: .top,
            endPoint: .bottom
        )
        
        public static let emeraldGradient = LinearGradient(
            colors: [emerald, Color(red: 5/255, green: 150/255, blue: 105/255)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Radii
    public enum Radii {
        public static let small: CGFloat = 8
        public static let medium: CGFloat = 12
        public static let large: CGFloat = 16
        public static let extraLarge: CGFloat = 24
        public static let pill: CGFloat = 999
    }

    // MARK: - Spacing
    public enum Spacing {
        public static let xxs: CGFloat = 4
        public static let xs: CGFloat = 8
        public static let sm: CGFloat = 12
        public static let md: CGFloat = 16
        public static let lg: CGFloat = 24
        public static let xl: CGFloat = 32
        public static let xxl: CGFloat = 48
    }
}

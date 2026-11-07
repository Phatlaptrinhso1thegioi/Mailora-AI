import Foundation

/// Centralized configuration for Mailora.ai iOS Client.
///
/// Security Requirement:
/// - Only public, client-safe credentials (such as Supabase Anon Key) are defined here.
/// - Private AI provider secrets (e.g. Gemini API Keys, Service Role Keys) MUST NEVER
///   be bundled into the iOS binary or Info.plist.
/// - All privileged operations and AI generation are proxied through authenticated Edge Functions.
public enum AppConfig {
    // MARK: - Backend Environments
    public static let supabaseUrl = URL(string: "https://your-project.supabase.co")!
    public static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key"
    public static let functionsBaseUrl = URL(string: "https://your-project.supabase.co/functions/v1")!

    // MARK: - Lifecycle & Timeouts
    /// Strict 24-hour Session TTL (Time-To-Live) before requiring re-authentication
    public static let sessionTTL: TimeInterval = 24 * 60 * 60 // 86,400 seconds
    
    /// Default network request timeout
    public static let requestTimeout: TimeInterval = 30.0
    
    /// Maximum network retry attempts with exponential backoff
    public static let maxRetryAttempts: Int = 3

    // MARK: - App Constants
    public static let appName = "Mailora.ai"
    public static let appVersion = "1.0.0"
    public static let bundleId = "ai.mailora.ios"
    public static let creditCostPerGeneration = 1
    public static let initialFreeCredits = 50

    // MARK: - Feature Flags
    public struct FeatureFlags {
        public static let enableLocalFallbackEngine: Bool = true
        public static let enableCloudSync: Bool = true
        public static let enableStrictAntiFabrication: Bool = true
        public static let enableRichHTMLExport: Bool = true
    }
}

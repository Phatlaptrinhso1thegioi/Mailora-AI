import SwiftUI
import Observation

/// Available Root Screens in the App
public enum AppScreen: Hashable, Sendable {
    case welcome
    case login
    case signUp
    case studio
}

/// Global Application Coordinator & State Container
@Observable
public final class AppState: @unchecked Sendable {
    // MARK: - Navigation State
    public var currentScreen: AppScreen = .welcome
    public var isVerifyingSession: Bool = true
    public var showSessionExpiredAlert: Bool = false

    // MARK: - Active User Session
    public var session: UserSession?
    public var userProfile: UserProfile?

    // MARK: - Prompt Handoff
    /// Preserves user prompt entered on public screen across login/signup
    public var pendingPrompt: String?
    public var pendingCtaUrl: String?

    // MARK: - Services
    private let keychain = KeychainManager.shared
    private let draftStorage = DraftStorage.shared

    public init() {}

    // MARK: - Lifecycle & Session Verification (Anti-Flash Guard)
    @MainActor
    public func verifySessionOnLaunch() async {
        isVerifyingSession = true
        defer { isVerifyingSession = false }

        // 1. Check if token exists in Keychain
        guard let token = keychain.getAccessToken() else {
            session = nil
            userProfile = nil
            // Public screen is allowed to be viewed without redirect
            return
        }

        // 2. Enforce 24-Hour Session TTL Rule
        if keychain.isSessionExpired(ttl: AppConfig.sessionTTL) {
            handleSessionExpired()
            return
        }

        // 3. Mock or fetch active profile from Supabase
        // (In real network mode, AuthService will validate token against /auth/v1/user)
        let profile = UserProfile(
            id: "usr_active_session",
            email: "user@mailora.ai",
            fullName: "Mailora Creator",
            plan: "PRO",
            credits: 50
        )
        self.userProfile = profile
        self.session = UserSession(
            accessToken: token,
            refreshToken: keychain.getRefreshToken() ?? "",
            user: profile
        )
    }

    // MARK: - Foreground Revalidation
    @MainActor
    public func handleAppForeground() {
        guard session != nil else { return }

        if keychain.isSessionExpired(ttl: AppConfig.sessionTTL) {
            handleSessionExpired()
        }
    }

    // MARK: - Safe Expiration & Draft Preservation
    @MainActor
    private func handleSessionExpired() {
        // Safe expiration: preserve any active prompt if present
        if let pending = pendingPrompt {
            draftStorage.saveDraft(prompt: pending, ctaUrl: pendingCtaUrl ?? "", response: nil)
        }

        // Sign out locally
        keychain.clearAll()
        session = nil
        userProfile = nil
        showSessionExpiredAlert = true
        currentScreen = .login
    }

    // MARK: - Authentication Transitions
    @MainActor
    public func didAuthenticate(session: UserSession) {
        self.session = session
        self.userProfile = session.user
        
        // Save to Keychain
        keychain.saveAccessToken(session.accessToken)
        keychain.saveRefreshToken(session.refreshToken)
        keychain.saveAuthTimestamp(Date())

        // Transition directly into Studio
        currentScreen = .studio
    }

    @MainActor
    public func signOut() {
        keychain.clearAll()
        session = nil
        userProfile = nil
        currentScreen = .welcome
    }

    // MARK: - Prompt Handoff Management
    @MainActor
    public func setPendingPrompt(_ prompt: String, ctaUrl: String = "") {
        self.pendingPrompt = prompt
        self.pendingCtaUrl = ctaUrl
    }

    @MainActor
    public func consumePendingPrompt() -> (prompt: String, ctaUrl: String)? {
        guard let p = pendingPrompt, !p.isEmpty else { return nil }
        let c = pendingCtaUrl ?? ""
        self.pendingPrompt = nil
        self.pendingCtaUrl = nil
        return (p, c)
    }
}

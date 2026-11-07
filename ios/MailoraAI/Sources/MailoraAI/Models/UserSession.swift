import Foundation

/// Supabase User Profile representation
public struct UserProfile: Codable, Identifiable, Sendable {
    public let id: String
    public let email: String
    public var fullName: String?
    public var avatarUrl: String?
    public var plan: String
    public var credits: Int
    public let createdAt: Date?
    public var updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case fullName = "full_name"
        case avatarUrl = "avatar_url"
        case plan
        case credits
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    public init(
        id: String,
        email: String,
        fullName: String? = nil,
        avatarUrl: String? = nil,
        plan: String = "FREE",
        credits: Int = 50,
        createdAt: Date? = Date(),
        updatedAt: Date? = Date()
    ) {
        self.id = id
        self.email = email
        self.fullName = fullName
        self.avatarUrl = avatarUrl
        self.plan = plan
        self.credits = credits
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

/// Active Authenticated Session representation
public struct UserSession: Codable, Sendable {
    public let accessToken: String
    public let refreshToken: String
    public let tokenType: String
    public let expiresIn: Int
    public let authenticatedAt: Date
    public let user: UserProfile

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case tokenType = "token_type"
        case expiresIn = "expires_in"
        case authenticatedAt = "authenticated_at"
        case user
    }

    public init(
        accessToken: String,
        refreshToken: String,
        tokenType: String = "bearer",
        expiresIn: Int = 3600,
        authenticatedAt: Date = Date(),
        user: UserProfile
    ) {
        self.accessToken = accessToken
        self.refreshToken = refreshToken
        self.tokenType = tokenType
        self.expiresIn = expiresIn
        self.authenticatedAt = authenticatedAt
        self.user = user
    }
}

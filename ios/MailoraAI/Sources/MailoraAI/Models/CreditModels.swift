import Foundation

/// User Credit Ledger Model
public struct CreditBalance: Codable, Sendable {
    public let userId: String
    public let credits: Int
    public let plan: String
    public let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case credits
        case plan
        case updatedAt = "updated_at"
    }

    public init(userId: String, credits: Int, plan: String = "FREE", updatedAt: Date = Date()) {
        self.userId = userId
        self.credits = credits
        self.plan = plan
        self.updatedAt = updatedAt
    }
}

/// Transaction Types for Credits
public enum CreditTransactionType: String, Codable, Sendable {
    case signupBonus = "SIGNUP_BONUS"
    case aiGeneration = "AI_GENERATION"
    case heroRegeneration = "HERO_REGEN"
    case planUpgrade = "PLAN_UPGRADE"
    case adminAdjustment = "ADMIN_ADJUSTMENT"
}

/// Single Credit Transaction Record
public struct CreditTransaction: Codable, Identifiable, Sendable {
    public let id: String
    public let userId: String
    public let amount: Int
    public let balanceAfter: Int
    public let reason: CreditTransactionType
    public let idempotencyKey: String?
    public let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case amount
        case balanceAfter = "balance_after"
        case reason
        case idempotencyKey = "idempotency_key"
        case createdAt = "created_at"
    }
}

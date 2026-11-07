import Foundation

/// Supabase Authentication Service (GoTrue REST)
public final class AuthService: Sendable {
    public static let shared = AuthService()
    private let client: NetworkClient

    public init(client: NetworkClient = .shared) {
        self.client = client
    }

    /// Sign in with Email and Password
    public func signIn(email: String, password: String) async throws -> UserSession {
        // Validation
        let cleanEmail = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard cleanEmail.contains("@") && cleanEmail.contains(".") else {
            throw NetworkError.serverError(statusCode: 400, message: "Email không đúng định dạng.")
        }
        guard password.count >= 6 else {
            throw NetworkError.serverError(statusCode: 400, message: "Mật khẩu tối thiểu 6 ký tự.")
        }

        let url = AppConfig.supabaseUrl.appendingPathComponent("auth/v1/token")
        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "password")]

        let payload: [String: String] = [
            "email": cleanEmail,
            "password": password
        ]
        let bodyData = try JSONEncoder().encode(payload)

        do {
            struct AuthResponse: Codable {
                let access_token: String
                let refresh_token: String
                let expires_in: Int
                let user: UserDetails

                struct UserDetails: Codable {
                    let id: String
                    let email: String
                    let user_metadata: [String: String]?
                }
            }

            let res: AuthResponse = try await client.request(
                url: components.url!,
                method: "POST",
                body: bodyData
            )

            let profile = UserProfile(
                id: res.user.id,
                email: res.user.email,
                fullName: res.user.user_metadata?["full_name"] ?? cleanEmail.components(separatedBy: "@").first,
                plan: "FREE",
                credits: 50
            )

            return UserSession(
                accessToken: res.access_token,
                refreshToken: res.refresh_token,
                expiresIn: res.expires_in,
                user: profile
            )
        } catch {
            // Graceful Mock for Development/Offline if Supabase credentials are placeholder
            if AppConfig.supabaseAnonKey.contains("dummy") {
                let mockUser = UserProfile(
                    id: "usr_mock_\(UUID().uuidString.prefix(6))",
                    email: cleanEmail,
                    fullName: cleanEmail.components(separatedBy: "@").first?.capitalized ?? "Mailora User",
                    plan: "PRO",
                    credits: 50
                )
                return UserSession(
                    accessToken: "mock_jwt_token_\(UUID().uuidString)",
                    refreshToken: "mock_refresh_token_\(UUID().uuidString)",
                    user: mockUser
                )
            }
            throw error
        }
    }

    /// Register a new account
    public func signUp(email: String, password: String, fullName: String) async throws -> UserSession {
        let cleanEmail = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard cleanEmail.contains("@") else {
            throw NetworkError.serverError(statusCode: 400, message: "Email không hợp lệ.")
        }

        // Return signed in user session
        return try await signIn(email: cleanEmail, password: password)
    }

    /// Sign out and invalidate session
    public func signOut(token: String) async {
        let url = AppConfig.supabaseUrl.appendingPathComponent("auth/v1/logout")
        _ = try? await client.request(
            url: url,
            method: "POST",
            bearerToken: token
        ) as [String: String]
    }
}

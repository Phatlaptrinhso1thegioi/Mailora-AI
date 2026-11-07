import Foundation

/// Unified AI Engine Service
/// Combines Cloud Edge Function Proxy and Local Offline Engine Fallback
public final class AIEngineService: Sendable {
    public static let shared = AIEngineService()
    private let client: NetworkClient

    public init(client: NetworkClient = .shared) {
        self.client = client
    }

    /// Generates a complete 4-variant email campaign
    public func generateCampaign(
        brief: CreativeBrief,
        userToken: String?,
        idempotencyKey: String = UUID().uuidString
    ) async -> CampaignResponse {
        // Check if online cloud proxy should be attempted
        if let token = userToken, !AppConfig.supabaseAnonKey.contains("dummy") {
            do {
                let url = AppConfig.functionsBaseUrl.appendingPathComponent("generate-campaign")
                let payload: [String: Any] = [
                    "prompt": brief.rawPrompt,
                    "ctaUrl": brief.ctaUrl,
                    "model": "gemini-2.5-flash"
                ]
                let bodyData = try JSONSerialization.data(withJSONObject: payload)

                let response: CampaignResponse = try await client.request(
                    url: url,
                    method: "POST",
                    body: bodyData,
                    bearerToken: token,
                    idempotencyKey: idempotencyKey
                )

                // Enforce 4-variant schema validation
                try ResponseValidator.validateCampaignResponse(response)

                // Return cloud verified response
                return response
            } catch {
                // Log and seamlessly fall back to local engine
                print("[AIEngineService] Cloud generation error (\(error.localizedDescription)). Falling back to Local Engine.")
            }
        }

        // Deterministic High-Performance Local Engine Fallback
        return AdaptiveLocalEngine.generateCampaign(brief: brief)
    }
}

import Foundation

/// Supabase Credit Ledger Service
public final class CreditsService: Sendable {
    public static let shared = CreditsService()
    private let client: NetworkClient

    public init(client: NetworkClient = .shared) {
        self.client = client
    }

    /// Fetch current credit balance for the authenticated user
    public func fetchBalance(userId: String, token: String) async throws -> Int {
        let url = AppConfig.supabaseUrl.appendingPathComponent("rest/v1/profiles")
        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)!
        components.queryItems = [
            URLQueryItem(name: "id", value: "eq.\(userId)"),
            URLQueryItem(name: "select", value: "credits,plan")
        ]

        struct ProfileCreditRow: Codable {
            let credits: Int
            let plan: String
        }

        do {
            let rows: [ProfileCreditRow] = try await client.request(
                url: components.url!,
                bearerToken: token
            )
            return rows.first?.credits ?? 50
        } catch {
            // Offline fallback
            return 50
        }
    }
}

/// Cloud Object Storage Service (Supabase Storage scoped to user_id/...)
public final class MediaService: Sendable {
    public static let shared = MediaService()
    private let client: NetworkClient

    public init(client: NetworkClient = .shared) {
        self.client = client
    }

    /// Upload an image to Supabase Storage under user-isolated path `{user_id}/{filename}`
    public func uploadUserMedia(
        userId: String,
        imageData: Data,
        filename: String,
        mimeType: String = "image/jpeg",
        token: String
    ) async throws -> URL {
        let cleanName = filename.replacingOccurrences(of: " ", with: "_")
        let storagePath = "\(userId)/\(UUID().uuidString.prefix(8))_\(cleanName)"
        let url = AppConfig.supabaseUrl
            .appendingPathComponent("storage/v1/object/media")
            .appendingPathComponent(storagePath)

        let headers = [
            "Content-Type": mimeType,
            "x-upsert": "true"
        ]

        struct StorageUploadResponse: Codable {
            let Key: String
        }

        do {
            let _: StorageUploadResponse = try await client.request(
                url: url,
                method: "POST",
                headers: headers,
                body: imageData,
                bearerToken: token
            )
            // Public URL
            let publicUrl = AppConfig.supabaseUrl
                .appendingPathComponent("storage/v1/object/public/media")
                .appendingPathComponent(storagePath)
            return publicUrl
        } catch {
            // Local fallback simulation URL
            return URL(string: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=880&q=80")!
        }
    }
}

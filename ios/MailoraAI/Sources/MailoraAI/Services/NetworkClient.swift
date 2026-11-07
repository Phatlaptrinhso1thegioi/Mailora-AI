import Foundation

/// Network Errors
public enum NetworkError: LocalizedError, Sendable {
    case invalidURL
    case unauthorized
    case serverError(statusCode: Int, message: String)
    case decodingError(String)
    case offline
    case rateLimited
    case timeout

    public var errorDescription: String? {
        switch self {
        case .invalidURL: return "Địa chỉ máy chủ không hợp lệ."
        case .unauthorized: return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
        case .serverError(let code, let msg): return "Lỗi máy chủ (\(code)): \(msg)"
        case .decodingError(let details): return "Dữ liệu trả về không đúng định dạng: \(details)"
        case .offline: return "Không thể kết nối internet. Đang kích hoạt chế độ Offline."
        case .rateLimited: return "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau ít phút."
        case .timeout: return "Yêu cầu phản hồi quá thời gian quy định."
        }
    }
}

/// Centralized HTTP Client with Retry Policy, Bearer Auth, and Idempotency
public final class NetworkClient: Sendable {
    public static let shared = NetworkClient()
    private let session: URLSession

    public init(session: URLSession = .shared) {
        self.session = session
    }

    public func request<T: Decodable>(
        url: URL,
        method: String = "GET",
        headers: [String: String] = [:],
        body: Data? = nil,
        bearerToken: String? = nil,
        idempotencyKey: String? = nil,
        maxRetries: Int = AppConfig.maxRetryAttempts
    ) async throws -> T {
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.timeoutInterval = AppConfig.requestTimeout
        req.httpBody = body

        // Standard headers
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        req.setValue(AppConfig.supabaseAnonKey, forHTTPHeaderField: "apikey")

        // Auth token
        if let token = bearerToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Idempotency key for credit-safe operations
        if let ikey = idempotencyKey {
            req.setValue(ikey, forHTTPHeaderField: "X-Idempotency-Key")
        }

        // Custom headers
        for (k, v) in headers {
            req.setValue(v, forHTTPHeaderField: k)
        }

        var currentAttempt = 0
        var delay: TimeInterval = 1.0

        while true {
            currentAttempt += 1
            do {
                let (data, response) = try await session.data(for: req)
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw NetworkError.serverError(statusCode: -1, message: "Phản hồi không xác định")
                }

                if httpResponse.statusCode == 401 {
                    throw NetworkError.unauthorized
                }
                if httpResponse.statusCode == 429 {
                    throw NetworkError.rateLimited
                }
                guard (200...299).contains(httpResponse.statusCode) else {
                    let errMsg = String(data: data, encoding: .utf8) ?? "Lỗi HTTP \(httpResponse.statusCode)"
                    throw NetworkError.serverError(statusCode: httpResponse.statusCode, message: errMsg)
                }

                do {
                    let decoder = JSONDecoder()
                    decoder.dateDecodingStrategy = .iso8601
                    return try decoder.decode(T.self, from: data)
                } catch {
                    throw NetworkError.decodingError(error.localizedDescription)
                }
            } catch {
                if currentAttempt >= maxRetries || !isRetryable(error: error) {
                    throw error
                }
                try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                delay *= 2.0 // Exponential backoff
            }
        }
    }

    private func isRetryable(error: Error) -> Bool {
        if let netErr = error as? NetworkError {
            switch netErr {
            case .serverError(let code, _) where code >= 500: return true
            case .rateLimited, .timeout: return true
            default: return false
            }
        }
        let nsError = error as NSError
        return nsError.domain == NSURLErrorDomain
    }
}

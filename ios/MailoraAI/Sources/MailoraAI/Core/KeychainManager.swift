import Foundation
import Security

/// Secure Keychain wrapper for iOS credentials and session TTL timestamp
public final class KeychainManager: @unchecked Sendable {
    public static let shared = KeychainManager()
    
    private let service = "ai.mailora.auth"
    private let tokenKey = "mailora_access_token"
    private let refreshTokenKey = "mailora_refresh_token"
    private let authTimestampKey = "mailora_auth_timestamp"
    
    private init() {}

    // MARK: - Access Token
    public func saveAccessToken(_ token: String) {
        save(key: tokenKey, value: token)
    }

    public func getAccessToken() -> String? {
        getString(key: tokenKey)
    }

    // MARK: - Refresh Token
    public func saveRefreshToken(_ token: String) {
        save(key: refreshTokenKey, value: token)
    }

    public func getRefreshToken() -> String? {
        getString(key: refreshTokenKey)
    }

    // MARK: - Auth Timestamp for 24h TTL
    public func saveAuthTimestamp(_ date: Date = Date()) {
        let timestamp = String(date.timeIntervalSince1970)
        save(key: authTimestampKey, value: timestamp)
    }

    public func getAuthTimestamp() -> Date? {
        guard let str = getString(key: authTimestampKey),
              let interval = TimeInterval(str) else {
            return nil
        }
        return Date(timeIntervalSince1970: interval)
    }

    public func isSessionExpired(ttl: TimeInterval = AppConfig.sessionTTL) -> Bool {
        guard let authDate = getAuthTimestamp() else {
            return true
        }
        let elapsed = Date().timeIntervalSince(authDate)
        return elapsed > ttl
    }

    // MARK: - Clear All
    public func clearAll() {
        delete(key: tokenKey)
        delete(key: refreshTokenKey)
        delete(key: authTimestampKey)
    }

    // MARK: - Internal Keychain CRUD
    private func save(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }
        delete(key: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        SecItemAdd(query as CFDictionary, nil)
    }

    private func getString(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

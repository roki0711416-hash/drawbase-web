import Foundation
import Security

/// Keychain Helper for securely storing authentication tokens.
///
/// Uses iOS Keychain Services to persist JWT tokens across app launches.
enum KeychainHelper {

    private static let service = "net.drawbase.app"
    private static let tokenKey = "auth_token"

    // MARK: - Token

    /// Save JWT token to Keychain.
    static func saveToken(_ token: String) {
        guard let data = token.data(using: .utf8) else { return }
        
        // Delete existing item first
        deleteToken()
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: tokenKey,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
        ]
        
        SecItemAdd(query as CFDictionary, nil)
    }

    /// Retrieve JWT token from Keychain.
    static func getToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: tokenKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let token = String(data: data, encoding: .utf8) else {
            return nil
        }

        return token
    }

    /// Delete JWT token from Keychain.
    static func deleteToken() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: tokenKey,
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}

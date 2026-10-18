import Foundation
#if canImport(Security)
import Security
#endif

// Synchronous storage deliberately keeps read/write/delete inside the session actor's
// non-suspending critical section. Implementations must be thread-safe.
protocol KeychainStore: Sendable {
    func read() throws -> String?
    func save(_ token: String) throws
    func delete() throws
}

enum KeychainError: Error, Sendable { case unavailable, status(Int32), invalidData }

struct DeviceKeychainStore: KeychainStore {
    let service: String
    #if canImport(Security)
    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: service, kSecAttrAccount as String: "refresh-token",
         kSecAttrSynchronizable as String: false]
    }
    func read() throws -> String? {
        var attributes = query
        attributes[kSecReturnData as String] = true
        attributes[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        let status = SecItemCopyMatching(attributes as CFDictionary, &item)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess else { throw KeychainError.status(status) }
        guard let data = item as? Data, let value = String(data: data, encoding: .utf8), !value.isEmpty else {
            throw KeychainError.invalidData
        }
        return value
    }
    func save(_ token: String) throws {
        let values: [String: Any] = [kSecValueData as String: Data(token.utf8),
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        var status = SecItemUpdate(query as CFDictionary, values as CFDictionary)
        if status == errSecItemNotFound {
            status = SecItemAdd(query.merging(values) { _, new in new } as CFDictionary, nil)
            if status == errSecDuplicateItem { status = SecItemUpdate(query as CFDictionary, values as CFDictionary) }
        }
        guard status == errSecSuccess else { throw KeychainError.status(status) }
    }
    func delete() throws {
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw KeychainError.status(status) }
    }
    #else
    func read() throws -> String? { throw KeychainError.unavailable }
    func save(_ token: String) throws { throw KeychainError.unavailable }
    func delete() throws { throw KeychainError.unavailable }
    #endif
}

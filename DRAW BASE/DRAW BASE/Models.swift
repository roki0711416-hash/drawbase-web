import Foundation

/// User role — matches backend UserRole enum.
enum UserRole: String, Codable, Sendable {
    case creator = "CREATOR"
    case fan = "FAN"
    case both = "BOTH"
}

/// Authenticated user model returned from the API.
struct AppUser: Codable, Sendable {
    let id: String
    let email: String
    let name: String
    let displayName: String?
    let avatarUrl: String?
    let role: UserRole?
}

/// Login / Register API response.
struct AuthResponse: Decodable {
    let token: String
    let user: AppUser
}

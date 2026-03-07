import Foundation

/// DRAW BASE API Configuration
///
/// Manages API base URL for connecting to the DRAW BASE backend.
/// - Production: https://api.drawbase.net
/// - Development: http://localhost:3000
enum APIConfig {

    /// Current environment
    enum Environment {
        case development
        case production
    }

    #if DEBUG
    static let environment: Environment = .development
    #else
    static let environment: Environment = .production
    #endif

    /// API base URL
    static var baseURL: URL {
        switch environment {
        case .development:
            return URL(string: "http://localhost:3000")!
        case .production:
            return URL(string: "https://api.drawbase.net")!
        }
    }

    /// Construct a full API endpoint URL
    /// - Parameter path: API path (e.g., "/api/posts/feed")
    /// - Returns: Full URL
    static func url(for path: String) -> URL {
        baseURL.appendingPathComponent(path)
    }
}

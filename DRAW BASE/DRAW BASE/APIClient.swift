import Foundation

/// DRAW BASE API Client
///
/// Centralized HTTP client for all API requests to the DRAW BASE backend.
/// Uses ``APIConfig`` for base URL resolution.
///
/// Usage:
/// ```swift
/// let response: APIResponse<[Post]> = try await APIClient.shared.get("/api/posts/feed")
/// ```
actor APIClient {

    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        self.decoder = decoder
    }

    // MARK: - Public API

    /// Perform a GET request.
    func get<T: Decodable>(
        _ path: String,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        var components = URLComponents(
            url: APIConfig.url(for: path),
            resolvingAgainstBaseURL: true
        )!
        components.queryItems = queryItems

        guard let url = components.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        applyAuthHeader(&request)

        return try await perform(request)
    }

    /// Perform a POST request with JSON body.
    func post<T: Decodable>(
        _ path: String,
        body: some Encodable
    ) async throws -> T {
        let url = APIConfig.url(for: path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONEncoder().encode(body)
        applyAuthHeader(&request)

        return try await perform(request)
    }

    /// Perform a PATCH request with JSON body.
    func patch<T: Decodable>(
        _ path: String,
        body: some Encodable
    ) async throws -> T {
        let url = APIConfig.url(for: path)
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONEncoder().encode(body)
        applyAuthHeader(&request)

        return try await perform(request)
    }

    // MARK: - Auth

    /// Attach Bearer token from Keychain if available.
    private func applyAuthHeader(_ request: inout URLRequest) {
        if let token = KeychainHelper.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }

    // MARK: - Private

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if let errorBody = try? decoder.decode(APIErrorBody.self, from: data) {
                throw APIError.server(
                    statusCode: httpResponse.statusCode,
                    message: errorBody.error
                )
            }
            throw APIError.server(
                statusCode: httpResponse.statusCode,
                message: "Unknown error"
            )
        }

        return try decoder.decode(T.self, from: data)
    }
}

// MARK: - Response Types

/// Standard API response wrapper.
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: String?
}

/// Error body returned by the API.
private struct APIErrorBody: Decodable {
    let success: Bool
    let error: String
}

/// API client errors.
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case server(statusCode: Int, message: String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .server(let statusCode, let message):
            return "Server error (\(statusCode)): \(message)"
        }
    }
}

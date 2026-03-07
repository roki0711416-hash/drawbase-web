import Foundation
import Observation

/// Central authentication state manager.
///
/// Manages login, registration, logout, and role selection.
/// Persists JWT token in Keychain and user data in memory.
///
/// Usage:
/// ```swift
/// @State private var authManager = AuthManager()
///
/// if authManager.isLoggedIn {
///     // show main app
/// } else {
///     // show login
/// }
/// ```
@Observable
final class AuthManager {

    // MARK: - State

    /// Current authenticated user (nil if not logged in).
    private(set) var currentUser: AppUser?

    /// Whether a login/register request is in progress.
    private(set) var isLoading = false

    /// Last error message from an auth operation.
    private(set) var errorMessage: String?

    /// Convenience: whether the user is logged in.
    var isLoggedIn: Bool { currentUser != nil }

    /// Convenience: whether the user has selected a role.
    var hasSelectedRole: Bool { currentUser?.role != nil }

    /// Convenience: current user role.
    var role: UserRole? { currentUser?.role }

    // MARK: - Init

    init() {
        // Try to restore session from Keychain on launch
        if KeychainHelper.getToken() != nil {
            Task { await restoreSession() }
        }
    }

    // MARK: - Login

    /// Log in with email and password.
    /// Calls POST /api/auth/login/token and stores the JWT.
    @MainActor
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let body = LoginBody(email: email, password: password)
            let response: APIResponse<AuthResponse> = try await APIClient.shared.post(
                "/api/auth/login/token",
                body: body
            )

            guard let data = response.data else {
                errorMessage = response.error ?? "ログインに失敗しました"
                isLoading = false
                return
            }

            KeychainHelper.saveToken(data.token)
            currentUser = data.user
            isLoading = false
        } catch {
            errorMessage = "ネットワークエラーが発生しました"
            isLoading = false
        }
    }

    // MARK: - Register

    /// Register a new account.
    /// Calls POST /api/auth/register, then auto-logs in.
    @MainActor
    func register(name: String, email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        do {
            // Step 1: Register
            let registerBody = RegisterBody(name: name, email: email, password: password)
            let _: APIResponse<AppUser> = try await APIClient.shared.post(
                "/api/auth/register",
                body: registerBody
            )

            // Step 2: Auto-login
            await login(email: email, password: password)
        } catch {
            errorMessage = "登録に失敗しました"
            isLoading = false
        }
    }

    // MARK: - Role Selection

    /// Set the user's role (onboarding step).
    /// Calls PATCH /api/users/[id]/role.
    @MainActor
    func selectRole(_ role: UserRole) async {
        guard let userId = currentUser?.id else { return }
        isLoading = true
        errorMessage = nil

        do {
            let body = RoleBody(role: role.rawValue)
            let response: APIResponse<RoleResponse> = try await APIClient.shared.patch(
                "/api/users/\(userId)/role",
                body: body
            )

            if let data = response.data {
                // Update local user with new role
                currentUser = AppUser(
                    id: currentUser!.id,
                    email: currentUser!.email,
                    name: currentUser!.name,
                    displayName: currentUser!.displayName,
                    avatarUrl: currentUser!.avatarUrl,
                    role: UserRole(rawValue: data.role)
                )
            }
            isLoading = false
        } catch {
            errorMessage = "ロール設定に失敗しました"
            isLoading = false
        }
    }

    // MARK: - Session Restore

    /// Restore session from saved token by calling GET /api/auth/me.
    @MainActor
    func restoreSession() async {
        guard KeychainHelper.getToken() != nil else { return }

        do {
            let response: APIResponse<AppUser> = try await APIClient.shared.get("/api/auth/me")
            currentUser = response.data
        } catch {
            // Token expired or invalid — clear it
            KeychainHelper.deleteToken()
            currentUser = nil
        }
    }

    // MARK: - Logout

    /// Log out: clear token and user data.
    @MainActor
    func logout() {
        KeychainHelper.deleteToken()
        currentUser = nil
        errorMessage = nil
    }
}

// MARK: - Request Bodies

private struct LoginBody: Encodable {
    let email: String
    let password: String
}

private struct RegisterBody: Encodable {
    let name: String
    let email: String
    let password: String
}

private struct RoleBody: Encodable {
    let role: String
}

private struct RoleResponse: Decodable {
    let id: String
    let role: String
}

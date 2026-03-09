import Foundation
import Observation

/// Central manager for all fan-specific data operations.
///
/// Handles dashboard, favorites, following, profile, and notifications.
///
/// Usage:
/// ```swift
/// @State private var fanManager = FanManager()
/// FanDashboardView()
///     .environment(fanManager)
/// ```
@Observable
final class FanManager {

    // MARK: - State

    /// Dashboard data (stats + recent favorites).
    private(set) var dashboardData: FanDashboardData?

    /// Paginated favorites list.
    private(set) var favorites: [FavoriteItem] = []

    /// Paginated following list.
    private(set) var following: [FollowingCreator] = []

    /// Current fan profile.
    private(set) var profile: FanProfile?

    /// Notifications list.
    private(set) var notifications: [NotificationItem] = []

    /// Loading state per operation.
    private(set) var isLoading = false

    /// Last error message.
    private(set) var errorMessage: String?

    // MARK: - Dashboard

    /// Fetch fan dashboard data (stats + recent favorites).
    @MainActor
    func fetchDashboard() async {
        isLoading = true
        errorMessage = nil

        do {
            let response: APIResponse<FanDashboardData> = try await APIClient.shared.get(
                "/api/fan/dashboard"
            )
            dashboardData = response.data
        } catch {
            errorMessage = "ダッシュボードの読み込みに失敗しました"
        }

        isLoading = false
    }

    // MARK: - Favorites

    /// Fetch paginated favorites.
    @MainActor
    func fetchFavorites(page: Int = 1) async {
        isLoading = true
        errorMessage = nil

        do {
            let response: APIResponse<[FavoriteItem]> = try await APIClient.shared.get(
                "/api/fan/favorites",
                queryItems: [
                    URLQueryItem(name: "page", value: "\(page)"),
                    URLQueryItem(name: "limit", value: "20"),
                ]
            )
            if page == 1 {
                favorites = response.data ?? []
            } else {
                favorites.append(contentsOf: response.data ?? [])
            }
        } catch {
            errorMessage = "お気に入りの読み込みに失敗しました"
        }

        isLoading = false
    }

    /// Add a post to favorites.
    @MainActor
    func addFavorite(postId: String) async -> Bool {
        do {
            struct Body: Encodable { let postId: String }
            let _: APIResponse<FavoriteItem> = try await APIClient.shared.post(
                "/api/fan/favorites",
                body: Body(postId: postId)
            )
            return true
        } catch {
            errorMessage = "お気に入りに追加できませんでした"
            return false
        }
    }

    /// Remove a post from favorites.
    @MainActor
    func removeFavorite(postId: String) async -> Bool {
        do {
            struct EmptyResponse: Decodable {}
            let _: APIResponse<EmptyResponse> = try await APIClient.shared.delete(
                "/api/fan/favorites",
                queryItems: [URLQueryItem(name: "postId", value: postId)]
            )
            favorites.removeAll { $0.post.id == postId }
            return true
        } catch {
            errorMessage = "お気に入りから削除できませんでした"
            return false
        }
    }

    // MARK: - Following

    /// Fetch creators the user is following.
    @MainActor
    func fetchFollowing(page: Int = 1) async {
        isLoading = true
        errorMessage = nil

        do {
            let response: APIResponse<[FollowingCreator]> = try await APIClient.shared.get(
                "/api/fan/following",
                queryItems: [
                    URLQueryItem(name: "page", value: "\(page)"),
                    URLQueryItem(name: "limit", value: "20"),
                ]
            )
            if page == 1 {
                following = response.data ?? []
            } else {
                following.append(contentsOf: response.data ?? [])
            }
        } catch {
            errorMessage = "フォローリストの読み込みに失敗しました"
        }

        isLoading = false
    }

    /// Unfollow a creator.
    @MainActor
    func unfollow(creatorId: String) async -> Bool {
        do {
            struct Body: Encodable { let followingId: String }
            struct EmptyResponse: Decodable {}
            let _: APIResponse<EmptyResponse> = try await APIClient.shared.post(
                "/api/community",
                body: Body(followingId: creatorId)
            )
            following.removeAll { $0.id == creatorId }
            return true
        } catch {
            errorMessage = "フォロー解除できませんでした"
            return false
        }
    }

    // MARK: - Profile

    /// Fetch the current fan's profile.
    @MainActor
    func fetchProfile() async {
        isLoading = true
        errorMessage = nil

        do {
            let response: APIResponse<FanProfile> = try await APIClient.shared.get(
                "/api/fan/profile"
            )
            profile = response.data
        } catch {
            errorMessage = "プロフィールの読み込みに失敗しました"
        }

        isLoading = false
    }

    /// Update the current fan's profile.
    @MainActor
    func updateProfile(_ body: FanProfileUpdateBody) async -> Bool {
        isLoading = true
        errorMessage = nil

        do {
            let response: APIResponse<FanProfile> = try await APIClient.shared.put(
                "/api/fan/profile",
                body: body
            )
            profile = response.data
            isLoading = false
            return true
        } catch {
            errorMessage = "プロフィールの更新に失敗しました"
            isLoading = false
            return false
        }
    }

    // MARK: - Notifications

    /// Fetch notifications.
    @MainActor
    func fetchNotifications() async {
        isLoading = true
        errorMessage = nil

        do {
            let response: APIResponse<[NotificationItem]> = try await APIClient.shared.get(
                "/api/notifications"
            )
            notifications = response.data ?? []
        } catch {
            errorMessage = "通知の読み込みに失敗しました"
        }

        isLoading = false
    }
}

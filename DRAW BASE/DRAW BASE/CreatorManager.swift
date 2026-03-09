import Foundation
import Observation

/// Manages creator-specific data: dashboard, profile, works, commissions.
///
/// Usage:
/// ```swift
/// @State private var creatorManager = CreatorManager()
/// ```
@Observable
final class CreatorManager {

    // MARK: - State

    private(set) var profile: CreatorProfile?
    private(set) var dashboardData: DashboardData?
    private(set) var works: [WorkItem] = []
    private(set) var commissionMenus: [CommissionMenuItem] = []

    private(set) var isLoading = false
    private(set) var errorMessage: String?

    // MARK: - Dashboard

    @MainActor
    func fetchDashboard() async {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<DashboardData> = try await APIClient.shared.get(
                "/api/creator/dashboard"
            )
            dashboardData = response.data
        } catch {
            errorMessage = "ダッシュボードの取得に失敗しました"
        }
        isLoading = false
    }

    // MARK: - Profile

    @MainActor
    func fetchProfile() async {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<CreatorProfile> = try await APIClient.shared.get(
                "/api/creator/profile"
            )
            profile = response.data
        } catch {
            errorMessage = "プロフィールの取得に失敗しました"
        }
        isLoading = false
    }

    @MainActor
    func updateProfile(_ body: ProfileUpdateBody) async -> Bool {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<CreatorProfile> = try await APIClient.shared.put(
                "/api/creator/profile",
                body: body
            )
            if response.success {
                profile = response.data
                isLoading = false
                return true
            } else {
                errorMessage = response.error ?? "更新に失敗しました"
            }
        } catch {
            errorMessage = "ネットワークエラーが発生しました"
        }
        isLoading = false
        return false
    }

    // MARK: - Works

    @MainActor
    func fetchWorks(page: Int = 1) async {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<[WorkItem]> = try await APIClient.shared.get(
                "/api/creator/works",
                queryItems: [URLQueryItem(name: "page", value: "\(page)")]
            )
            works = response.data ?? []
        } catch {
            errorMessage = "作品の取得に失敗しました"
        }
        isLoading = false
    }

    @MainActor
    func createWork(_ body: NewWorkBody) async -> Bool {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<WorkItem> = try await APIClient.shared.post(
                "/api/creator/works",
                body: body
            )
            if response.success {
                isLoading = false
                return true
            } else {
                errorMessage = response.error ?? "投稿に失敗しました"
            }
        } catch {
            errorMessage = "ネットワークエラーが発生しました"
        }
        isLoading = false
        return false
    }

    // MARK: - Commissions

    @MainActor
    func fetchCommissions() async {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<[CommissionMenuItem]> = try await APIClient.shared.get(
                "/api/creator/commissions"
            )
            commissionMenus = response.data ?? []
        } catch {
            errorMessage = "コミッションの取得に失敗しました"
        }
        isLoading = false
    }

    @MainActor
    func createCommission(_ body: NewCommissionBody) async -> Bool {
        isLoading = true
        errorMessage = nil
        do {
            let response: APIResponse<CommissionMenuItem> = try await APIClient.shared.post(
                "/api/creator/commissions",
                body: body
            )
            if response.success {
                await fetchCommissions()
                isLoading = false
                return true
            } else {
                errorMessage = response.error ?? "作成に失敗しました"
            }
        } catch {
            errorMessage = "ネットワークエラーが発生しました"
        }
        isLoading = false
        return false
    }

    @MainActor
    func toggleCommissionOpen(_ menu: CommissionMenuItem) async {
        do {
            let body = CommissionUpdateBody(id: menu.id, isOpen: !menu.isOpen)
            let _: APIResponse<CommissionMenuItem> = try await APIClient.shared.put(
                "/api/creator/commissions",
                body: body
            )
            await fetchCommissions()
        } catch {
            errorMessage = "更新に失敗しました"
        }
    }

    @MainActor
    func deleteCommission(id: String) async {
        do {
            let _: APIResponse<Bool> = try await APIClient.shared.delete(
                "/api/creator/commissions",
                queryItems: [URLQueryItem(name: "id", value: id)]
            )
            await fetchCommissions()
        } catch {
            errorMessage = "削除に失敗しました"
        }
    }
}

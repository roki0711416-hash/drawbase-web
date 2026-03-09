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

// MARK: - Creator Models

/// Creator profile with full details.
struct CreatorProfile: Codable, Sendable {
    let id: String
    let name: String
    let displayName: String?
    let email: String?
    let bio: String?
    let avatarUrl: String?
    let headerUrl: String?
    let website: String?
    let twitterHandle: String?
    let instagramHandle: String?
    let pixivUrl: String?
    let genres: [String]
    let commissionOpen: Bool
    let role: UserRole?
    let createdAt: String?
    let _count: ProfileCounts?
}

struct ProfileCounts: Codable, Sendable {
    let posts: Int
    let followers: Int
    let following: Int
}

/// Profile update request body.
struct ProfileUpdateBody: Encodable {
    let displayName: String?
    let bio: String?
    let avatarUrl: String?
    let headerUrl: String?
    let website: String?
    let twitterHandle: String?
    let instagramHandle: String?
    let pixivUrl: String?
    let genres: [String]
    let commissionOpen: Bool
}

/// Dashboard stats.
struct DashboardData: Decodable {
    let stats: DashboardStats
    let recentWorks: [WorkItem]
}

struct DashboardStats: Decodable {
    let worksCount: Int
    let commissionsCount: Int
    let pendingOrders: Int
    let unreadNotifications: Int
    let followersCount: Int
    let totalLikes: Int
}

/// Work / Post item.
struct WorkItem: Codable, Identifiable, Sendable {
    let id: String
    let title: String
    let description: String?
    let imageUrls: [String]
    let tags: [String]?
    let isNsfw: Bool?
    let isPublished: Bool?
    let viewCount: Int?
    let createdAt: String
    let updatedAt: String?
    let _count: WorkCounts?
}

struct WorkCounts: Codable, Sendable {
    let likes: Int
    let comments: Int
}

/// New work request body.
struct NewWorkBody: Encodable {
    let title: String
    let description: String?
    let imageUrls: [String]
    let tags: [String]
    let isNsfw: Bool
}

/// Commission menu item.
struct CommissionMenuItem: Codable, Identifiable, Sendable {
    let id: String
    let title: String
    let description: String?
    let price: Int
    let currency: String
    let deliveryDays: Int
    let revisionCount: Int
    let thumbnailUrl: String?
    let isOpen: Bool
    let maxSlots: Int
    let currentSlots: Int
    let createdAt: String
    let updatedAt: String?
    let _count: CommissionCounts?
}

struct CommissionCounts: Codable, Sendable {
    let orders: Int
}

/// New commission menu request body.
struct NewCommissionBody: Encodable {
    let title: String
    let description: String?
    let price: Int
    let deliveryDays: Int
    let revisionCount: Int
    let maxSlots: Int
}

/// Commission menu update body.
struct CommissionUpdateBody: Encodable {
    let id: String
    let isOpen: Bool?
}

/// Paginated works response.
struct PaginatedWorksResponse: Decodable {
    let success: Bool
    let data: [WorkItem]?
    let pagination: PaginationInfo?
}

struct PaginationInfo: Decodable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

// MARK: - Fan Models

/// Fan dashboard stats.
struct FanDashboardData: Decodable {
    let stats: FanStats
    let recentFavorites: [FavoriteItem]
}

struct FanStats: Decodable {
    let favoritesCount: Int
    let followingCount: Int
    let purchasesCount: Int
    let ordersCount: Int
    let unreadNotifications: Int
}

/// Favorite item — includes the post and its author.
struct FavoriteItem: Codable, Identifiable, Sendable {
    let id: String
    let createdAt: String
    let post: FavoritePost
}

struct FavoritePost: Codable, Sendable {
    let id: String
    let title: String
    let imageUrls: [String]
    let author: FavoriteAuthor
}

struct FavoriteAuthor: Codable, Sendable {
    let id: String
    let name: String
    let displayName: String?
    let avatarUrl: String?
}

/// Creator summary shown in the following list.
struct FollowingCreator: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let displayName: String?
    let bio: String?
    let avatarUrl: String?
    let genres: [String]
    let commissionOpen: Bool
    let _count: FollowingCounts?
}

struct FollowingCounts: Codable, Sendable {
    let posts: Int
    let followers: Int
}

/// Fan profile for editing.
struct FanProfile: Codable, Sendable {
    let id: String
    let name: String
    let displayName: String?
    let bio: String?
    let avatarUrl: String?
    let headerUrl: String?
    let website: String?
    let twitterHandle: String?
    let _count: FanProfileCounts?
}

struct FanProfileCounts: Codable, Sendable {
    let following: Int
    let likes: Int
}

/// Fan profile update body.
struct FanProfileUpdateBody: Encodable {
    let displayName: String?
    let bio: String?
    let avatarUrl: String?
    let headerUrl: String?
    let website: String?
    let twitterHandle: String?
}

/// Notification item.
struct NotificationItem: Codable, Identifiable, Sendable {
    let id: String
    let type: String
    let title: String
    let message: String
    let isRead: Bool
    let linkUrl: String?
    let createdAt: String
}

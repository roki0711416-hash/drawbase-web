import SwiftUI

/// Fan dashboard — shows stats, recent favorites, and quick actions.
struct FanDashboardView: View {

    @Environment(FanManager.self) private var fanManager
    @Environment(AuthManager.self) private var authManager

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Welcome card
                    welcomeCard

                    // Stats grid
                    if let stats = fanManager.dashboardData?.stats {
                        statsGrid(stats)
                    }

                    // Recent favorites
                    recentFavoritesSection
                }
                .padding()
            }
            .navigationTitle("ホーム")
            .refreshable {
                await fanManager.fetchDashboard()
            }
            .task {
                if fanManager.dashboardData == nil {
                    await fanManager.fetchDashboard()
                }
            }
            .overlay {
                if fanManager.isLoading && fanManager.dashboardData == nil {
                    ProgressView()
                }
            }
        }
    }

    // MARK: - Welcome Card

    private var welcomeCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("おかえりなさい ✨")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(.white)

            Text("お気に入りのクリエイターの新着作品をチェックしましょう")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.85))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            LinearGradient(
                colors: [.pink, .purple],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Stats Grid

    private func statsGrid(_ stats: FanStats) -> some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible()),
        ], spacing: 12) {
            statCard(icon: "heart.fill", label: "お気に入り", value: stats.favoritesCount, color: .pink)
            statCard(icon: "person.2.fill", label: "フォロー中", value: stats.followingCount, color: .purple)
            statCard(icon: "bag.fill", label: "購入", value: stats.purchasesCount, color: .blue)
            statCard(icon: "list.clipboard.fill", label: "依頼", value: stats.ordersCount, color: .green)
        }
    }

    private func statCard(icon: String, label: String, value: Int, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)

            Text("\(value)")
                .font(.title)
                .fontWeight(.bold)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Recent Favorites

    private var recentFavoritesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("最近のお気に入り")
                    .font(.headline)
                Spacer()
                NavigationLink("すべて見る") {
                    FanFavoritesView()
                }
                .font(.caption)
            }

            let items = fanManager.dashboardData?.recentFavorites ?? []

            if items.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "heart")
                        .font(.largeTitle)
                        .foregroundStyle(.secondary)
                    Text("まだお気に入りがありません")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                ], spacing: 8) {
                    ForEach(items) { fav in
                        favoriteThumb(fav)
                    }
                }
            }
        }
    }

    private func favoriteThumb(_ item: FavoriteItem) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            if let url = item.post.imageUrls.first, let imageURL = URL(string: url) {
                AsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(1, contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(.gray.opacity(0.1))
                        .aspectRatio(1, contentMode: .fill)
                        .overlay {
                            Image(systemName: "photo")
                                .foregroundStyle(.secondary)
                        }
                }
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            Text(item.post.title)
                .font(.caption2)
                .lineLimit(1)
                .foregroundStyle(.primary)
        }
    }
}

#Preview {
    FanDashboardView()
        .environment(FanManager())
        .environment(AuthManager())
}

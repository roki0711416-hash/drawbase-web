import SwiftUI

/// Creator dashboard — shows welcome, stats, recent works, notifications.
struct CreatorDashboardView: View {

    @Environment(AuthManager.self) private var authManager
    @State private var manager = CreatorManager()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // ── ようこそ ──
                    welcomeCard

                    // ── 統計 ──
                    if let stats = manager.dashboardData?.stats {
                        statsGrid(stats)
                    }

                    // ── 最近の作品 ──
                    recentWorksSection

                    // ── 通知サマリー ──
                    if let stats = manager.dashboardData?.stats,
                       stats.unreadNotifications > 0 {
                        notificationBanner(stats)
                    }
                }
                .padding()
            }
            .navigationTitle("ダッシュボード")
            .refreshable {
                await manager.fetchDashboard()
            }
            .task {
                await manager.fetchDashboard()
            }
        }
    }

    // MARK: - Welcome Card

    private var welcomeCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ようこそ、\(authManager.currentUser?.displayName ?? authManager.currentUser?.name ?? "クリエイター")さん 🎨")
                .font(.title2.bold())
                .foregroundStyle(.white)

            Text("ダッシュボードであなたの活動を管理しましょう")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.8))

            HStack(spacing: 12) {
                NavigationLink("作品を投稿", destination: CreatorNewWorkView())
                    .font(.subheadline.bold())
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(.white)
                    .foregroundStyle(.blue)
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                NavigationLink("コミッション設定", destination: CreatorCommissionsView())
                    .font(.subheadline.bold())
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(.white.opacity(0.2))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(.white.opacity(0.3), lineWidth: 1)
                    )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            LinearGradient(colors: [.blue, .blue.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Stats Grid

    private func statsGrid(_ stats: DashboardStats) -> some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible()),
            GridItem(.flexible()),
        ], spacing: 12) {
            StatCard(icon: "🎨", value: stats.worksCount, label: "作品数")
            StatCard(icon: "❤️", value: stats.totalLikes, label: "いいね")
            StatCard(icon: "👥", value: stats.followersCount, label: "フォロワー")
            StatCard(icon: "📋", value: stats.commissionsCount, label: "メニュー")
            StatCard(icon: "📩", value: stats.pendingOrders, label: "未対応依頼", highlight: stats.pendingOrders > 0)
            StatCard(icon: "🔔", value: stats.unreadNotifications, label: "未読通知", highlight: stats.unreadNotifications > 0)
        }
    }

    // MARK: - Recent Works

    private var recentWorksSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("最近の作品")
                    .font(.headline)
                Spacer()
                NavigationLink("すべて見る", destination: CreatorWorksView())
                    .font(.subheadline)
                    .foregroundStyle(.blue)
            }

            if let works = manager.dashboardData?.recentWorks, !works.isEmpty {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(works) { work in
                        WorkCard(work: work)
                    }
                }
            } else {
                VStack(spacing: 12) {
                    Text("🖼️")
                        .font(.system(size: 40))
                    Text("まだ作品が投稿されていません")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    NavigationLink("最初の作品を投稿する", destination: CreatorNewWorkView())
                        .font(.subheadline.bold())
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(.blue)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 32)
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color(.separator).opacity(0.3), lineWidth: 1)
                )
            }
        }
    }

    // MARK: - Notification Banner

    private func notificationBanner(_ stats: DashboardStats) -> some View {
        HStack(spacing: 12) {
            Text("🔔")
                .font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(stats.unreadNotifications)件の未読通知")
                    .font(.subheadline.bold())
                if stats.pendingOrders > 0 {
                    Text("\(stats.pendingOrders)件の未対応コミッション依頼を含みます")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
        }
        .padding(16)
        .background(Color.orange.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.orange.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Stat Card

private struct StatCard: View {
    let icon: String
    let value: Int
    let label: String
    var highlight: Bool = false

    var body: some View {
        VStack(spacing: 4) {
            Text(icon)
            Text("\(value)")
                .font(.title3.bold())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(highlight ? Color.blue.opacity(0.08) : Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(highlight ? Color.blue.opacity(0.3) : Color(.separator).opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Work Card

private struct WorkCard: View {
    let work: WorkItem

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(.systemGray6))
                .aspectRatio(1, contentMode: .fit)
                .overlay {
                    if let url = work.imageUrls.first, let imgUrl = URL(string: url) {
                        AsyncImage(url: imgUrl) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            ProgressView()
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    } else {
                        Text("🎨")
                            .font(.largeTitle)
                    }
                }

            Text(work.title)
                .font(.caption.bold())
                .lineLimit(1)

            HStack(spacing: 8) {
                Label("\(work._count?.likes ?? 0)", systemImage: "heart")
                Label("\(work._count?.comments ?? 0)", systemImage: "bubble.left")
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    CreatorDashboardView()
        .environment(AuthManager())
}

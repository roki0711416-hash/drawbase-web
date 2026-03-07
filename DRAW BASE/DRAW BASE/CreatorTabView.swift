import SwiftUI

/// Creator-specific tab layout.
///
/// Tabs: Dashboard / My Posts / Marketplace / Commissions / Profile
struct CreatorTabView: View {

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("ダッシュボード")
                }

            FeedView()
                .tabItem {
                    Image(systemName: "photo.on.rectangle")
                    Text("作品")
                }

            MarketplaceView()
                .tabItem {
                    Image(systemName: "cart")
                    Text("マーケット")
                }

            CommunityView()
                .tabItem {
                    Image(systemName: "person.3")
                    Text("コミュニティ")
                }

            ProfileView()
                .tabItem {
                    Image(systemName: "person")
                    Text("プロフィール")
                }
        }
    }
}

#Preview {
    CreatorTabView()
}

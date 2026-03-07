import SwiftUI

/// Fan-specific tab layout.
///
/// Tabs: Feed / Explore / Marketplace / Notifications / Profile
struct FanTabView: View {

    var body: some View {
        TabView {
            FeedView()
                .tabItem {
                    Image(systemName: "house")
                    Text("ホーム")
                }

            CommunityView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("探す")
                }

            MarketplaceView()
                .tabItem {
                    Image(systemName: "cart")
                    Text("マーケット")
                }

            NotificationsView()
                .tabItem {
                    Image(systemName: "bell")
                    Text("通知")
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
    FanTabView()
}

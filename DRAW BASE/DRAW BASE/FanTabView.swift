import SwiftUI

/// Fan-specific tab layout.
///
/// Tabs: Dashboard / Feed / Favorites / Following / Profile
struct FanTabView: View {

    @State private var fanManager = FanManager()

    var body: some View {
        TabView {
            FanDashboardView()
                .tabItem {
                    Image(systemName: "house")
                    Text("ホーム")
                }

            FeedView()
                .tabItem {
                    Image(systemName: "rectangle.grid.2x2")
                    Text("フィード")
                }

            FanFavoritesView()
                .tabItem {
                    Image(systemName: "heart")
                    Text("お気に入り")
                }

            FanFollowingView()
                .tabItem {
                    Image(systemName: "person.2")
                    Text("フォロー中")
                }

            FanProfileEditView()
                .tabItem {
                    Image(systemName: "person")
                    Text("プロフィール")
                }
        }
        .environment(fanManager)
    }
}

#Preview {
    FanTabView()
        .environment(AuthManager())
}

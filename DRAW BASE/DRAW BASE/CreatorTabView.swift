import SwiftUI

/// Creator-specific tab layout.
///
/// Tabs: Dashboard / Works / Commissions / Community / Profile
struct CreatorTabView: View {

    var body: some View {
        TabView {
            CreatorDashboardView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("ダッシュボード")
                }

            CreatorWorksView()
                .tabItem {
                    Image(systemName: "photo.on.rectangle")
                    Text("作品")
                }

            CreatorCommissionsView()
                .tabItem {
                    Image(systemName: "list.clipboard")
                    Text("コミッション")
                }

            CommunityView()
                .tabItem {
                    Image(systemName: "person.3")
                    Text("コミュニティ")
                }

            CreatorProfileView()
                .tabItem {
                    Image(systemName: "person")
                    Text("プロフィール")
                }
        }
    }
}

#Preview {
    CreatorTabView()
        .environment(AuthManager())
}

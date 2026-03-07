import SwiftUI

struct ContentView: View {
    
    var body: some View {
        
        TabView {
            
            FeedView()
                .tabItem {
                    Image(systemName: "house")
                    Text("Home")
                }
            
            CommunityView()
                .tabItem {
                    Image(systemName: "person.3")
                    Text("Community")
                }
            
            MarketplaceView()
                .tabItem {
                    Image(systemName: "cart")
                    Text("Market")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person")
                    Text("Profile")
                }
        }
    }
}

#Preview {
    ContentView()
}

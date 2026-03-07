import SwiftUI

/// Root view — routes based on authentication state and user role.
///
/// Flow:
/// 1. Not logged in → LoginView
/// 2. Logged in, no role → RoleSelectionView
/// 3. Logged in, role = creator → CreatorTabView
/// 4. Logged in, role = fan → FanTabView
struct ContentView: View {

    @Environment(AuthManager.self) private var authManager

    var body: some View {
        Group {
            if !authManager.isLoggedIn {
                LoginView()
            } else if !authManager.hasSelectedRole {
                RoleSelectionView()
            } else if authManager.role == .creator {
                CreatorTabView()
            } else {
                FanTabView()
            }
        }
        .animation(.easeInOut, value: authManager.isLoggedIn)
        .animation(.easeInOut, value: authManager.hasSelectedRole)
    }
}

#Preview {
    ContentView()
        .environment(AuthManager())
}

import SwiftUI

/// Notifications screen — placeholder for MVP.
struct NotificationsView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                Text("通知はまだありません")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .navigationTitle("通知")
        }
    }
}

#Preview {
    NotificationsView()
}

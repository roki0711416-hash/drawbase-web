import SwiftUI

/// Creator dashboard — shows stats, recent orders, etc.
/// Placeholder for MVP.
struct DashboardView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                Text("ダッシュボード")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Text("売上・受注状況がここに表示されます")
                    .font(.subheadline)
                    .foregroundStyle(.tertiary)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .navigationTitle("ダッシュボード")
        }
    }
}

#Preview {
    DashboardView()
}

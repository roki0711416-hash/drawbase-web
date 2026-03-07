import SwiftUI

struct CommunityView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                Text("Community")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .navigationTitle("Community")
        }
    }
}

#Preview {
    CommunityView()
}

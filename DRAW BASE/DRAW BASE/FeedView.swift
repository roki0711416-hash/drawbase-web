import SwiftUI

struct FeedView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                Text("DRAW BASE Feed")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .navigationTitle("Home")
        }
    }
}

#Preview {
    FeedView()
}

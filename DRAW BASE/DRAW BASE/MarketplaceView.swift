import SwiftUI

struct MarketplaceView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                Text("Marketplace")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .navigationTitle("Market")
        }
    }
}

#Preview {
    MarketplaceView()
}

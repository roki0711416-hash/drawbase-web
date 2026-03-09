import SwiftUI

/// Favorites grid — shows all favorited posts with remove option.
struct FanFavoritesView: View {

    @Environment(FanManager.self) private var fanManager

    var body: some View {
        NavigationStack {
            ScrollView {
                if fanManager.favorites.isEmpty && !fanManager.isLoading {
                    emptyState
                } else {
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                    ], spacing: 12) {
                        ForEach(fanManager.favorites) { fav in
                            favoriteCard(fav)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("お気に入り")
            .refreshable {
                await fanManager.fetchFavorites()
            }
            .task {
                if fanManager.favorites.isEmpty {
                    await fanManager.fetchFavorites()
                }
            }
            .overlay {
                if fanManager.isLoading && fanManager.favorites.isEmpty {
                    ProgressView()
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "heart.slash")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("お気に入りはまだありません")
                .font(.headline)
                .foregroundStyle(.secondary)

            Text("気になる作品をお気に入りに追加しましょう")
                .font(.subheadline)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 80)
    }

    // MARK: - Card

    private func favoriteCard(_ item: FavoriteItem) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            // Image
            ZStack(alignment: .topTrailing) {
                if let url = item.post.imageUrls.first, let imageURL = URL(string: url) {
                    AsyncImage(url: imageURL) { image in
                        image
                            .resizable()
                            .aspectRatio(1, contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(.gray.opacity(0.1))
                            .aspectRatio(1, contentMode: .fill)
                            .overlay {
                                Image(systemName: "photo")
                                    .foregroundStyle(.secondary)
                            }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                // Remove button
                Button {
                    Task {
                        _ = await fanManager.removeFavorite(postId: item.post.id)
                    }
                } label: {
                    Image(systemName: "heart.fill")
                        .font(.caption)
                        .foregroundStyle(.white)
                        .padding(6)
                        .background(.pink, in: Circle())
                }
                .padding(6)
            }

            // Title
            Text(item.post.title)
                .font(.caption)
                .fontWeight(.medium)
                .lineLimit(1)

            // Author
            HStack(spacing: 4) {
                if let avatarUrl = item.post.author.avatarUrl, let url = URL(string: avatarUrl) {
                    AsyncImage(url: url) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle().fill(.gray.opacity(0.2))
                    }
                    .frame(width: 14, height: 14)
                    .clipShape(Circle())
                }

                Text(item.post.author.displayName ?? item.post.author.name)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
    }
}

#Preview {
    FanFavoritesView()
        .environment(FanManager())
}

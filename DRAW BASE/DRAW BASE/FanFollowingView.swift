import SwiftUI

/// Following list — shows creators the fan is following with unfollow option.
struct FanFollowingView: View {

    @Environment(FanManager.self) private var fanManager

    var body: some View {
        NavigationStack {
            ScrollView {
                if fanManager.following.isEmpty && !fanManager.isLoading {
                    emptyState
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(fanManager.following) { creator in
                            creatorRow(creator)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("フォロー中")
            .refreshable {
                await fanManager.fetchFollowing()
            }
            .task {
                if fanManager.following.isEmpty {
                    await fanManager.fetchFollowing()
                }
            }
            .overlay {
                if fanManager.isLoading && fanManager.following.isEmpty {
                    ProgressView()
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.2.slash")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("まだ誰もフォローしていません")
                .font(.headline)
                .foregroundStyle(.secondary)

            Text("気になるクリエイターをフォローしましょう")
                .font(.subheadline)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 80)
    }

    // MARK: - Creator Row

    private func creatorRow(_ creator: FollowingCreator) -> some View {
        HStack(spacing: 12) {
            // Avatar
            if let avatarUrl = creator.avatarUrl, let url = URL(string: avatarUrl) {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle().fill(.gray.opacity(0.15))
                        .overlay {
                            Image(systemName: "person.fill")
                                .foregroundStyle(.secondary)
                        }
                }
                .frame(width: 50, height: 50)
                .clipShape(Circle())
            } else {
                Circle()
                    .fill(.gray.opacity(0.15))
                    .frame(width: 50, height: 50)
                    .overlay {
                        Image(systemName: "person.fill")
                            .foregroundStyle(.secondary)
                    }
            }

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(creator.displayName ?? creator.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                if let bio = creator.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                HStack(spacing: 8) {
                    if let counts = creator._count {
                        Label("\(counts.posts)", systemImage: "photo")
                        Label("\(counts.followers)", systemImage: "person.2")
                    }

                    if creator.commissionOpen {
                        Label("受付中", systemImage: "paintbrush")
                            .foregroundStyle(.green)
                    }
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }

            Spacer()

            // Unfollow button
            Button {
                Task {
                    _ = await fanManager.unfollow(creatorId: creator.id)
                }
            } label: {
                Text("フォロー中")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(.gray.opacity(0.1))
                    .clipShape(Capsule())
            }
        }
        .padding(12)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    FanFollowingView()
        .environment(FanManager())
}

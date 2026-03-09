import SwiftUI

/// Creator public profile view.
struct CreatorProfileView: View {

    @State private var manager = CreatorManager()

    var body: some View {
        NavigationStack {
            ScrollView {
                if let profile = manager.profile {
                    VStack(spacing: 0) {
                        // ── ヘッダー画像 ──
                        headerImage(profile)

                        // ── アバター & 基本情報 ──
                        profileInfo(profile)
                            .padding(.horizontal)
                            .offset(y: -40)

                        // ── 統計 ──
                        if let counts = profile._count {
                            statsRow(counts)
                                .padding(.horizontal)
                        }

                        // ── ジャンル ──
                        if !profile.genres.isEmpty {
                            genreTags(profile.genres)
                                .padding(.horizontal)
                                .padding(.top, 16)
                        }

                        // ── SNSリンク ──
                        linksSection(profile)
                            .padding(.horizontal)
                            .padding(.top, 16)

                        // ── コミッション状態 ──
                        commissionStatus(profile)
                            .padding(.horizontal)
                            .padding(.top, 16)
                            .padding(.bottom, 32)
                    }
                } else if manager.isLoading {
                    ProgressView()
                        .padding(.top, 100)
                }
            }
            .navigationTitle("プロフィール")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: CreatorProfileEditView()) {
                        Text("編集")
                            .font(.subheadline)
                    }
                }
            }
            .task {
                await manager.fetchProfile()
            }
        }
    }

    // MARK: - Header Image

    private func headerImage(_ profile: CreatorProfile) -> some View {
        ZStack {
            LinearGradient(colors: [.blue.opacity(0.6), .blue], startPoint: .topLeading, endPoint: .bottomTrailing)
                .frame(height: 160)

            if let urlStr = profile.headerUrl, let url = URL(string: urlStr) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    EmptyView()
                }
                .frame(height: 160)
                .clipped()
            }
        }
    }

    // MARK: - Profile Info

    private func profileInfo(_ profile: CreatorProfile) -> some View {
        HStack(alignment: .top, spacing: 12) {
            // Avatar
            Circle()
                .fill(Color(.systemGray6))
                .frame(width: 80, height: 80)
                .overlay {
                    if let urlStr = profile.avatarUrl, let url = URL(string: urlStr) {
                        AsyncImage(url: url) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            Text(String((profile.displayName ?? profile.name).prefix(1)).uppercased())
                                .font(.title.bold())
                                .foregroundStyle(.blue)
                        }
                        .clipShape(Circle())
                    } else {
                        Text(String((profile.displayName ?? profile.name).prefix(1)).uppercased())
                            .font(.title.bold())
                            .foregroundStyle(.blue)
                    }
                }
                .overlay(Circle().stroke(.white, lineWidth: 3))
                .shadow(radius: 4)

            VStack(alignment: .leading, spacing: 4) {
                Text(profile.displayName ?? profile.name)
                    .font(.title3.bold())
                Text("@\(profile.name)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                if let bio = profile.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 4)
                }
            }
            .padding(.top, 44)

            Spacer()
        }
    }

    // MARK: - Stats Row

    private func statsRow(_ counts: ProfileCounts) -> some View {
        HStack {
            VStack {
                Text("\(counts.posts)").font(.headline.bold())
                Text("作品").font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)

            Divider().frame(height: 30)

            VStack {
                Text("\(counts.followers)").font(.headline.bold())
                Text("フォロワー").font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)

            Divider().frame(height: 30)

            VStack {
                Text("\(counts.following)").font(.headline.bold())
                Text("フォロー中").font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.05), radius: 4)
    }

    // MARK: - Genre Tags

    private func genreTags(_ genres: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("ジャンル")
                .font(.headline)

            FlowLayout(spacing: 8) {
                ForEach(genres, id: \.self) { genre in
                    Text(genre)
                        .font(.caption.bold())
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.blue.opacity(0.1))
                        .foregroundStyle(.blue)
                        .clipShape(Capsule())
                }
            }
        }
    }

    // MARK: - Links

    private func linksSection(_ profile: CreatorProfile) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("リンク")
                .font(.headline)

            VStack(alignment: .leading, spacing: 6) {
                if let website = profile.website, !website.isEmpty {
                    Label(website, systemImage: "globe")
                        .font(.subheadline)
                }
                if let twitter = profile.twitterHandle, !twitter.isEmpty {
                    Label("@\(twitter)", systemImage: "at")
                        .font(.subheadline)
                }
                if let instagram = profile.instagramHandle, !instagram.isEmpty {
                    Label("@\(instagram)", systemImage: "camera")
                        .font(.subheadline)
                }
                if let pixiv = profile.pixivUrl, !pixiv.isEmpty {
                    Label("pixiv", systemImage: "paintbrush")
                        .font(.subheadline)
                }
            }
            .foregroundStyle(.secondary)
        }
    }

    // MARK: - Commission Status

    private func commissionStatus(_ profile: CreatorProfile) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("コミッション")
                    .font(.headline)
                Text(profile.commissionOpen ? "現在受け付けています" : "現在受け付けていません")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(profile.commissionOpen ? "OPEN" : "CLOSED")
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(profile.commissionOpen ? Color.green.opacity(0.15) : Color.gray.opacity(0.15))
                .foregroundStyle(profile.commissionOpen ? .green : .gray)
                .clipShape(Capsule())
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.05), radius: 4)
    }
}

// MARK: - FlowLayout Helper

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}

#Preview {
    CreatorProfileView()
}

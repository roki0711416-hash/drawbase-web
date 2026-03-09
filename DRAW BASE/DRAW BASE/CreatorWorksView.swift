import SwiftUI

/// Creator works list — shows all posted works.
struct CreatorWorksView: View {

    @State private var manager = CreatorManager()

    var body: some View {
        NavigationStack {
            Group {
                if manager.isLoading && manager.works.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if manager.works.isEmpty {
                    emptyState
                } else {
                    worksList
                }
            }
            .navigationTitle("作品管理")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: CreatorNewWorkView()) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await manager.fetchWorks()
            }
            .task {
                await manager.fetchWorks()
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Text("🖼️")
                .font(.system(size: 50))
            Text("まだ作品がありません")
                .font(.headline)
            Text("最初の作品を投稿して\n活動を始めましょう！")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            NavigationLink(destination: CreatorNewWorkView()) {
                Text("最初の作品を投稿する")
                    .font(.subheadline.bold())
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(.blue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding()
    }

    // MARK: - Works List

    private var worksList: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(manager.works) { work in
                    WorkListCard(work: work)
                }
            }
            .padding()
        }
    }
}

// MARK: - Work List Card

private struct WorkListCard: View {
    let work: WorkItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Image
            RoundedRectangle(cornerRadius: 10)
                .fill(Color(.systemGray6))
                .aspectRatio(4.0 / 3.0, contentMode: .fit)
                .overlay {
                    if let url = work.imageUrls.first, let imgUrl = URL(string: url) {
                        AsyncImage(url: imgUrl) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            ProgressView()
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    } else {
                        Text("🎨").font(.largeTitle)
                    }
                }
                .overlay(alignment: .topTrailing) {
                    HStack(spacing: 4) {
                        if work.isPublished == false {
                            Text("下書き")
                                .font(.caption2.bold())
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(.yellow)
                                .clipShape(Capsule())
                        }
                        if work.isNsfw == true {
                            Text("NSFW")
                                .font(.caption2.bold())
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(.red.opacity(0.8))
                                .foregroundStyle(.white)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(6)
                }

            // Info
            Text(work.title)
                .font(.subheadline.bold())
                .lineLimit(1)

            HStack(spacing: 8) {
                Label("\(work._count?.likes ?? 0)", systemImage: "heart")
                Label("\(work._count?.comments ?? 0)", systemImage: "bubble.left")
                Label("\(work.viewCount ?? 0)", systemImage: "eye")
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    CreatorWorksView()
}

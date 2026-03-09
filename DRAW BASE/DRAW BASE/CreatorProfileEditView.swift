import SwiftUI

/// Creator profile editing view.
struct CreatorProfileEditView: View {

    @State private var manager = CreatorManager()
    @Environment(\.dismiss) private var dismiss

    @State private var displayName = ""
    @State private var bio = ""
    @State private var avatarUrl = ""
    @State private var headerUrl = ""
    @State private var website = ""
    @State private var twitterHandle = ""
    @State private var instagramHandle = ""
    @State private var pixivUrl = ""
    @State private var genres: Set<String> = []
    @State private var commissionOpen = false

    @State private var saving = false
    @State private var showSuccess = false

    private let genreOptions = [
        "イラスト", "漫画", "アニメ", "3DCG", "ドット絵",
        "キャラデザ", "背景", "コンセプトアート", "Vtuber",
        "アイコン", "ロゴ", "UI/UX", "その他",
    ]

    var body: some View {
        Form {
            // ── アイコン & ヘッダー ──
            Section("アイコン & ヘッダー") {
                TextField("アイコン画像URL", text: $avatarUrl)
                    .textContentType(.URL)
                    .autocapitalization(.none)
                if !avatarUrl.isEmpty, let url = URL(string: avatarUrl) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        ProgressView()
                    }
                    .frame(width: 60, height: 60)
                    .clipShape(Circle())
                }

                TextField("ヘッダー画像URL", text: $headerUrl)
                    .textContentType(.URL)
                    .autocapitalization(.none)
            }

            // ── 基本情報 ──
            Section("基本情報") {
                TextField("表示名", text: $displayName)

                VStack(alignment: .leading) {
                    Text("自己紹介")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    TextEditor(text: $bio)
                        .frame(minHeight: 80)
                    Text("\(bio.count)/500")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            // ── ジャンル ──
            Section("ジャンル") {
                FlowLayout(spacing: 8) {
                    ForEach(genreOptions, id: \.self) { genre in
                        Button {
                            if genres.contains(genre) {
                                genres.remove(genre)
                            } else {
                                genres.insert(genre)
                            }
                        } label: {
                            Text(genre)
                                .font(.caption.bold())
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(genres.contains(genre) ? Color.blue : Color(.systemGray5))
                                .foregroundStyle(genres.contains(genre) ? .white : .primary)
                                .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // ── SNSリンク ──
            Section("SNS & リンク") {
                HStack {
                    Text("🌐")
                    TextField("Webサイト", text: $website)
                        .textContentType(.URL)
                        .autocapitalization(.none)
                }
                HStack {
                    Text("𝕏")
                    Text("@").foregroundStyle(.secondary)
                    TextField("Twitter / X", text: $twitterHandle)
                        .autocapitalization(.none)
                }
                HStack {
                    Text("📷")
                    Text("@").foregroundStyle(.secondary)
                    TextField("Instagram", text: $instagramHandle)
                        .autocapitalization(.none)
                }
                HStack {
                    Text("🎨")
                    TextField("pixiv URL", text: $pixivUrl)
                        .textContentType(.URL)
                        .autocapitalization(.none)
                }
            }

            // ── コミッション設定 ──
            Section("コミッション") {
                Toggle("コミッション受付", isOn: $commissionOpen)
                Text("ONにすると、プロフィールに受付中と表示されます")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // ── 保存 ──
            Section {
                Button {
                    Task { await saveProfile() }
                } label: {
                    HStack {
                        Spacer()
                        if saving {
                            ProgressView()
                        } else {
                            Text("保存する")
                                .bold()
                        }
                        Spacer()
                    }
                }
                .disabled(saving)
            }
        }
        .navigationTitle("プロフィール編集")
        .navigationBarTitleDisplayMode(.inline)
        .alert("保存しました", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        }
        .task {
            await manager.fetchProfile()
            if let p = manager.profile {
                displayName = p.displayName ?? ""
                bio = p.bio ?? ""
                avatarUrl = p.avatarUrl ?? ""
                headerUrl = p.headerUrl ?? ""
                website = p.website ?? ""
                twitterHandle = p.twitterHandle ?? ""
                instagramHandle = p.instagramHandle ?? ""
                pixivUrl = p.pixivUrl ?? ""
                genres = Set(p.genres)
                commissionOpen = p.commissionOpen
            }
        }
    }

    private func saveProfile() async {
        saving = true
        let body = ProfileUpdateBody(
            displayName: displayName.isEmpty ? nil : displayName,
            bio: bio.isEmpty ? nil : bio,
            avatarUrl: avatarUrl.isEmpty ? nil : avatarUrl,
            headerUrl: headerUrl.isEmpty ? nil : headerUrl,
            website: website.isEmpty ? nil : website,
            twitterHandle: twitterHandle.isEmpty ? nil : twitterHandle,
            instagramHandle: instagramHandle.isEmpty ? nil : instagramHandle,
            pixivUrl: pixivUrl.isEmpty ? nil : pixivUrl,
            genres: Array(genres),
            commissionOpen: commissionOpen
        )

        let success = await manager.updateProfile(body)
        saving = false
        if success {
            showSuccess = true
        }
    }
}

#Preview {
    NavigationStack {
        CreatorProfileEditView()
    }
}

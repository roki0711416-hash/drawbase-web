import SwiftUI

/// Fan profile edit view — allows editing display name, bio, avatar, etc.
struct FanProfileEditView: View {

    @Environment(FanManager.self) private var fanManager
    @Environment(AuthManager.self) private var authManager

    @State private var displayName = ""
    @State private var bio = ""
    @State private var avatarUrl = ""
    @State private var headerUrl = ""
    @State private var website = ""
    @State private var twitterHandle = ""

    @State private var isSaving = false
    @State private var showSavedAlert = false

    var body: some View {
        NavigationStack {
            Form {
                // Preview section
                Section {
                    profilePreview
                }
                .listRowInsets(EdgeInsets())
                .listRowBackground(Color.clear)

                // Avatar / Header URLs
                Section("画像") {
                    TextField("アバター画像URL", text: $avatarUrl)
                        .textContentType(.URL)
                        .autocapitalization(.none)

                    TextField("ヘッダー画像URL", text: $headerUrl)
                        .textContentType(.URL)
                        .autocapitalization(.none)
                }

                // Basic info
                Section("基本情報") {
                    TextField("表示名", text: $displayName)

                    VStack(alignment: .leading) {
                        TextField("自己紹介（300文字まで）", text: $bio, axis: .vertical)
                            .lineLimit(3...6)

                        Text("\(bio.count)/300")
                            .font(.caption2)
                            .foregroundStyle(bio.count > 300 ? .red : .secondary)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                    }
                }

                // Links
                Section("リンク") {
                    TextField("ウェブサイト", text: $website)
                        .textContentType(.URL)
                        .autocapitalization(.none)

                    HStack {
                        Text("@")
                            .foregroundStyle(.secondary)
                        TextField("Twitter / X ハンドル", text: $twitterHandle)
                            .autocapitalization(.none)
                    }
                }

                // Actions
                Section {
                    Button {
                        Task { await save() }
                    } label: {
                        HStack {
                            Spacer()
                            if isSaving {
                                ProgressView()
                            } else {
                                Text("保存する")
                                    .fontWeight(.semibold)
                            }
                            Spacer()
                        }
                    }
                    .disabled(isSaving || bio.count > 300)

                    Button("ログアウト", role: .destructive) {
                        authManager.logout()
                    }
                }
            }
            .navigationTitle("プロフィール編集")
            .task {
                await fanManager.fetchProfile()
                loadFromProfile()
            }
            .alert("保存しました", isPresented: $showSavedAlert) {
                Button("OK", role: .cancel) {}
            }
        }
    }

    // MARK: - Preview

    private var profilePreview: some View {
        ZStack(alignment: .bottomLeading) {
            // Header
            if let url = URL(string: headerUrl), !headerUrl.isEmpty {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle().fill(.gray.opacity(0.1))
                }
                .frame(height: 120)
                .clipped()
            } else {
                LinearGradient(
                    colors: [.pink.opacity(0.3), .purple.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 120)
            }

            // Avatar
            HStack(alignment: .bottom, spacing: 12) {
                if let url = URL(string: avatarUrl), !avatarUrl.isEmpty {
                    AsyncImage(url: url) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle().fill(.gray.opacity(0.2))
                    }
                    .frame(width: 60, height: 60)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(.white, lineWidth: 3))
                } else {
                    Circle()
                        .fill(.gray.opacity(0.2))
                        .frame(width: 60, height: 60)
                        .overlay {
                            Image(systemName: "person.fill")
                                .font(.title2)
                                .foregroundStyle(.secondary)
                        }
                        .overlay(Circle().stroke(.white, lineWidth: 3))
                }

                VStack(alignment: .leading) {
                    Text(displayName.isEmpty ? "表示名" : displayName)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .shadow(radius: 2)
                }
            }
            .padding(.horizontal, 16)
            .offset(y: 20)
        }
        .padding(.bottom, 24)
    }

    // MARK: - Load / Save

    private func loadFromProfile() {
        guard let p = fanManager.profile else { return }
        displayName = p.displayName ?? ""
        bio = p.bio ?? ""
        avatarUrl = p.avatarUrl ?? ""
        headerUrl = p.headerUrl ?? ""
        website = p.website ?? ""
        twitterHandle = p.twitterHandle ?? ""
    }

    private func save() async {
        isSaving = true

        let body = FanProfileUpdateBody(
            displayName: displayName.isEmpty ? nil : displayName,
            bio: bio.isEmpty ? nil : bio,
            avatarUrl: avatarUrl.isEmpty ? nil : avatarUrl,
            headerUrl: headerUrl.isEmpty ? nil : headerUrl,
            website: website.isEmpty ? nil : website,
            twitterHandle: twitterHandle.isEmpty ? nil : twitterHandle
        )

        let success = await fanManager.updateProfile(body)
        isSaving = false

        if success {
            showSavedAlert = true
        }
    }
}

#Preview {
    FanProfileEditView()
        .environment(FanManager())
        .environment(AuthManager())
}

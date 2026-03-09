import SwiftUI

/// Creator new work form — create a new post/work.
struct CreatorNewWorkView: View {

    @State private var manager = CreatorManager()
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var imageUrlInput = ""
    @State private var imageUrls: [String] = []
    @State private var tagInput = ""
    @State private var tags: [String] = []
    @State private var isNsfw = false

    @State private var error = ""

    var body: some View {
        Form {
            // ── 基本情報 ──
            Section("基本情報") {
                TextField("タイトル *", text: $title)
                VStack(alignment: .leading) {
                    Text("説明")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    TextEditor(text: $description)
                        .frame(minHeight: 80)
                }
            }

            // ── 画像 ──
            Section("画像 *") {
                HStack {
                    TextField("画像URLを入力", text: $imageUrlInput)
                        .textContentType(.URL)
                        .autocapitalization(.none)
                    Button("追加") {
                        addImageUrl()
                    }
                    .disabled(imageUrlInput.trimmingCharacters(in: .whitespaces).isEmpty)
                }

                if !imageUrls.isEmpty {
                    ForEach(Array(imageUrls.enumerated()), id: \.offset) { index, url in
                        HStack {
                            if let imgUrl = URL(string: url) {
                                AsyncImage(url: imgUrl) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    ProgressView()
                                }
                                .frame(width: 50, height: 50)
                                .clipShape(RoundedRectangle(cornerRadius: 6))
                            }
                            Text(url)
                                .font(.caption)
                                .lineLimit(1)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Button(role: .destructive) {
                                imageUrls.remove(at: index)
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(.red)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            // ── タグ ──
            Section("タグ") {
                HStack {
                    TextField("タグを入力", text: $tagInput)
                    Button("追加") {
                        addTag()
                    }
                    .disabled(tagInput.trimmingCharacters(in: .whitespaces).isEmpty || tags.count >= 10)
                }

                if !tags.isEmpty {
                    FlowLayout(spacing: 6) {
                        ForEach(tags, id: \.self) { tag in
                            HStack(spacing: 4) {
                                Text("#\(tag)")
                                    .font(.caption)
                                Button {
                                    tags.removeAll { $0 == tag }
                                } label: {
                                    Image(systemName: "xmark")
                                        .font(.caption2)
                                }
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.blue.opacity(0.1))
                            .foregroundStyle(.blue)
                            .clipShape(Capsule())
                        }
                    }
                }

                Text("\(tags.count)/10")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            // ── オプション ──
            Section("オプション") {
                Toggle("年齢制限コンテンツ (NSFW)", isOn: $isNsfw)
            }

            // ── エラー ──
            if !error.isEmpty {
                Section {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.subheadline)
                }
            }

            // ── 投稿 ──
            Section {
                Button {
                    Task { await submitWork() }
                } label: {
                    HStack {
                        Spacer()
                        if manager.isLoading {
                            ProgressView()
                        } else {
                            Text("作品を投稿する")
                                .bold()
                        }
                        Spacer()
                    }
                }
                .disabled(manager.isLoading)
            }
        }
        .navigationTitle("新規作品投稿")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func addImageUrl() {
        let url = imageUrlInput.trimmingCharacters(in: .whitespaces)
        if !url.isEmpty && !imageUrls.contains(url) {
            imageUrls.append(url)
            imageUrlInput = ""
        }
    }

    private func addTag() {
        let tag = tagInput.trimmingCharacters(in: .whitespaces)
        if !tag.isEmpty && !tags.contains(tag) && tags.count < 10 {
            tags.append(tag)
            tagInput = ""
        }
    }

    private func submitWork() async {
        error = ""
        if title.trimmingCharacters(in: .whitespaces).isEmpty {
            error = "タイトルを入力してください"
            return
        }
        if imageUrls.isEmpty {
            error = "画像URLを1つ以上追加してください"
            return
        }

        let body = NewWorkBody(
            title: title,
            description: description.isEmpty ? nil : description,
            imageUrls: imageUrls,
            tags: tags,
            isNsfw: isNsfw
        )

        let success = await manager.createWork(body)
        if success {
            dismiss()
        } else {
            error = manager.errorMessage ?? "投稿に失敗しました"
        }
    }
}

#Preview {
    NavigationStack {
        CreatorNewWorkView()
    }
}

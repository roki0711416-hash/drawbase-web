import SwiftUI

/// Role selection screen — shown after registration when role is nil.
///
/// The user chooses between Creator and Fan.
/// This determines their home screen and available features.
struct RoleSelectionView: View {

    @Environment(AuthManager.self) private var authManager

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Header
            VStack(spacing: 12) {
                Text("ようこそ、\(authManager.currentUser?.name ?? "")さん！")
                    .font(.title2.bold())

                Text("あなたに合ったモードを選んでください")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Role cards
            VStack(spacing: 16) {
                RoleCard(
                    icon: "paintbrush.pointed",
                    title: "クリエイター",
                    description: "作品を投稿・販売する。\nコミッションを受け付ける。",
                    color: .blue,
                    isLoading: authManager.isLoading
                ) {
                    Task { await authManager.selectRole(.creator) }
                }

                RoleCard(
                    icon: "heart.circle",
                    title: "ファン",
                    description: "好きなクリエイターを見つける。\n作品を購入・応援する。",
                    color: .pink,
                    isLoading: authManager.isLoading
                ) {
                    Task { await authManager.selectRole(.fan) }
                }
            }

            Spacer()

            // Note
            Text("あとから変更することもできます")
                .font(.caption)
                .foregroundStyle(.tertiary)

            Spacer()
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Role Card

private struct RoleCard: View {
    let icon: String
    let title: String
    let description: String
    let color: Color
    let isLoading: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.largeTitle)
                    .foregroundStyle(color)
                    .frame(width: 56)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.primary)

                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundStyle(.tertiary)
            }
            .padding(20)
            .background(color.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(color.opacity(0.2), lineWidth: 1)
            )
        }
        .disabled(isLoading)
    }
}

#Preview {
    RoleSelectionView()
        .environment(AuthManager())
}

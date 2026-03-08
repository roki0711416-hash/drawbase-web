import SwiftUI

/// 新規登録画面 — クリエイター / ファン のロール選択付き
struct RegisterView: View {

    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    @State private var selectedRole: UserRole? = nil

    var body: some View {
        VStack(spacing: 0) {
            // ─── ヘッダー ───
            VStack(spacing: 8) {
                Text("新規登録")
                    .font(.title.bold())

                Text("会員タイプを選んで登録してください")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(.top, 24)
            .padding(.bottom, 20)

            // ─── ロール選択 ───
            HStack(spacing: 12) {
                RolePickerCard(
                    icon: "🎨",
                    label: "クリエイター",
                    description: "作品を投稿・販売\nコミッションを受注",
                    isSelected: selectedRole == .creator,
                    color: .blue
                ) {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        selectedRole = .creator
                    }
                }

                RolePickerCard(
                    icon: "⭐",
                    label: "ファン",
                    description: "作品を楽しむ・購入\nコミッションを依頼",
                    isSelected: selectedRole == .fan,
                    color: .pink
                ) {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        selectedRole = .fan
                    }
                }
            }
            .padding(.horizontal, 24)

            // ─── 登録フォーム ───
            if let role = selectedRole {
                RegisterFormSection(
                    role: role,
                    authManager: authManager
                )
                .transition(.opacity.combined(with: .move(edge: .bottom)))
                .padding(.top, 16)
            } else {
                VStack(spacing: 16) {
                    Spacer()
                    Image(systemName: "hand.tap")
                        .font(.system(size: 40))
                        .foregroundStyle(.tertiary)
                    Text("まず会員タイプを選択してください")
                        .font(.subheadline)
                        .foregroundStyle(.tertiary)
                    Spacer()
                }
                .padding(.top, 32)
            }

            Spacer(minLength: 0)

            // ─── ログインリンク ───
            Button {
                dismiss()
            } label: {
                Text("すでにアカウントをお持ちの方は")
                    .foregroundStyle(.secondary) +
                Text("ログイン")
                    .foregroundStyle(.blue)
                    .bold()
            }
            .font(.subheadline)
            .padding(.bottom, 32)
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                }
            }
        }
    }
}

// MARK: - ロール選択カード

private struct RolePickerCard: View {
    let icon: String
    let label: String
    let description: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(icon)
                    .font(.largeTitle)
                Text(label)
                    .font(.headline)
                    .foregroundStyle(isSelected ? color : .primary)
                Text(description)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                isSelected ? color.opacity(0.1) : Color(.systemGray6)
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? color : Color.clear, lineWidth: 2)
            )
        }
    }
}

// MARK: - 登録フォーム

private struct RegisterFormSection: View {
    let role: UserRole
    @Bindable var authManager: AuthManager

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var localError: String?

    private var accentColor: Color {
        role == .creator ? .blue : .pink
    }

    private var roleLabel: String {
        role == .creator ? "クリエイター" : "ファン"
    }

    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 8) {
                Circle()
                    .fill(accentColor)
                    .frame(width: 8, height: 8)
                Text("\(roleLabel)として登録")
                    .font(.headline)
                    .foregroundStyle(accentColor)
            }

            VStack(spacing: 12) {
                TextField("ユーザー名", text: $name)
                    .textContentType(.name)
                    .padding()
                    .background(.gray.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                TextField("メールアドレス", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(.gray.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                SecureField("パスワード（8文字以上）", text: $password)
                    .textContentType(.newPassword)
                    .padding()
                    .background(.gray.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                SecureField("パスワード確認", text: $confirmPassword)
                    .textContentType(.newPassword)
                    .padding()
                    .background(.gray.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                if let error = localError ?? authManager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                Button {
                    localError = nil

                    guard password == confirmPassword else {
                        localError = "パスワードが一致しません"
                        return
                    }
                    guard password.count >= 8 else {
                        localError = "パスワードは8文字以上で入力してください"
                        return
                    }

                    Task {
                        await authManager.register(name: name, email: email, password: password)
                    }
                } label: {
                    if authManager.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding()
                    } else {
                        Text("\(roleLabel)アカウントを作成")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .tint(accentColor)
                .buttonStyle(.borderedProminent)
                .disabled(
                    name.isEmpty || email.isEmpty ||
                    password.isEmpty || confirmPassword.isEmpty ||
                    authManager.isLoading
                )

                Text("登録することで、利用規約とプライバシーポリシーに同意します。")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 24)
    }
}

#Preview {
    NavigationStack {
        RegisterView()
            .environment(AuthManager())
    }
}

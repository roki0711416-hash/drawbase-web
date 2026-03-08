import SwiftUI

/// ログイン初期画面 — クリエイター / ファン のロール選択
struct LoginView: View {

    @Environment(AuthManager.self) private var authManager
    @State private var selectedRole: UserRole? = nil
    @State private var showRegister = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // ─── ヘッダー ───
                VStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(.blue)
                        .frame(width: 56, height: 56)
                        .overlay {
                            Text("DB")
                                .font(.title3.bold())
                                .foregroundStyle(.white)
                        }

                    Text("DRAW BASE")
                        .font(.title.bold())

                    Text("ご利用の会員タイプを選んでログイン")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 48)
                .padding(.bottom, 24)

                // ─── ロール選択タブ ───
                HStack(spacing: 0) {
                    RoleTab(
                        icon: "🎨",
                        label: "クリエイター",
                        isSelected: selectedRole == .creator,
                        color: .blue
                    ) {
                        withAnimation(.easeInOut(duration: 0.25)) {
                            selectedRole = .creator
                        }
                    }

                    RoleTab(
                        icon: "⭐",
                        label: "ファン",
                        isSelected: selectedRole == .fan,
                        color: .pink
                    ) {
                        withAnimation(.easeInOut(duration: 0.25)) {
                            selectedRole = .fan
                        }
                    }
                }
                .padding(.horizontal, 24)

                // ─── ログインフォーム ───
                if let role = selectedRole {
                    LoginFormSection(
                        role: role,
                        authManager: authManager
                    )
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                    .padding(.top, 16)
                } else {
                    // 未選択状態のプロンプト
                    VStack(spacing: 16) {
                        Spacer()
                        Image(systemName: "hand.tap")
                            .font(.system(size: 40))
                            .foregroundStyle(.tertiary)
                        Text("上のタブを選択してください")
                            .font(.subheadline)
                            .foregroundStyle(.tertiary)
                        Spacer()
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 32)
                }

                Spacer(minLength: 0)

                // ─── 登録リンク ───
                Button {
                    showRegister = true
                } label: {
                    HStack(spacing: 0) {
                        Text("アカウントをお持ちでない方は")
                            .foregroundStyle(.secondary)
                        Text("新規登録")
                            .foregroundStyle(.blue)
                            .bold()
                    }
                }
                .font(.subheadline)
                .padding(.bottom, 32)
            }
            .navigationDestination(isPresented: $showRegister) {
                RegisterView()
            }
        }
    }
}

// MARK: - ロール選択タブ

private struct RoleTab: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Text(icon)
                    .font(.title2)
                Text(label)
                    .font(.subheadline.bold())
                    .foregroundStyle(isSelected ? color : .secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                isSelected ? color.opacity(0.1) : Color.clear
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? color : Color.gray.opacity(0.2), lineWidth: isSelected ? 2 : 1)
            )
        }
    }
}

// MARK: - ログインフォーム

private struct LoginFormSection: View {
    let role: UserRole
    @Bindable var authManager: AuthManager

    @State private var email = ""
    @State private var password = ""

    private var accentColor: Color {
        role == .creator ? .blue : .pink
    }

    private var roleLabel: String {
        role == .creator ? "クリエイター" : "ファン"
    }

    var body: some View {
        VStack(spacing: 16) {
            // ロールヘッダー
            HStack(spacing: 8) {
                Circle()
                    .fill(accentColor)
                    .frame(width: 8, height: 8)
                Text("\(roleLabel)としてログイン")
                    .font(.headline)
                    .foregroundStyle(accentColor)
            }

            // フォーム
            VStack(spacing: 12) {
                TextField("メールアドレス", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(.gray.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                SecureField("パスワード", text: $password)
                    .textContentType(.password)
                    .padding()
                    .background(.gray.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                if let error = authManager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task {
                        await authManager.login(email: email, password: password)
                    }
                } label: {
                    if authManager.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding()
                    } else {
                        Text("\(roleLabel)としてログイン")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .tint(accentColor)
                .buttonStyle(.borderedProminent)
                .disabled(email.isEmpty || password.isEmpty || authManager.isLoading)
            }
        }
        .padding(.horizontal, 24)
    }
}

#Preview {
    LoginView()
        .environment(AuthManager())
}

import SwiftUI

/// Registration screen — name, email, password.
struct RegisterView: View {

    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var localError: String?

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 8) {
                Text("新規登録")
                    .font(.title.bold())

                Text("DRAW BASEアカウントを作成")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 16) {
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
                        Text("アカウント作成")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(
                    name.isEmpty || email.isEmpty ||
                    password.isEmpty || confirmPassword.isEmpty ||
                    authManager.isLoading
                )
            }

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

            Spacer()
        }
        .padding(.horizontal, 24)
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

#Preview {
    NavigationStack {
        RegisterView()
            .environment(AuthManager())
    }
}

import SwiftUI

/// Login screen — email + password authentication.
struct LoginView: View {

    @Environment(AuthManager.self) private var authManager
    @State private var email = ""
    @State private var password = ""
    @State private var showRegister = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                // Logo
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

                    Text("クリエイターとファンをつなぐプラットフォーム")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Form
                VStack(spacing: 16) {
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
                            Text("ログイン")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(email.isEmpty || password.isEmpty || authManager.isLoading)
                }

                // Register link
                Button {
                    showRegister = true
                } label: {
                    Text("アカウントをお持ちでない方は")
                        .foregroundStyle(.secondary) +
                    Text("新規登録")
                        .foregroundStyle(.blue)
                        .bold()
                }
                .font(.subheadline)

                Spacer()
            }
            .padding(.horizontal, 24)
            .navigationDestination(isPresented: $showRegister) {
                RegisterView()
            }
        }
    }
}

#Preview {
    LoginView()
        .environment(AuthManager())
}

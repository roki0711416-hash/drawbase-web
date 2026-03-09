import SwiftUI

/// Creator commissions management — list, create, toggle, delete menus.
struct CreatorCommissionsView: View {

    @State private var manager = CreatorManager()
    @State private var showForm = false

    // Form state
    @State private var formTitle = ""
    @State private var formDescription = ""
    @State private var formPrice = 5000
    @State private var formDeliveryDays = 14
    @State private var formRevisionCount = 1
    @State private var formMaxSlots = 3
    @State private var formError = ""

    var body: some View {
        NavigationStack {
            Group {
                if manager.isLoading && manager.commissionMenus.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // 新規メニューフォーム
                            if showForm {
                                newMenuForm
                            }

                            // メニュー一覧
                            if manager.commissionMenus.isEmpty && !showForm {
                                emptyState
                            } else {
                                ForEach(manager.commissionMenus) { menu in
                                    menuCard(menu)
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("コミッション管理")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showForm.toggle()
                        if showForm { resetForm() }
                    } label: {
                        Text(showForm ? "キャンセル" : "+ 新規")
                            .font(.subheadline.bold())
                    }
                }
            }
            .refreshable {
                await manager.fetchCommissions()
            }
            .task {
                await manager.fetchCommissions()
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Text("📋")
                .font(.system(size: 50))
            Text("コミッションメニューがありません")
                .font(.headline)
            Text("メニューを作成して\nコミッションの受付を始めましょう")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button {
                showForm = true
                resetForm()
            } label: {
                Text("最初のメニューを作成")
                    .font(.subheadline.bold())
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(.blue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(.vertical, 40)
    }

    // MARK: - New Menu Form

    private var newMenuForm: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("新しいコミッションメニュー")
                .font(.headline)

            if !formError.isEmpty {
                Text(formError)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .padding(8)
                    .background(Color.red.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("メニュー名 *").font(.caption).foregroundStyle(.secondary)
                TextField("例: キャラクターイラスト", text: $formTitle)
                    .textFieldStyle(.roundedBorder)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("説明").font(.caption).foregroundStyle(.secondary)
                TextField("メニューの詳細を入力", text: $formDescription, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(2...4)
            }

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("価格 (円) *").font(.caption).foregroundStyle(.secondary)
                    TextField("5000", value: $formPrice, format: .number)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.numberPad)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("納期 (日)").font(.caption).foregroundStyle(.secondary)
                    TextField("14", value: $formDeliveryDays, format: .number)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.numberPad)
                }
            }

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("修正回数").font(.caption).foregroundStyle(.secondary)
                    TextField("1", value: $formRevisionCount, format: .number)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.numberPad)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("同時受付数").font(.caption).foregroundStyle(.secondary)
                    TextField("3", value: $formMaxSlots, format: .number)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.numberPad)
                }
            }

            Button {
                Task { await createMenu() }
            } label: {
                HStack {
                    Spacer()
                    if manager.isLoading {
                        ProgressView()
                    } else {
                        Text("メニューを作成")
                            .bold()
                    }
                    Spacer()
                }
                .padding(.vertical, 12)
                .background(.blue)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .disabled(manager.isLoading)
        }
        .padding()
        .background(Color.blue.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.blue.opacity(0.2), lineWidth: 1)
        )
    }

    // MARK: - Menu Card

    private func menuCard(_ menu: CommissionMenuItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(menu.title)
                    .font(.headline)
                Text(menu.isOpen ? "受付中" : "停止中")
                    .font(.caption2.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(menu.isOpen ? Color.green.opacity(0.15) : Color.gray.opacity(0.15))
                    .foregroundStyle(menu.isOpen ? .green : .gray)
                    .clipShape(Capsule())
                Spacer()
            }

            if let desc = menu.description, !desc.isEmpty {
                Text(desc)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 16) {
                Label("¥\(menu.price.formatted())", systemImage: "yensign.circle")
                    .font(.subheadline.bold())
                Label("\(menu.deliveryDays)日", systemImage: "calendar")
                    .font(.caption)
                Label("修正\(menu.revisionCount)回", systemImage: "arrow.2.squarepath")
                    .font(.caption)
                Label("\(menu.currentSlots)/\(menu.maxSlots)", systemImage: "person.2")
                    .font(.caption)
            }
            .foregroundStyle(.secondary)

            Divider()

            HStack(spacing: 12) {
                Button {
                    Task { await manager.toggleCommissionOpen(menu) }
                } label: {
                    Text(menu.isOpen ? "停止する" : "再開する")
                        .font(.caption.bold())
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }

                Spacer()

                Text("\(menu._count?.orders ?? 0)件の依頼")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Button(role: .destructive) {
                    Task { await manager.deleteCommission(id: menu.id) }
                } label: {
                    Text("削除")
                        .font(.caption.bold())
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.red.opacity(0.1))
                        .foregroundStyle(.red)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.05), radius: 4)
    }

    // MARK: - Actions

    private func createMenu() async {
        formError = ""
        if formTitle.trimmingCharacters(in: .whitespaces).isEmpty {
            formError = "メニュー名を入力してください"
            return
        }
        if formPrice < 500 {
            formError = "価格は500円以上に設定してください"
            return
        }

        let body = NewCommissionBody(
            title: formTitle,
            description: formDescription.isEmpty ? nil : formDescription,
            price: formPrice,
            deliveryDays: formDeliveryDays,
            revisionCount: formRevisionCount,
            maxSlots: formMaxSlots
        )

        let success = await manager.createCommission(body)
        if success {
            showForm = false
        } else {
            formError = manager.errorMessage ?? "作成に失敗しました"
        }
    }

    private func resetForm() {
        formTitle = ""
        formDescription = ""
        formPrice = 5000
        formDeliveryDays = 14
        formRevisionCount = 1
        formMaxSlots = 3
        formError = ""
    }
}

#Preview {
    CreatorCommissionsView()
}

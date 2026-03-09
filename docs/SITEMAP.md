# DRAW BASE — 全体サイトマップ & 実装方針

> 更新日: 2026-03-09

---

## 1. 全体 URL 設計

### 🌐 公開ページ（未ログインでもアクセス可）

| URL | 説明 | Phase | 状態 |
|-----|------|-------|------|
| `/` | トップページ（Hero + 機能紹介） | 1 | ✅ 実装済み |
| `/about` | サービス紹介・運営情報 | 2 | 🔲 未実装 |
| `/for-creators` | クリエイター向けLP | 2 | 🔲 未実装 |
| `/for-fans` | ファン向けLP | 2 | 🔲 未実装 |
| `/feed` | 作品フィード（公開） | 1 | ✅ 実装済み |
| `/community` | コミュニティ掲示板 | 1 | ✅ 実装済み |
| `/market` | マーケットプレイス一覧 | 1 | ✅ `/marketplace` で実装済み → リネーム |
| `/market/[id]` | 商品詳細 | 1 | ✅ `/marketplace/[id]` で実装済み → リネーム |
| `/creators` | クリエイター一覧 | 2 | 🔲 未実装 |
| `/creators/[id]` | クリエイター公開プロフィール | 2 | 🔲（`/users/[id]` を拡張） |
| `/works/[id]` | 作品詳細（公開） | 1 | ✅ `/posts/[id]` で実装済み → リネーム |
| `/commissions` | コミッション一覧 | 1 | ✅ 実装済み |
| `/commissions/[menuId]` | コミッションメニュー詳細 | 1 | ✅ 実装済み |

### 🔐 認証ページ

| URL | 説明 | Phase | 状態 |
|-----|------|-------|------|
| `/auth/login` | ログイン（クリエイター/ファン分割UI） | 1 | ✅ 実装済み |
| `/auth/register` | 新規登録 | 1 | ✅ 実装済み |
| `/auth/verify-email` | メール認証 | 1 | ✅ 実装済み |
| `/auth/register-success` | 登録完了ページ | 1 | ✅ 実装済み |
| `/auth/role-select` | 役割選択（登録後の初回遷移） | 1 | 🔲 未実装 |

### 🎨 クリエイター専用（`/creator/*`）

| URL | 説明 | Phase | 状態 |
|-----|------|-------|------|
| `/creator/dashboard` | ダッシュボード（統計・通知） | 1 | ✅ 実装済み |
| `/creator/profile` | 自分のプロフィール表示 | 1 | ✅ 実装済み |
| `/creator/profile/edit` | プロフィール編集 | 1 | ✅ 実装済み |
| `/creator/works` | 作品管理一覧 | 1 | ✅ 実装済み |
| `/creator/works/new` | 新規作品投稿 | 1 | ✅ 実装済み |
| `/creator/commissions` | コミッションメニュー管理 | 1 | ✅ 実装済み |
| `/creator/orders` | 受注一覧（受けた依頼の管理） | 2 | 🔲 未実装 |
| `/creator/analytics` | アクセス解析・収益分析 | 3 | 🔲 未実装 |
| `/creator/notifications` | クリエイター向け通知 | 2 | 🔲 未実装 |

### ⭐ ファン専用（`/fan/*`）

| URL | 説明 | Phase | 状態 |
|-----|------|-------|------|
| `/fan/dashboard` | ファンダッシュボード | 1 | 🔲 未実装 |
| `/fan/favorites` | お気に入り作品一覧 | 1 | 🔲 未実装 |
| `/fan/following` | フォロー中クリエイター | 1 | 🔲 未実装 |
| `/fan/purchases` | 購入済みコンテンツ | 2 | 🔲 未実装 |
| `/fan/orders` | コミッション依頼一覧 | 2 | 🔲 未実装 |
| `/fan/notifications` | ファン向け通知 | 2 | 🔲 未実装 |
| `/fan/profile/edit` | プロフィール編集 | 1 | 🔲 未実装 |

### 🛡️ 管理者専用（`/admin/*`）

| URL | 説明 | Phase | 状態 |
|-----|------|-------|------|
| `/admin` | 管理ダッシュボード | 1 | ✅ 実装済み |
| `/admin/users` | ユーザー管理一覧 | 1 | ✅ 実装済み |
| `/admin/users/[id]` | ユーザー詳細・BAN等 | 2 | 🔲 未実装（APIのみ存在） |

---

## 2. ナビゲーション設計（役割別）

### 未ログイン時

```
Header: [ホーム] [フィード] [コミュニティ] [マーケット] [コミッション]
        [クリエイター登録|ログイン]  [ファン登録|ログイン]
```

### クリエイターログイン時

```
Header:  [ホーム] [フィード] [コミュニティ] [マーケット] [コミッション] [+投稿]
         🔔通知  👤メニュー → [クリエイター管理] [プロフィール] [ログアウト]

Creator Sidebar (/creator/* 内):
  📊 ダッシュボード     /creator/dashboard
  🖼️ 作品管理          /creator/works
  ✏️ コミッション管理   /creator/commissions
  📦 受注管理          /creator/orders       ← Phase 2
  📈 アナリティクス     /creator/analytics    ← Phase 3
  🔔 通知             /creator/notifications ← Phase 2
  👤 プロフィール      /creator/profile
  ──────
  ➕ 新規作品を投稿     /creator/works/new
```

### ファンログイン時

```
Header:  [ホーム] [フィード] [コミュニティ] [マーケット] [コミッション]
         🔔通知  👤メニュー → [マイページ] [プロフィール] [ログアウト]

Fan Sidebar (/fan/* 内):
  🏠 ダッシュボード     /fan/dashboard
  ❤️ お気に入り        /fan/favorites
  👥 フォロー中        /fan/following
  🛒 購入履歴          /fan/purchases        ← Phase 2
  📋 依頼一覧          /fan/orders           ← Phase 2
  🔔 通知             /fan/notifications    ← Phase 2
  👤 プロフィール編集   /fan/profile/edit
```

### 管理者ログイン時

```
Header: [ホーム] ... [👤メニュー → 管理画面]

Admin Sidebar (/admin/* 内):
  📊 ダッシュボード     /admin
  👥 ユーザー管理      /admin/users
```

---

## 3. 認証フロー

```
新規登録 → /auth/register
    ↓
メール認証 → /auth/verify-email
    ↓
登録完了 → /auth/register-success
    ↓
自動ログイン → /auth/role-select（役割選択）
    ↓
  ┌──────────────────┐
  │ クリエイターを選択  │ → /creator/dashboard
  │ ファンを選択       │ → /fan/dashboard
  └──────────────────┘

既存ユーザーログイン → /auth/login
    ↓
  ┌──────────────────┐
  │ role あり          │ → 役割に応じたダッシュボード
  │ role なし          │ → /auth/role-select
  └──────────────────┘
```

---

## 4. Phase 別実装優先順位

### Phase 1 — MVP（即時実装）

**目標: 登録 → ロール選択 → 役割別ダッシュボードの一貫した流れ**

| # | タスク | 種別 | 対象 |
|---|--------|------|------|
| 1 | `/auth/role-select` ページ作成 | Web 新規 | 認証 |
| 2 | `/fan/dashboard` ページ作成 | Web 新規 | ファン |
| 3 | `/fan/favorites` ページ作成 | Web 新規 | ファン |
| 4 | `/fan/following` ページ作成 | Web 新規 | ファン |
| 5 | `/fan/profile/edit` ページ作成 | Web 新規 | ファン |
| 6 | Fan 用レイアウト + サイドバー作成 | Web 新規 | ファン |
| 7 | Fan 用 API routes（dashboard, favorites, following, profile） | API 新規 | ファン |
| 8 | middleware.ts にページ保護（認証 + ロールガード）追加 | Web 改修 | 全体 |
| 9 | Header にファン向けマイページリンク追加 | Web 改修 | 全体 |
| 10 | 登録後 role-select へのリダイレクト実装 | Web 改修 | 認証 |
| 11 | iOS: FanDashboardView 作成 | iOS 新規 | ファン |
| 12 | iOS: FanFavoritesView 作成 | iOS 新規 | ファン |
| 13 | iOS: FanFollowingView 作成 | iOS 新規 | ファン |
| 14 | iOS: FanProfileEditView 作成 | iOS 新規 | ファン |
| 15 | iOS: FanManager (@Observable) 作成 | iOS 新規 | ファン |
| 16 | iOS: FanTabView 更新 | iOS 改修 | ファン |

### Phase 2 — 機能充実

| # | タスク | 種別 | 対象 |
|---|--------|------|------|
| 1 | `/about` ページ作成 | Web 新規 | 公開 |
| 2 | `/for-creators` LP 作成 | Web 新規 | 公開 |
| 3 | `/for-fans` LP 作成 | Web 新規 | 公開 |
| 4 | `/creators` クリエイター一覧ページ作成 | Web 新規 | 公開 |
| 5 | `/creators/[id]` クリエイター公開プロフィール作成 | Web 新規 | 公開 |
| 6 | `/creator/orders` 受注管理ページ作成 | Web 新規 | クリエイター |
| 7 | `/creator/notifications` 通知ページ作成 | Web 新規 | クリエイター |
| 8 | `/fan/purchases` 購入履歴ページ作成 | Web 新規 | ファン |
| 9 | `/fan/orders` 依頼一覧ページ作成 | Web 新規 | ファン |
| 10 | `/fan/notifications` 通知ページ作成 | Web 新規 | ファン |
| 11 | `/admin/users/[id]` 管理者ユーザー詳細ページ | Web 新規 | 管理者 |
| 12 | URL リネーム: `/marketplace` → `/market` | Web 改修 | 全体 |
| 13 | URL リネーム: `/posts/[id]` → `/works/[id]` | Web 改修 | 全体 |
| 14 | iOS: CreatorOrdersView 作成 | iOS 新規 | クリエイター |
| 15 | iOS: FanPurchasesView 作成 | iOS 新規 | ファン |
| 16 | iOS: FanOrdersView 作成 | iOS 新規 | ファン |
| 17 | Favorite モデル追加 (DB) | DB 変更 | 全体 |

### Phase 3 — 成長機能

| # | タスク | 種別 | 対象 |
|---|--------|------|------|
| 1 | `/creator/analytics` アクセス解析ページ | Web 新規 | クリエイター |
| 2 | Analytics API + 日次集計バッチ | API 新規 | クリエイター |
| 3 | iOS: CreatorAnalyticsView 作成 | iOS 新規 | クリエイター |
| 4 | レコメンド機能（ファン向け） | 全体 | ファン |
| 5 | DM / メッセージ機能 | 全体 | 全ロール |
| 6 | Stripe Connect 振込管理画面 | Web 新規 | クリエイター |

---

## 5. 推奨フォルダ構成

### Web (Next.js App Router)

```
draw-base-web/
├── app/
│   ├── page.tsx                          # トップ
│   ├── layout.tsx                        # ルートレイアウト
│   │
│   ├── about/page.tsx                    # Phase 2
│   ├── for-creators/page.tsx             # Phase 2
│   ├── for-fans/page.tsx                 # Phase 2
│   │
│   ├── feed/page.tsx                     # 公開フィード
│   ├── community/page.tsx                # コミュニティ
│   ├── market/                           # マーケットプレイス
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── new/page.tsx
│   ├── commissions/
│   │   ├── page.tsx
│   │   └── [menuId]/page.tsx
│   ├── creators/                         # Phase 2: クリエイター一覧
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── works/                            # 作品詳細
│   │   └── [id]/page.tsx
│   │
│   ├── auth/                             # 認証
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── register-success/page.tsx
│   │   └── role-select/page.tsx          # ★ Phase 1 新規
│   │
│   ├── creator/                          # クリエイター管理
│   │   ├── layout.tsx                    # CreatorSidebar 付きレイアウト
│   │   ├── dashboard/page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── edit/page.tsx
│   │   ├── works/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── commissions/page.tsx
│   │   ├── orders/page.tsx               # Phase 2
│   │   ├── analytics/page.tsx            # Phase 3
│   │   └── notifications/page.tsx        # Phase 2
│   │
│   ├── fan/                              # ★ Phase 1 新規
│   │   ├── layout.tsx                    # FanSidebar 付きレイアウト
│   │   ├── dashboard/page.tsx
│   │   ├── favorites/page.tsx
│   │   ├── following/page.tsx
│   │   ├── profile/
│   │   │   └── edit/page.tsx
│   │   ├── purchases/page.tsx            # Phase 2
│   │   ├── orders/page.tsx               # Phase 2
│   │   └── notifications/page.tsx        # Phase 2
│   │
│   ├── admin/                            # 管理者
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── users/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx             # Phase 2
│   │
│   └── api/
│       ├── auth/                         # 認証 API
│       ├── creator/                      # クリエイター API
│       │   ├── dashboard/route.ts
│       │   ├── profile/route.ts
│       │   ├── works/route.ts
│       │   ├── commissions/route.ts
│       │   └── orders/route.ts           # Phase 2
│       ├── fan/                          # ★ Phase 1 新規
│       │   ├── dashboard/route.ts
│       │   ├── favorites/route.ts
│       │   ├── following/route.ts
│       │   └── profile/route.ts
│       ├── admin/                        # 管理者 API
│       ├── posts/
│       ├── products/
│       ├── commissions/
│       └── ...
│
├── components/
│   ├── Header.tsx                        # 役割別ナビ表示
│   ├── Footer.tsx
│   ├── CreatorSidebar.tsx
│   ├── FanSidebar.tsx                    # ★ Phase 1 新規
│   ├── PostCard.tsx
│   ├── ProductCard.tsx
│   ├── CommissionCard.tsx
│   ├── CommunityPostCard.tsx
│   └── Providers.tsx
│
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── apiClient.ts
│   ├── stripe.ts
│   └── ...
│
├── prisma/
│   └── schema.prisma
│
└── types/
    └── index.ts
```

### iOS (SwiftUI)

```
DRAW BASE/DRAW BASE/
├── DRAW_BASEApp.swift              # エントリポイント
├── ContentView.swift               # ルーティング（ログイン状態 + ロール判定）
│
├── Auth/
│   ├── AuthManager.swift           # 認証状態管理
│   ├── LoginView.swift
│   ├── RegisterView.swift
│   └── RoleSelectionView.swift
│
├── Creator/
│   ├── CreatorTabView.swift        # タブナビゲーション
│   ├── CreatorManager.swift        # APIマネージャー
│   ├── CreatorDashboardView.swift
│   ├── CreatorProfileView.swift
│   ├── CreatorProfileEditView.swift
│   ├── CreatorWorksView.swift
│   ├── CreatorNewWorkView.swift
│   ├── CreatorCommissionsView.swift
│   └── CreatorOrdersView.swift     # Phase 2
│
├── Fan/
│   ├── FanTabView.swift            # タブナビゲーション
│   ├── FanManager.swift            # ★ Phase 1 新規
│   ├── FanDashboardView.swift      # ★ Phase 1 新規
│   ├── FanFavoritesView.swift      # ★ Phase 1 新規
│   ├── FanFollowingView.swift      # ★ Phase 1 新規
│   ├── FanProfileEditView.swift    # ★ Phase 1 新規
│   ├── FanPurchasesView.swift      # Phase 2
│   └── FanOrdersView.swift         # Phase 2
│
├── Shared/
│   ├── FeedView.swift
│   ├── CommunityView.swift
│   ├── MarketplaceView.swift
│   ├── NotificationsView.swift
│   ├── ProfileView.swift
│   └── DashboardView.swift
│
├── Networking/
│   ├── APIClient.swift
│   ├── APIConfig.swift
│   └── KeychainHelper.swift
│
└── Models/
    └── Models.swift
```

---

## 6. 必要モデル一覧

### 既存モデル（実装済み）

| モデル | テーブル | 用途 |
|--------|----------|------|
| User | `users` | ユーザー（全ロール共通） |
| Post | `posts` | 作品 |
| CommunityPost | `community_posts` | コミュニティ投稿 |
| Comment | `comments` | コメント |
| Product | `products` | マーケット商品 |
| Purchase | `purchases` | 購入履歴 |
| CommissionMenu | `commission_menus` | コミッションメニュー |
| CommissionOrder | `commission_orders` | コミッション依頼 |
| Follow | `follows` | フォロー関係 |
| Like | `likes` | いいね |
| Notification | `notifications` | 通知 |
| EmailVerificationToken | `email_verification_tokens` | メール認証トークン |

### 追加予定モデル

| モデル | テーブル | Phase | 用途 | フィールド概要 |
|--------|----------|-------|------|----------------|
| **Favorite** | `favorites` | **1** | お気に入り（ファン） | `id`, `userId`, `postId`, `createdAt` |
| **ViewLog** | `view_logs` | 3 | アクセス解析 | `id`, `postId`, `viewerIp`, `createdAt` |
| **Message** | `messages` | 3 | DM | `id`, `senderId`, `receiverId`, `content`, `createdAt` |

### 既存モデルの変更予定

| モデル | フィールド追加 | Phase | 理由 |
|--------|---------------|-------|------|
| User | `genres[]`, `commissionOpen`, `instagramHandle`, `pixivUrl` | ✅ 済 | クリエイタープロフィール |
| CommissionMenu | `revisionCount` | ✅ 済 | リビジョン回数 |

### Enum 一覧

| Enum | 値 | 状態 |
|------|----|------|
| UserRole | `CREATOR`, `FAN`, `BOTH` | ✅ 済 |
| CommissionStatus | `PENDING`, `ACCEPTED`, `IN_PROGRESS`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `DISPUTED` | ✅ 済 |
| NotificationType | `LIKE`, `COMMENT`, `FOLLOW`, `COMMISSION_REQUEST`, `COMMISSION_UPDATE`, `PURCHASE`, `SYSTEM` | ✅ 済 |

---

## 7. ミドルウェア認証ガード設計

```typescript
// middleware.ts — ページ保護マトリクス

const PROTECTED_ROUTES = {
  // クリエイター専用
  "/creator": { roles: ["CREATOR", "BOTH"], redirect: "/auth/login?role=creator" },
  // ファン専用
  "/fan":     { roles: ["FAN", "BOTH"],     redirect: "/auth/login?role=fan" },
  // 管理者専用
  "/admin":   { requireAdmin: true,         redirect: "/" },
  // 認証必須（ロール不問）
  "/notifications": { authenticated: true,  redirect: "/auth/login" },
};
```

**実装方針:**
- NextAuth の `getToken()` でJWTを検証
- `role` と `isAdmin` をチェック
- 未認証 → `/auth/login` へリダイレクト
- 認証済み＋ロール未選択 → `/auth/role-select` へリダイレクト
- ロール不一致 → 適切なダッシュボードへリダイレクト

---

## 8. API 設計（新規分）

### Phase 1 で追加する API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/api/fan/dashboard` | ファンダッシュボード（お気に入り数、フォロー数、最近のいいね作品） |
| GET | `/api/fan/favorites` | お気に入り一覧（ページネーション） |
| POST | `/api/fan/favorites` | お気に入り追加 |
| DELETE | `/api/fan/favorites` | お気に入り解除 |
| GET | `/api/fan/following` | フォロー中クリエイター一覧 |
| GET | `/api/fan/profile` | ファンプロフィール取得 |
| PUT | `/api/fan/profile` | ファンプロフィール更新 |

### Phase 2 で追加する API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/api/creator/orders` | 受注一覧（ステータス別フィルタ） |
| PUT | `/api/creator/orders/[id]` | 受注ステータス更新 |
| GET | `/api/fan/purchases` | 購入履歴 |
| GET | `/api/fan/orders` | コミッション依頼一覧 |
| GET | `/api/creators` | クリエイター検索・一覧 |
| GET | `/api/creators/[id]` | クリエイター公開プロフィール |

---

## 9. iOS 対応マトリクス

### ファン側タブ構成（Phase 1 更新後）

| タブ | 現在 | Phase 1 後 |
|------|------|------------|
| 🏠 ホーム | FeedView | **FanDashboardView** |
| 🔍 探す | CommunityView | CommunityView（変更なし） |
| 🛒 マーケット | MarketplaceView | MarketplaceView（変更なし） |
| 🔔 通知 | NotificationsView | NotificationsView（変更なし） |
| 👤 プロフィール | ProfileView | **FanProfileEditView**（編集可能に） |

### クリエイター側タブ構成（現状維持）

| タブ | View |
|------|------|
| 📊 ダッシュボード | CreatorDashboardView ✅ |
| 🖼️ 作品 | CreatorWorksView ✅ |
| ✏️ コミッション | CreatorCommissionsView ✅ |
| 👥 コミュニティ | CommunityView ✅ |
| 👤 プロフィール | CreatorProfileView ✅ |

### iOS 新規ファイル一覧（Phase 1）

| ファイル | 説明 |
|----------|------|
| `FanManager.swift` | @Observable ファンAPI管理 |
| `FanDashboardView.swift` | お気に入り数・フォロー数・最近の作品 |
| `FanFavoritesView.swift` | いいねした作品一覧 |
| `FanFollowingView.swift` | フォロー中クリエイター一覧 |
| `FanProfileEditView.swift` | プロフィール編集フォーム |

### iOS Models.swift 追加型（Phase 1）

```swift
// ファンダッシュボード
struct FanDashboardData: Decodable {
    let stats: FanStats
    let recentFavorites: [WorkItem]
}

struct FanStats: Decodable {
    let favoritesCount: Int
    let followingCount: Int
    let purchasesCount: Int
    let ordersCount: Int
}

// お気に入り
struct FavoriteItem: Codable, Identifiable, Sendable {
    let id: String
    let postId: String
    let post: WorkItem
    let createdAt: String
}

// フォロー中クリエイター
struct FollowingCreator: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let displayName: String?
    let avatarUrl: String?
    let bio: String?
    let genres: [String]
}
```

---

## 10. 実装チェックリスト

### Phase 1 MVP — 実装順序

```
1. [DB] Favorite モデルを schema.prisma に追加 → prisma db push
2. [Web] /auth/role-select ページ作成
3. [Web] auth フロー修正（登録後 → role-select → ダッシュボード）
4. [Web] middleware.ts にページ保護ガード追加
5. [Web] FanSidebar + fan/layout.tsx 作成
6. [API] /api/fan/* ルート作成（dashboard, favorites, following, profile）
7. [Web] /fan/dashboard, favorites, following, profile/edit ページ作成
8. [Web] Header にファン向けリンク追加
9. [iOS] FanManager + FanDashboardView + FanFavoritesView + FanFollowingView 作成
10. [iOS] FanProfileEditView 作成
11. [iOS] FanTabView 更新
12. [Test] 全フロー E2E 確認
```

---

## 11. 補足: URL リネーム方針（Phase 2）

| 現在のURL | 新URL | 理由 |
|-----------|-------|------|
| `/marketplace` | `/market` | 短縮・統一 |
| `/marketplace/[id]` | `/market/[id]` | 同上 |
| `/marketplace/new` | `/market/new` | 同上 |
| `/posts/[id]` | `/works/[id]` | 「作品」表記に統一 |
| `/users/[id]` | `/creators/[id]` | クリエイター公開プロフィールとして再設計 |

> ⚠️ リネーム時は `next.config.js` の `redirects()` で旧URLからの301リダイレクトを設定すること

---

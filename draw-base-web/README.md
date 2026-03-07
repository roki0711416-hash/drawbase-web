# DRAW BASE

クリエイター向けプラットフォーム — イラスト投稿・コミッション・デジタルマーケットプレイス

## アーキテクチャ

DRAW BASE は Web フロントエンドと API バックエンドを **分離デプロイ可能** なアーキテクチャで設計されています。

### 本番ドメイン

| サービス | ドメイン | 説明 |
|---------|---------|------|
| Web Frontend | `https://drawbase.net` | Next.js フロントエンド（SSR / CSR） |
| API Backend | `https://api.drawbase.net` | Next.js API Routes |

### システム構成図

```
┌──────────┐         ┌─────────────────────┐
│  iOS App │────────▶│                     │
└──────────┘         │  api.drawbase.net   │──▶ PostgreSQL
                     │  (API Backend)      │──▶ Stripe
┌──────────┐         │                     │──▶ File Storage
│   Web    │────────▶│                     │
│drawbase. │         └─────────────────────┘
│   net    │
└──────────┘
```

## ローカル開発

### 前提条件

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して DATABASE_URL 等を設定

# Prisma のセットアップ
npx prisma generate
npx prisma db push

# 開発サーバーの起動
npm run dev
```

ローカルでは Web と API は **同一サーバー** で動作します：
- Web + API: `http://localhost:3000`
- `NEXT_PUBLIC_API_URL` は空文字のまま（相対パスで動作）

### 分離アーキテクチャのローカルテスト

```bash
# ターミナル1: API サーバー (port 3001)
npm run dev:api

# ターミナル2: Web フロントエンド (port 3000)
NEXT_PUBLIC_API_URL="http://localhost:3001" npm run dev:web
```

## 本番デプロイ

### 1. API バックエンド → api.drawbase.net

#### 環境変数

```env
DATABASE_URL="postgresql://user:password@db-host:5432/drawbase"
NEXTAUTH_URL="https://api.drawbase.net"
NEXTAUTH_SECRET="<secure-random-string>"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

NEXT_PUBLIC_WEB_URL="https://drawbase.net"
NEXT_PUBLIC_API_URL=""
NEXT_PUBLIC_APP_URL="https://drawbase.net"
NEXT_PUBLIC_APP_NAME="DRAW BASE"
UPLOAD_DIR="/var/uploads"
```

> ⚠️ API サーバー自身では `NEXT_PUBLIC_API_URL` は **空文字** にします。

#### デプロイコマンド（Vercel）

```bash
cd draw-base-web
vercel --prod
```

### 2. Web フロントエンド → drawbase.net

#### 環境変数

```env
NEXTAUTH_URL="https://drawbase.net"
NEXTAUTH_SECRET="<api-と同じ値>"

NEXT_PUBLIC_WEB_URL="https://drawbase.net"
NEXT_PUBLIC_API_URL="https://api.drawbase.net"
NEXT_PUBLIC_APP_URL="https://drawbase.net"
NEXT_PUBLIC_APP_NAME="DRAW BASE"
```

> Web フロントエンドでは `DATABASE_URL`, `STRIPE_*` は **不要** です。

#### デプロイコマンド（Vercel）

```bash
cd draw-base-web
vercel --prod
```

### 3. DNS 設定

| Type | Name | Value | 備考 |
|------|------|-------|------|
| A / CNAME | `drawbase.net` | ホスティング先の指示に従う | Web フロントエンド |
| A / CNAME | `api.drawbase.net` | ホスティング先の指示に従う | API バックエンド |

#### Vercel の場合

1. Vercel ダッシュボードで **2つのプロジェクト** を作成
2. 各プロジェクトの **Settings → Domains** でドメインを追加
3. DNS プロバイダーで Vercel が指定する CNAME レコードを設定
4. SSL 証明書は Vercel が **自動発行**

#### Cloudflare DNS 例

```
drawbase.net      CNAME  cname.vercel-dns.com
api.drawbase.net  CNAME  cname.vercel-dns.com
```

### 4. ヘルスチェック

```bash
curl https://api.drawbase.net/api/health
# => { "ok": true }
```

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | API | PostgreSQL 接続文字列 |
| `NEXTAUTH_URL` | 両方 | NextAuth のベース URL |
| `NEXTAUTH_SECRET` | 両方 | セッション署名キー（両方同じ値） |
| `STRIPE_SECRET_KEY` | API | Stripe シークレットキー |
| `STRIPE_PUBLISHABLE_KEY` | API | Stripe 公開キー |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe Webhook 署名シークレット |
| `NEXT_PUBLIC_WEB_URL` | 両方 | Web フロントエンド URL |
| `NEXT_PUBLIC_API_URL` | Web | API バックエンド URL（API側は空文字） |
| `NEXT_PUBLIC_APP_URL` | 両方 | アプリ URL（レガシー互換） |
| `NEXT_PUBLIC_APP_NAME` | 任意 | アプリ名 |
| `UPLOAD_DIR` | API | アップロードディレクトリ |

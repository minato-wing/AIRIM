# AIRIM セットアップガイド

## 必要な環境変数

このアプリケーションを実行するには、以下の環境変数を `.env` ファイルに設定する必要があります。

### 1. データベース (Supabase PostgreSQL)

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**取得方法:**
1. [Supabase](https://supabase.com/) にアクセスしてプロジェクトを作成
2. Project Settings → Database → Connection string
3. **"Session mode"** を選択（推奨）
4. パスワードを入力して接続文字列を取得

**重要:**
- パスワードに特殊文字（`&`, `@`, `#` など）が含まれる場合は **URLエンコード** が必要
  - 例: `&` → `%26`, `@` → `%40`
- **Session mode (Pooler)** の使用を推奨（IPv6 問題を回避）
- 詳細は `DATABASE_CONNECTION_GUIDE.md` を参照

### 2. 認証 (Clerk)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**取得方法:**
1. [Clerk](https://clerk.com/) にアクセスしてアカウントを作成
2. 新しいアプリケーションを作成
3. Dashboard → API Keys から以下をコピー:
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

**ソーシャルログイン設定 (オプション):**
- Dashboard → User & Authentication → Social Connections
- Google と X (Twitter) を有効化

### 3. ストレージ (Supabase Storage)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=xxxxx
```

**取得方法:**
1. Supabase プロジェクトの Project Settings → API
2. 以下をコピー:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API keys → Secret key → `SUPABASE_SECRET_KEY` (⚠️ サーバーサイド専用)

**注意:** 
- 画像アップロードはサーバーサイドで処理されるため、Secret key のみが必要です
- クライアントサイドから直接 Supabase にアクセスすることはありません
- `service_role` キーではなく、**Secret key** を使用してください（Supabase の推奨）

**ストレージバケット作成:**
1. Supabase Dashboard → Storage
2. 新しいバケット `posts` を作成
3. Public バケットとして設定

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーして、上記の環境変数を設定:

```bash
cp .env.example .env
```

### 3. データベースのマイグレーション

```bash
npx prisma migrate dev --name init
```

### 4. Prisma Client の生成

```bash
npx prisma generate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 環境変数一覧

| 変数名 | 必須 | 説明 | 取得元 |
|--------|------|------|--------|
| `DATABASE_URL` | ✅ | PostgreSQL接続文字列 | Supabase Database |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk公開鍵 | Clerk Dashboard |
| `CLERK_SECRET_KEY` | ✅ | Clerkシークレット鍵 | Clerk Dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | サインインURL | 固定値: `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | サインアップURL | 固定値: `/sign-up` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | SupabaseプロジェクトURL | Supabase API Settings |
| `SUPABASE_SECRET_KEY` | ✅ | Supabase Secret key (サーバー専用) | Supabase API Settings |

## トラブルシューティング

### Prisma Client エラー

```bash
npx prisma generate
```

### データベース接続エラー

- `DATABASE_URL` が正しく設定されているか確認
- Supabase プロジェクトが起動しているか確認

### Clerk 認証エラー

- Clerk の API キーが正しく設定されているか確認
- Clerk Dashboard でアプリケーションが有効になっているか確認

### 画像アップロードエラー

- Supabase Storage で `posts` バケットが作成されているか確認
- バケットが Public に設定されているか確認

## デプロイ (Vercel)

1. [Vercel](https://vercel.com/) にプロジェクトをインポート
2. Environment Variables に上記の環境変数を設定
3. デプロイ

## 技術スタック

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **Storage:** Supabase Storage
- **Hosting:** Vercel

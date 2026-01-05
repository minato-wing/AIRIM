# 環境変数設定ガイド

AIRIM アプリケーションを実行するために必要な環境変数の一覧と取得方法です。

## 必須環境変数一覧

### 1. データベース接続 (Supabase PostgreSQL)

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**取得手順:**
1. [Supabase](https://supabase.com/) でアカウント作成
2. 新規プロジェクトを作成
3. Project Settings → Database → Connection string
4. **"Session mode"** を選択（推奨）
5. パスワードを入力して完全な接続文字列を取得

**重要な注意事項:**

#### パスワードの特殊文字をURLエンコード
パスワードに以下の文字が含まれる場合は、URLエンコードが必要です:
- `&` → `%26`
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `?` → `%3F`
- `/` → `%2F`

例:
```
元のパスワード: myP@ss&word
エンコード後: myP%40ss%26word
```

#### 接続モードの選択
- **Session mode (推奨)**: `aws-0-REGION.pooler.supabase.com:6543`
  - コネクションプーリング
  - サーバーレス環境に最適
  - IPv6 問題を回避
- **Direct connection**: `db.PROJECT_REF.supabase.co:5432`
  - 直接接続
  - マイグレーション時に使用

詳細なトラブルシューティングは `DATABASE_CONNECTION_GUIDE.md` を参照してください。

---

### 2. 認証サービス (Clerk)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**取得手順:**

#### Publishable Key と Secret Key:
1. [Clerk](https://clerk.com/) でアカウント作成
2. 新しいアプリケーションを作成
3. Dashboard → API Keys
4. 以下をコピー:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

#### Sign In/Up URLs:
- これらは固定値です。変更不要。

#### ソーシャルログイン設定 (オプション):
1. Clerk Dashboard → User & Authentication → Social Connections
2. **Google** を有効化:
   - Google Cloud Console で OAuth 2.0 クライアント ID を作成
   - Clerk に認証情報を設定
3. **X (Twitter)** を有効化:
   - Twitter Developer Portal でアプリを作成
   - Clerk に API Key と Secret を設定

---

### 3. ストレージサービス (Supabase Storage)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=xxxxx
```

**取得手順:**
1. Supabase プロジェクトの Project Settings → API
2. 以下をコピー:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **Secret key** → `SUPABASE_SECRET_KEY` (⚠️ サーバーサイド専用の秘密情報)

**重要:**
- **Secret key** を使用してください（`service_role` キーではありません）
- Supabase では `service_role` はレガシーとされており、Secret key の使用が推奨されています

**セキュリティ:**
画像アップロードはサーバーサイドで処理されます。クライアント（ブラウザ）から直接 Supabase Storage にアクセスすることはないため、Secret key のみを使用します。

**ストレージバケット作成:**
1. Supabase Dashboard → Storage
2. "New bucket" をクリック
3. バケット名: `posts`
4. **Public bucket** にチェックを入れる
5. 作成

---

## 環境変数設定方法

### ローカル開発環境

1. `.env.example` を `.env` にコピー:
```bash
cp .env.example .env
```

2. `.env` ファイルを編集して上記の値を設定

3. `.env` ファイルは `.gitignore` に含まれているため、Git にコミットされません

### Vercel デプロイ

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 上記の環境変数をすべて追加
3. Environment: Production, Preview, Development すべてにチェック
4. 保存後、再デプロイ

---

## セキュリティ注意事項

⚠️ **絶対に公開してはいけない環境変数:**
- `CLERK_SECRET_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL` (パスワードが含まれる)

✅ **公開しても問題ない環境変数 (NEXT_PUBLIC_ プレフィックス):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

---

## トラブルシューティング

### データベース接続エラー
- `DATABASE_URL` の形式が正しいか確認
- Supabase プロジェクトが起動しているか確認
- パスワードに特殊文字が含まれる場合は URL エンコードが必要

### Clerk 認証エラー
- API キーが正しくコピーされているか確認
- Clerk Dashboard でアプリケーションが有効になっているか確認
- 開発環境と本番環境で異なる API キーを使用している場合は注意

### 画像アップロードエラー
- Supabase Storage で `posts` バケットが作成されているか確認
- バケットが **Public** に設定されているか確認
- `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SECRET_KEY` が正しいか確認
- **Secret key** を使用しているか確認（`service_role` ではない）
- ファイルサイズが 5MB 以下か確認
- 対応形式 (JPEG, PNG, GIF, WebP) か確認

---

## 環境変数チェックリスト

設定完了後、以下を確認してください:

- [ ] `DATABASE_URL` - Supabase PostgreSQL 接続文字列
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk 公開鍵
- [ ] `CLERK_SECRET_KEY` - Clerk シークレット鍵
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/sign-up`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase プロジェクト URL
- [ ] `SUPABASE_SECRET_KEY` - Supabase Secret key (サーバー専用、service_role ではない)
- [ ] Supabase Storage に `posts` バケットを作成 (Public)

すべてチェックが完了したら、アプリケーションを起動できます:

```bash
npm run dev
```

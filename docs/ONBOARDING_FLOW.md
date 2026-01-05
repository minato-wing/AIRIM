# オンボーディングフロー

## 概要

新規ユーザーがアカウント登録後、プロフィール情報（ユーザーID、表示名）を入力する必要があります。プロフィールが作成されるまで、メインアプリケーションにアクセスできません。

## フロー

### 1. アカウント登録（Clerk）

```
/sign-up → Clerk でアカウント作成
```

- メールアドレス/パスワード
- Google ログイン
- X (Twitter) ログイン

### 2. プロフィール作成（必須）

```
/onboarding/setup → プロフィール情報入力
```

**入力項目:**
- **ユーザーID** (必須)
  - 英数字とアンダースコア(_)のみ
  - 最大30文字
  - システム全体でユニーク
- **表示名** (必須)
  - 最大50文字
- **自己紹介** (任意)
  - 最大200文字

**バリデーション:**
- ユーザーIDの形式チェック
- ユーザーIDの重複チェック
- 必須項目の入力チェック

### 3. メインアプリケーション

```
/home → タイムライン表示
```

プロフィール作成後、自動的にホーム画面にリダイレクトされます。

## 実装詳細

### プロフィールチェック

`app/(main)/layout.tsx` でプロフィールの存在をチェック:

```typescript
export default async function MainLayout({ children }) {
  const hasProfile = await checkProfileExists()

  if (!hasProfile) {
    redirect('/onboarding/setup')
  }

  return (
    // メインレイアウト
  )
}
```

### プロフィール作成

`lib/actions/profile.ts` の `createProfile` 関数:

```typescript
export async function createProfile(data: {
  username: string
  name: string
  bio?: string
}) {
  // 1. 認証チェック
  // 2. 既存プロフィールチェック
  // 3. ユーザーID重複チェック
  // 4. プロフィール作成
}
```

### ディレクトリ構造

```
app/
├── (main)/              # 認証済み & プロフィール作成済みユーザー
│   ├── layout.tsx       # プロフィールチェック
│   ├── home/
│   ├── profile/
│   └── ...
├── onboarding/          # プロフィール未作成ユーザー
│   └── setup/
│       └── page.tsx     # プロフィール作成フォーム
├── sign-in/             # Clerk サインイン
└── sign-up/             # Clerk サインアップ
```

## ユーザー体験

### 新規ユーザー

1. `/sign-up` でアカウント作成
2. 自動的に `/onboarding/setup` にリダイレクト
3. プロフィール情報を入力
4. `/home` にリダイレクトされ、アプリを使用開始

### 既存ユーザー

1. `/sign-in` でログイン
2. プロフィールが存在するため、直接 `/home` にアクセス可能

### プロフィール未作成ユーザー

メインアプリケーション（`/home`, `/profile` など）にアクセスしようとすると、自動的に `/onboarding/setup` にリダイレクトされます。

## エラーハンドリング

### ユーザーID重複

```typescript
if (existingUsername) {
  throw new Error('このユーザーIDは既に使用されています')
}
```

エラーメッセージがフォーム上部に表示されます。

### 形式エラー

```typescript
if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
  setError('ユーザーIDは英数字とアンダースコア(_)のみ使用できます')
}
```

クライアントサイドでバリデーションを実行し、即座にフィードバックを提供します。

## データベーススキーマ

```prisma
model Profile {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  username  String   @unique
  name      String
  bio       String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  posts     Post[]
  likes     Like[]
  reposts   Repost[]
  followers Follow[] @relation("Following")
  following Follow[] @relation("Follower")
  notifications Notification[]

  @@index([username])
  @@index([clerkId])
}
```

## セキュリティ

### 認証チェック

すべてのサーバーアクションで Clerk の認証をチェック:

```typescript
const { userId } = await auth()
if (!userId) throw new Error('Unauthorized')
```

### ユニーク制約

- `clerkId`: Clerk ユーザーIDとの1対1マッピング
- `username`: システム全体でユニーク

### バリデーション

- クライアントサイド: 即座なフィードバック
- サーバーサイド: 最終的な検証

## トラブルシューティング

### プロフィールが作成されない

**症状:** `/onboarding/setup` で「作成」ボタンを押してもエラーが出る

**原因:**
1. データベース接続エラー
2. ユーザーID重複
3. 必須項目未入力

**解決策:**
1. `DATABASE_URL` が正しく設定されているか確認
2. 別のユーザーIDを試す
3. すべての必須項目を入力

### 無限リダイレクトループ

**症状:** `/onboarding/setup` と `/home` の間でリダイレクトが繰り返される

**原因:** プロフィールチェックのロジックエラー

**解決策:**
1. ブラウザのキャッシュをクリア
2. データベースでプロフィールが正しく作成されているか確認
3. Clerk セッションをリセット（ログアウト→ログイン）

### プロフィールが既に存在するエラー

**症状:** 「プロフィールは既に作成されています」というエラー

**原因:** 既にプロフィールが作成されている

**解決策:**
1. `/home` に直接アクセス
2. または `/profile` でプロフィールを確認

## テストシナリオ

### 新規ユーザー登録

1. `/sign-up` でアカウント作成
2. `/onboarding/setup` にリダイレクトされることを確認
3. プロフィール情報を入力
4. `/home` にリダイレクトされることを確認
5. 投稿が作成できることを確認

### 既存ユーザーログイン

1. `/sign-in` でログイン
2. `/home` に直接アクセスできることを確認
3. プロフィールページが表示されることを確認

### プロフィール未作成ユーザー

1. データベースからプロフィールを削除
2. `/home` にアクセス
3. `/onboarding/setup` にリダイレクトされることを確認
4. プロフィールを作成
5. `/home` にアクセスできることを確認

## まとめ

- ✅ 新規ユーザーは必ずプロフィールを作成する必要がある
- ✅ プロフィール未作成の場合、自動的にオンボーディングページにリダイレクト
- ✅ ユーザーIDはシステム全体でユニーク
- ✅ クライアント・サーバー両方でバリデーション
- ✅ エラーメッセージは日本語で分かりやすく表示

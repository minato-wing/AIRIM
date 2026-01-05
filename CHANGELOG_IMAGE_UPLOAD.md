# 画像アップロード実装変更

## 変更概要

クライアント（ブラウザ）から直接 Supabase Storage にアップロードする実装から、バックエンド（Server Actions）経由でアップロードする実装に変更しました。

## 変更理由

### セキュリティ向上
- クライアントサイドで `SUPABASE_ANON_KEY` を公開する必要がなくなった
- サーバーサイドで `SUPABASE_SECRET_KEY` を使用（Supabase 推奨のベストプラクティス）
- ファイルサイズやファイル形式のバリデーションをサーバーサイドで実施

### アーキテクチャの改善
- すべてのデータ操作がサーバーサイドで完結
- クライアントサイドのコードがシンプルになり、保守性が向上

## 変更内容

### 1. 新規ファイル

#### `lib/actions/upload.ts`
画像アップロード用の Server Action を追加:
- ファイルサイズ制限: 5MB
- 対応形式: JPEG, PNG, GIF, WebP
- 認証チェック（Clerk）
- サーバーサイドでのバリデーション

### 2. 変更ファイル

#### `lib/supabase.ts`
- クライアント用の `supabase` を削除
- サーバー専用の `supabaseAdmin` を追加
- `uploadImage()` → `uploadImageToStorage()` に変更（サーバー専用）
- `deleteImage()` → `deleteImageFromStorage()` に変更（サーバー専用）

#### `components/post-form.tsx`
- `uploadImage` のインポート元を変更:
  - Before: `@/lib/supabase`
  - After: `@/lib/actions/upload`
- FormData を使用してサーバーアクションを呼び出すように変更

#### `lib/actions/post.ts`
- `deletePost()` 関数に画像削除処理を追加
- 投稿削除時に関連する画像も Supabase Storage から削除

### 3. 環境変数の変更

#### 削除された環境変数
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - クライアントサイドから Supabase にアクセスしないため不要

#### 使用する環境変数
- `NEXT_PUBLIC_SUPABASE_URL` - 公開 URL の生成に使用
- `SUPABASE_SECRET_KEY` - サーバーサイド専用（秘密情報）
  - **注意:** `service_role` キーではなく **Secret key** を使用（Supabase 推奨）

### 4. ドキュメントの更新

以下のファイルを更新:
- `.env.example`
- `SETUP.md`
- `ENV_VARIABLES.md`

## 実装の流れ

### Before（クライアント直接アップロード）
```
ブラウザ → Supabase Storage (ANON_KEY使用)
```

### After（サーバー経由アップロード）
```
ブラウザ → Server Action → Supabase Storage (SECRET_KEY使用)
```

## セキュリティ上の利点

1. **秘密鍵の保護**
   - `SECRET_KEY` がクライアントに公開されない
   - Supabase 推奨の Secret key をサーバーサイドでのみ使用

2. **バリデーション**
   - ファイルサイズ制限（5MB）
   - ファイル形式チェック（JPEG, PNG, GIF, WebP）
   - 認証済みユーザーのみアップロード可能

3. **ファイル名の管理**
   - ユーザーIDを含むファイル名を生成
   - ファイル名の衝突を防止

## 使用方法

### 画像アップロード

```typescript
// components/post-form.tsx
const formData = new FormData()
formData.append('file', file)

const result = await uploadImage(formData)
if (result.url) {
  // アップロード成功
  console.log('Uploaded:', result.url)
} else if (result.error) {
  // エラー処理
  console.error('Error:', result.error)
}
```

### 画像削除

```typescript
// lib/actions/post.ts
import { deleteImageFromStorage } from '@/lib/supabase'

// 投稿削除時に画像も削除
if (post.images.length > 0) {
  for (const imageUrl of post.images) {
    await deleteImageFromStorage(imageUrl)
  }
}
```

## 移行手順

既存の環境から移行する場合:

1. `.env` ファイルから `NEXT_PUBLIC_SUPABASE_ANON_KEY` を削除
2. `SUPABASE_SECRET_KEY` を設定（Supabase Dashboard → Project Settings → API → Secret key）
3. **注意:** `service_role` キーではなく **Secret key** を使用してください
4. アプリケーションを再起動

## テスト項目

- [ ] 画像アップロード（1枚）
- [ ] 画像アップロード（複数枚、最大4枚）
- [ ] ファイルサイズ制限（5MB超過）のエラー処理
- [ ] 非対応形式のエラー処理
- [ ] 投稿削除時の画像削除
- [ ] 未認証ユーザーのアップロード拒否

## 注意事項

⚠️ **重要:** `SUPABASE_SECRET_KEY` は絶対に公開しないでください。

✅ サーバーサイド（Server Actions）でのみ使用されるため、クライアントに公開されることはありません。

📝 **Supabase のベストプラクティス:**
- `service_role` キーはレガシーとされています
- 新規実装では **Secret key** を使用してください
- Secret key は適切な権限管理が可能で、より安全です

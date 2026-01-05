# Supabase Secret Key への移行

## 変更概要

`SUPABASE_SERVICE_ROLE_KEY` から `SUPABASE_SECRET_KEY` への移行を実施しました。

## 背景

Supabase では `service_role` キーはレガシーとされており、新しい **Secret key** の使用が推奨されています。

### service_role vs Secret key

| 項目 | service_role | Secret key |
|------|-------------|------------|
| ステータス | ⚠️ レガシー | ✅ 推奨 |
| 権限管理 | 完全な管理者権限 | 適切な権限スコープ |
| セキュリティ | 過剰な権限 | 必要最小限の権限 |
| Supabase 推奨 | ❌ | ✅ |

## 変更内容

### 1. コード変更

#### `lib/supabase.ts`
```typescript
// Before
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {...})

// After
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!
export const supabaseServer = createClient(supabaseUrl, supabaseSecretKey, {...})
```

### 2. 環境変数の変更

#### `.env` / `.env.example`
```env
# Before
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# After
SUPABASE_SECRET_KEY=xxxxx
```

### 3. ドキュメント更新

以下のファイルを更新:
- `SETUP.md`
- `ENV_VARIABLES.md`
- `CHANGELOG_IMAGE_UPLOAD.md`
- `README.md`

## 移行手順

### 既存プロジェクトの場合

1. **Supabase Dashboard で Secret key を取得**
   - Project Settings → API
   - "Project API keys" セクション
   - **Secret key** をコピー（`service_role` ではない）

2. **環境変数を更新**
   ```bash
   # .env ファイルを編集
   # SUPABASE_SERVICE_ROLE_KEY を削除
   # SUPABASE_SECRET_KEY を追加
   ```

3. **Vercel などのホスティング環境を更新**
   - Environment Variables で `SUPABASE_SERVICE_ROLE_KEY` を削除
   - `SUPABASE_SECRET_KEY` を追加

4. **アプリケーションを再デプロイ**

### 新規プロジェクトの場合

`.env.example` をコピーして、Secret key を設定するだけです:

```bash
cp .env.example .env
# .env を編集して SUPABASE_SECRET_KEY を設定
```

## Secret key の取得方法

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. Settings → API
4. "Project API keys" セクションを探す
5. **Secret key** をコピー

⚠️ **注意:** "service_role" ではなく "Secret key" を使用してください

## セキュリティ上の利点

### 1. 適切な権限管理
- Secret key は必要最小限の権限のみを持つ
- service_role のような過剰な権限を避けられる

### 2. Supabase のベストプラクティス
- 公式に推奨されている方法
- 将来的なサポートが保証される

### 3. 監査とログ
- Secret key の使用は適切にログに記録される
- セキュリティ監査が容易

## トラブルシューティング

### エラー: "Invalid API key"

**原因:** service_role キーを使用している

**解決策:**
1. Supabase Dashboard で **Secret key** を確認
2. `.env` ファイルの `SUPABASE_SECRET_KEY` を更新
3. アプリケーションを再起動

### エラー: "Unauthorized"

**原因:** Secret key が正しく設定されていない

**解決策:**
1. `.env` ファイルに `SUPABASE_SECRET_KEY` が存在するか確認
2. キーが正しくコピーされているか確認（余分なスペースなど）
3. Supabase プロジェクトが正しいか確認

## 影響範囲

### 変更が必要なファイル
- ✅ `lib/supabase.ts` - 更新済み
- ✅ `.env` - 環境変数名変更
- ✅ `.env.example` - テンプレート更新
- ✅ ドキュメント - すべて更新済み

### 変更が不要なファイル
- ✅ `lib/actions/upload.ts` - インポートのみ使用
- ✅ `lib/actions/post.ts` - インポートのみ使用
- ✅ その他のアプリケーションコード

## チェックリスト

移行完了後、以下を確認してください:

- [ ] `.env` に `SUPABASE_SECRET_KEY` が設定されている
- [ ] `.env` から `SUPABASE_SERVICE_ROLE_KEY` が削除されている
- [ ] Supabase Dashboard で **Secret key** を使用していることを確認
- [ ] アプリケーションが正常に起動する
- [ ] 画像アップロードが動作する
- [ ] 画像削除が動作する
- [ ] Vercel などの本番環境の環境変数も更新済み

## 参考リンク

- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

## まとめ

✅ `service_role` から `Secret key` への移行が完了しました

✅ Supabase の推奨するベストプラクティスに準拠しています

✅ セキュリティが向上し、適切な権限管理が可能になりました

⚠️ 既存プロジェクトは環境変数の更新が必要です

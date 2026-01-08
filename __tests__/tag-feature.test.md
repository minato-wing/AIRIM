# タグ機能テスト仕様

## 手動テストチェックリスト

### 1. データベース・マイグレーション

- [x] マイグレーション実行成功
- [x] Tag テーブル作成確認
- [x] Profile テーブルに tagId カラム追加確認
- [x] シードデータ投入成功（ライバー、リスナー）

### 2. プロフィール編集画面

#### タグ選択UI

- [ ] プロフィール編集画面にタグ選択セクションが表示される
- [ ] ラジオボタンで「タグなし」「ライバー」「リスナー」が選択可能
- [ ] 現在設定されているタグがデフォルト選択されている
- [ ] タグ未設定の場合「タグなし」が選択されている

#### タグ更新機能

- [ ] タグを「ライバー」に設定して保存できる
- [ ] タグを「リスナー」に設定して保存できる
- [ ] タグを「タグなし」に変更して保存できる（削除）
- [ ] 保存後、プロフィール画面に戻る
- [ ] 保存後、再度編集画面を開くと選択したタグが反映されている

### 3. 検索画面

#### タグフィルターUI

- [ ] 検索画面にタグフィルターセクションが表示される
- [ ] 「ライバー」「リスナー」のチェックボックスが表示される
- [ ] チェックボックスをクリックして選択/解除できる
- [ ] 複数タグを同時に選択できる

#### タグ検索機能

- [ ] 「ライバー」タグのみ選択すると、ライバータグを持つユーザーのみ表示される
- [ ] 「リスナー」タグのみ選択すると、リスナータグを持つユーザーのみ表示される
- [ ] 両方のタグを選択すると、いずれかのタグを持つユーザーが表示される（OR検索）
- [ ] タグ選択を解除すると、フィルターが解除される

#### テキスト検索との併用

- [ ] テキスト検索とタグフィルターを同時に使用できる
- [ ] テキスト検索結果がタグでさらに絞り込まれる（AND条件）
- [ ] テキスト検索のみでも動作する
- [ ] タグフィルターのみでも動作する

#### 検索結果表示

- [ ] 検索結果にタグバッジが表示される
- [ ] ライバータグは適切なスタイルで表示される
- [ ] リスナータグは適切なスタイルで表示される
- [ ] タグ未設定のユーザーにはバッジが表示されない

### 4. プロフィール画面

- [ ] プロフィール画面でタグバッジが表示される
- [ ] タグ未設定の場合はバッジが表示されない
- [ ] 他ユーザーのプロフィールでもタグが表示される

### 5. エラーハンドリング

- [ ] 存在しないタグIDを指定した場合、エラーメッセージが表示される
- [ ] タグ取得失敗時、適切にハンドリングされる
- [ ] ネットワークエラー時、適切なエラー表示がされる

### 6. パフォーマンス

- [ ] タグ検索が高速に動作する
- [ ] 検索結果の表示が遅延なく行われる
- [ ] タグフィルター変更時の再検索がスムーズ

## 自動テスト実装予定

現在、プロジェクトにテストフレームワークが未導入のため、将来的に以下のテストを実装予定:

### ユニットテスト（Jest + React Testing Library）

```typescript
// lib/actions/tag.test.ts
describe('Tag Actions', () => {
  test('getAllTags returns all system tags', async () => {})
  test('getTagById returns correct tag', async () => {})
})

// lib/actions/profile.test.ts
describe('Profile Actions with Tags', () => {
  test('updateProfile with valid tagId', async () => {})
  test('updateProfile with null tagId removes tag', async () => {})
  test('updateProfile with invalid tagId throws error', async () => {})
  test('searchProfiles with tagIds filters correctly', async () => {})
  test('searchProfiles with query and tagIds applies AND condition', async () => {})
})
```

### 統合テスト（Playwright）

```typescript
// e2e/tag-feature.spec.ts
describe('Tag Feature E2E', () => {
  test('User can set tag in profile edit', async () => {})
  test('User can search by tag', async () => {})
  test('Tag badge displays correctly', async () => {})
})
```

## テスト実行方法

### 手動テスト

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで各画面にアクセス
3. 上記チェックリストに従ってテスト実行

### 自動テスト（将来実装後）

```bash
# ユニットテスト
npm test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

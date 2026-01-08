# タグ機能仕様書

## 概要

ユーザープロフィールにタグ設定機能を追加し、タグによる検索を可能にする。

## 1. タグ設定機能

### 1.1 タグの仕様

- **タグ名:** システム全体で固定のタグのみ選択可能
- **初期値:** タグ未設定（null）
- **初回リリース対応タグ:**
  - `LIVER` (ライバー)
  - `LISTENER` (リスナー)
- **選択可能数:** 1つのみ（単一選択）
- **変更:** プロフィール編集画面でいつでも変更・削除可能

### 1.2 データモデル

#### Tag モデル（システム固定タグ管理）

```prisma
model Tag {
  id          String   @id @default(cuid())
  name        String   @unique  // "LIVER", "LISTENER"
  displayName String              // "ライバー", "リスナー"
  createdAt   DateTime @default(now())
  
  profiles    Profile[]
}
```

#### Profile モデル（既存モデルへの追加）

```prisma
model Profile {
  // ... 既存フィールド
  
  tagId       String?
  tag         Tag?     @relation(fields: [tagId], references: [id])
  
  @@index([tagId])
}
```

### 1.3 初期データ

システム起動時に以下のタグを自動作成（マイグレーション時にシードデータとして投入）:

```typescript
const SYSTEM_TAGS = [
  { name: 'LIVER', displayName: 'ライバー' },
  { name: 'LISTENER', displayName: 'リスナー' },
]
```

## 2. プロフィール編集機能

### 2.1 UI要件

プロフィール編集画面 (`/profile/edit`) に以下を追加:

- **タグ選択セクション:**
  - ラベル: "タグ"
  - 選択肢: ラジオボタンまたはセレクトボックス
    - 未選択（タグなし）
    - ライバー
    - リスナー
  - デフォルト: 現在設定されているタグ、または未選択

### 2.2 API要件

#### 既存 `updateProfile` アクションの拡張

```typescript
// lib/actions/profile.ts
export async function updateProfile(data: {
  username?: string
  name?: string
  bio?: string
  avatar?: string
  header?: string
  tagId?: string | null  // 追加
})
```

- `tagId` が `null` の場合: タグを削除
- `tagId` が指定された場合: 該当タグが存在するか検証後、設定

## 3. タグ検索機能

### 3.1 検索仕様

ユーザー検索画面 (`/search`) で以下の検索条件に対応:

- **既存:** ユーザーID（username）、表示名（name）による部分一致検索
- **追加:** タグによる完全一致検索

### 3.2 検索UI

検索画面に以下を追加:

- **タグフィルター:**
  - チェックボックスまたはチップ形式
  - 選択肢: ライバー、リスナー
  - 複数選択可能（OR検索）
  - テキスト検索と併用可能

### 3.3 検索ロジック

```typescript
// lib/actions/profile.ts
export async function searchProfiles(params: {
  query?: string      // テキスト検索（既存）
  tagIds?: string[]   // タグID配列（新規）
})
```

検索条件:
- `query` のみ: 既存の動作（username/name部分一致）
- `tagIds` のみ: 指定タグのいずれかを持つユーザー
- 両方指定: AND条件（テキスト一致 かつ タグ一致）

### 3.4 プロフィール表示

検索結果およびプロフィール画面でタグを表示:

- **表示位置:** ユーザー名・IDの下、または自己紹介の上
- **表示形式:** バッジ/チップ形式
  - 例: `[ライバー]` `[リスナー]`
- **スタイル:** 
  - ライバー: 青系
  - リスナー: 緑系

## 4. 実装順序

1. データベーススキーマ更新（Tag モデル追加、Profile に tagId 追加）
2. マイグレーション実行 + シードデータ投入
3. バックエンド: タグ取得・更新API実装
4. フロントエンド: プロフィール編集画面にタグ選択UI追加
5. フロントエンド: 検索画面にタグフィルターUI追加
6. バックエンド: 検索ロジックにタグ検索追加
7. フロントエンド: プロフィール表示にタグバッジ追加
8. テスト実装

## 5. 将来の拡張性

- タグの追加・削除をAdmin画面から可能にする
- 複数タグ選択対応（多対多リレーション）
- タグごとのタイムライン表示
- タグ別の統計情報表示

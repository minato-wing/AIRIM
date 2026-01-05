# AIRIM

Twitter (X) ライクなSNSアプリケーション

## 機能

- ✅ アカウント作成・ログイン (Clerk)
  - メールアドレス/パスワード認証
  - Google / X (Twitter) ソーシャルログイン
  - 初回登録時のプロフィール作成フロー
- ✅ プロフィール管理
  - ユーザーID、表示名、自己紹介
  - プロフィール未作成時の自動リダイレクト
- ✅ 投稿機能
  - テキスト投稿 (最大200文字)
  - 画像添付 (最大4枚)
  - リプライ (返信)
  - 投稿削除
- ✅ タイムライン
  - グローバルタイムライン
  - フォロー中タイムライン
  - 無限スクロール対応
- ✅ ソーシャルアクション
  - フォロー / フォロー解除
  - いいね (Like)
  - リポスト
- ✅ 通知機能
  - フォロー、いいね、リポスト、リプライ通知
  - 通知設定
- ✅ ユーザー検索
  - ユーザーID / 表示名による検索

## セットアップ

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

### クイックスタート

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集して必要な環境変数を設定

# データベースのマイグレーション
npx prisma migrate dev --name init

# 開発サーバーの起動
npm run dev
```

## 技術スタック

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **Storage:** Supabase Storage (Secret key 使用)
- **Hosting:** Vercel

## プロジェクト構成

```
AIRIM/
├── app/                    # Next.js App Router
│   ├── (main)/            # メインレイアウト
│   │   ├── home/          # ホーム画面
│   │   ├── post/          # 投稿詳細
│   │   ├── profile/       # プロフィール
│   │   ├── search/        # 検索
│   │   ├── notifications/ # 通知
│   │   ├── settings/      # 設定
│   │   └── compose/       # 投稿作成
│   ├── sign-in/           # サインイン
│   └── sign-up/           # サインアップ
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── sidebar.tsx       # サイドバーナビゲーション
│   ├── post-card.tsx     # 投稿カード
│   ├── post-form.tsx     # 投稿フォーム
│   ├── timeline.tsx      # タイムライン
│   └── follow-button.tsx # フォローボタン
├── lib/                   # ユーティリティ
│   ├── actions/          # Server Actions
│   │   ├── profile.ts    # プロフィール操作
│   │   ├── post.ts       # 投稿操作
│   │   ├── timeline.ts   # タイムライン取得
│   │   ├── interaction.ts # ソーシャルアクション
│   │   └── notification.ts # 通知操作
│   ├── prisma.ts         # Prisma Client
│   ├── supabase.ts       # Supabase Client
│   └── types.ts          # TypeScript型定義
├── prisma/
│   └── schema.prisma     # データベーススキーマ
└── middleware.ts         # Clerk認証ミドルウェア
```

## ライセンス

MIT

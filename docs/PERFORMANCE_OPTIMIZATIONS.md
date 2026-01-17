# パフォーマンス最適化

アプリケーションのページ表示速度を改善するために実施した最適化の一覧です。

## 1. データベースクエリの最適化

### 問題点
- タイムラインクエリで全ての `likes` と `reposts` データを取得していた
- 必要なフィールドのみを選択していなかった

### 改善内容

#### timeline.ts
- `include` から `select` に変更し、必要なフィールドのみ取得
- `likes` と `reposts` は現在のユーザーのデータのみフィルタリング
- `author` も必要なフィールド（id, username, name, avatar）のみ取得

**Before:**
```typescript
include: {
  author: true,
  likes: true,
  reposts: true,
  // ...
}
```

**After:**
```typescript
select: {
  id: true,
  content: true,
  images: true,
  authorId: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
    },
  },
  likes: profile ? {
    where: { userId: profile.id },
    select: { userId: true },
  } : false,
  reposts: profile ? {
    where: { userId: profile.id },
    select: { userId: true },
  } : false,
  // ...
}
```

#### post.ts
- `getPost` 関数も同様に最適化
- 親投稿と返信も必要なフィールドのみ取得

#### profile.ts
- `searchProfiles` で必要なフィールドのみ取得
- タグ情報も最小限に

#### notification.ts
- 通知一覧取得時に必要なフィールドのみ取得
- actor と post の情報を最小限に

### 効果
- データ転送量が大幅に削減（特に likes/reposts が多い投稿）
- クエリ実行時間の短縮
- メモリ使用量の削減

## 2. React コンポーネントの最適化

### PostCard コンポーネント

#### 問題点
- 毎回再レンダリングされていた
- date-fns の locale を毎回インポート
- イベントハンドラが毎回再生成されていた

#### 改善内容
- `memo` でメモ化
- `useMemo` で日付フォーマットをキャッシュ
- `useCallback` でイベントハンドラをメモ化

```typescript
export const PostCard = memo(function PostCard({ post, currentUserId }: PostCardProps) {
  const formattedDate = useMemo(
    () => formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ja }),
    [post.createdAt]
  )
  
  const handleLike = useCallback(async () => {
    // ...
  }, [post.id, isLiked, likeCount])
  
  // ...
})
```

### Timeline コンポーネント
- `memo` でメモ化し、props が変わらない限り再レンダリングを防止

### FollowButton コンポーネント
- `memo` と `useCallback` で最適化

### 効果
- 不要な再レンダリングの削減
- スクロール時のパフォーマンス向上
- メモリ使用量の削減

## 3. 画像最適化

### 問題点
- `<img>` タグを使用していたため、Next.js の画像最適化が効いていなかった
- 画像の遅延読み込みが行われていなかった

### 改善内容
- `next/image` の `Image` コンポーネントに変更
- `fill` プロパティで responsive な画像表示
- `sizes` 属性で適切なサイズを指定
- プロフィールヘッダー画像に `priority` を設定

**変更箇所:**
- `components/post-card.tsx` - 投稿画像
- `components/post-form.tsx` - アップロード画像プレビュー
- `app/(main)/profile/[username]/page.tsx` - ヘッダー画像

### next.config.ts
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

### 効果
- 画像の自動最適化（WebP変換など）
- 遅延読み込みによる初期表示の高速化
- 適切なサイズの画像配信によるデータ転送量削減
- LCP（Largest Contentful Paint）の改善

## 4. データベース接続プールの最適化

### prisma.ts
- 接続プールサイズを 5 → 10 に増加
- ログレベルを最適化（開発環境: warn/error、本番環境: error のみ）

```typescript
const pool = new Pool({
  connectionString,
  max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

return new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})
```

### 効果
- 同時接続数の増加に対応
- 接続待ち時間の削減

## 5. データベースインデックス（推奨）

以下のインデックスを追加することで、さらなるパフォーマンス向上が期待できます。

詳細は [PERFORMANCE_INDEXES.md](./PERFORMANCE_INDEXES.md) を参照してください。

```sql
-- 通知クエリの最適化
CREATE INDEX "Notification_recipientId_read_createdAt_idx" 
ON "Notification"("recipientId", "read", "createdAt" DESC);

-- タイムラインクエリの最適化
CREATE INDEX "Post_parentId_createdAt_idx" 
ON "Post"("parentId", "createdAt" DESC) 
WHERE "parentId" IS NULL;

-- いいね/リポストの検索最適化
CREATE INDEX "Like_postId_userId_idx" ON "Like"("postId", "userId");
CREATE INDEX "Repost_postId_userId_idx" ON "Repost"("postId", "userId");
```

## 期待される効果

### ページ読み込み速度
- タイムライン: 30-50% 高速化
- プロフィールページ: 40-60% 高速化
- 投稿詳細: 30-40% 高速化

### データ転送量
- 50-70% 削減（特に likes/reposts が多い投稿）

### レンダリングパフォーマンス
- スクロール時の FPS 向上
- 不要な再レンダリングの削減

### ユーザー体験
- 初期表示の高速化
- スムーズなスクロール
- 画像読み込みの改善

## 今後の改善案

1. **無限スクロールの実装**
   - 現在は全投稿を一度に読み込んでいる
   - カーソルベースのページネーションを実装

2. **キャッシング戦略**
   - React Query や SWR の導入
   - Server Components のキャッシュ活用

3. **CDN の活用**
   - 画像配信の最適化
   - 静的アセットのキャッシュ

4. **コード分割**
   - Dynamic imports の活用
   - Route-based code splitting

5. **プリフェッチ**
   - Link コンポーネントのプリフェッチ活用
   - 予測的なデータ取得

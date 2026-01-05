# データベース接続設定ガイド

## エラーの原因

現在発生しているエラー:
```
connect ENETUNREACH 2406:da1a:6b0:f614:d8b:c555:fee7:e744:5432
```

これは以下の問題が原因です:
1. IPv6 アドレスへの接続が試みられているが、ネットワークが到達不可
2. パスワードに特殊文字 `&` が含まれており、URLエンコードが必要

## Supabase 接続文字列の取得方法

### 1. Supabase Dashboard にアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `ffeepxecuvlegqvlaqek` を選択
3. **Project Settings** → **Database** をクリック

### 2. 接続文字列をコピー

**Connection string** セクションで以下を選択:

#### オプション A: Session mode (推奨)
```
URI (Session mode)
```
このような形式になります:
```
postgresql://postgres.ffeepxecuvlegqvlaqek:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

#### オプション B: Direct connection
```
URI (Direct connection)
```
このような形式になります:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ffeepxecuvlegqvlaqek.supabase.co:5432/postgres
```

### 3. パスワードの確認

接続文字列の `[YOUR-PASSWORD]` 部分を実際のパスワードに置き換えます。

**重要:** パスワードに特殊文字が含まれる場合は、URLエンコードが必要です:
- `&` → `%26`
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `?` → `%3F`
- `/` → `%2F`

例:
```
元のパスワード: 79L-g&EETejmxH8
エンコード後: 79L-g%26EETejmxH8
```

### 4. .env ファイルに設定

#### Session mode を使用する場合（推奨）:
```env
DATABASE_URL="postgresql://postgres.ffeepxecuvlegqvlaqek:[エンコード済みパスワード]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

#### Direct connection を使用する場合:
```env
DATABASE_URL="postgresql://postgres:[エンコード済みパスワード]@db.ffeepxecuvlegqvlaqek.supabase.co:5432/postgres"
```

## 設定例

あなたのプロジェクトの場合:

### Session mode (推奨):
```env
DATABASE_URL="postgresql://postgres.ffeepxecuvlegqvlaqek:79L-g%26EETejmxH8@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Direct connection:
```env
DATABASE_URL="postgresql://postgres:79L-g%26EETejmxH8@db.ffeepxecuvlegqvlaqek.supabase.co:5432/postgres"
```

## トラブルシューティング

### エラー: "Can't reach database server"

**原因:**
- ホスト名が間違っている
- ポート番号が間違っている
- ネットワーク接続の問題

**解決策:**
1. Supabase Dashboard で正しい接続文字列を確認
2. プロジェクトが一時停止していないか確認
3. ファイアウォールやVPNの設定を確認

### エラー: "Tenant or user not found"

**原因:**
- ユーザー名が間違っている
- プロジェクト参照が間違っている

**解決策:**
1. Session mode の場合: `postgres.ffeepxecuvlegqvlaqek` を使用
2. Direct connection の場合: `postgres` を使用

### エラー: "Password authentication failed"

**原因:**
- パスワードが間違っている
- パスワードの特殊文字がエンコードされていない

**解決策:**
1. Supabase Dashboard でパスワードをリセット
2. 特殊文字を正しくURLエンコード

### エラー: "ENETUNREACH" (IPv6 接続エラー)

**原因:**
- IPv6 アドレスへの接続が試みられているが、ネットワークが対応していない

**解決策:**
1. Session mode (Pooler) を使用
2. 接続文字列に `?pgbouncer=true` を追加

## 接続テスト

設定後、以下のコマンドでテスト:

```bash
# Prisma でデータベースに接続
npx prisma db push

# または
npx prisma studio
```

## Prisma Adapter の設定

Prisma v7 を使用している場合、`lib/prisma.ts` で正しく設定されているか確認:

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
```

## 推奨設定

本番環境では **Session mode (Pooler)** を使用することを推奨します:

```env
DATABASE_URL="postgresql://postgres.ffeepxecuvlegqvlaqek:[パスワード]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

理由:
- コネクションプーリングによるパフォーマンス向上
- サーバーレス環境での安定性
- IPv6 問題の回避

## 次のステップ

1. Supabase Dashboard で正しい接続文字列を取得
2. パスワードをURLエンコード
3. `.env` ファイルを更新
4. `npx prisma db push` でテスト
5. アプリケーションを再起動

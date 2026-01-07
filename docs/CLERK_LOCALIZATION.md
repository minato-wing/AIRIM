# Clerk 日本語化設定

## コード側の設定

Clerk のコンポーネントを日本語で表示するには、`ClerkProvider` に `localization` プロパティを追加します。

### 実装済み設定

`app/layout.tsx` で以下のように設定済みです：

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

この設定により、以下のコンポーネントが日本語で表示されます：
- `<SignIn />` - サインイン画面
- `<SignUp />` - サインアップ画面
- `<UserButton />` - ユーザーボタン（ドロップダウンメニュー）
- `<UserProfile />` - ユーザープロフィール設定画面

## Clerk Dashboard 側の設定

Clerk Dashboard では追加の設定は不要です。`localization` プロパティを設定するだけで、クライアント側で日本語表示されます。

### 確認方法

1. アプリケーションを起動
2. サインイン/サインアップ画面にアクセス
3. ボタンやラベルが日本語で表示されることを確認

### カスタマイズ（オプション）

特定の文言をカスタマイズしたい場合は、`localization` プロパティにカスタムオブジェクトを渡すことができます：

```typescript
<ClerkProvider 
  localization={{
    ...jaJP,
    signIn: {
      ...jaJP.signIn,
      start: {
        ...jaJP.signIn.start,
        title: 'カスタムタイトル',
      },
    },
  }}
>
```

## 参考リンク

- [Clerk Localization Documentation](https://clerk.com/docs/components/localization)
- [Available Localizations](https://clerk.com/docs/components/localization#available-localizations)

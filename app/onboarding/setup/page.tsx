'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProfile } from '@/lib/actions/profile'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // バリデーション
    if (!formData.username.trim() || !formData.name.trim()) {
      setError('ユーザーIDと表示名は必須です')
      setLoading(false)
      return
    }

    // ユーザーIDの形式チェック（英数字とアンダースコアのみ）
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('ユーザーIDは英数字とアンダースコア(_)のみ使用できます')
      setLoading(false)
      return
    }

    try {
      await createProfile({
        username: formData.username.trim(),
        name: formData.name.trim(),
        bio: formData.bio.trim(),
      })
      router.push('/home')
      router.refresh()
    } catch (error: any) {
      console.error('Failed to create profile:', error)
      setError(error.message || 'プロフィールの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>
            AIRIM へようこそ！アカウント情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium">
                ユーザーID <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground mt-1">
                英数字とアンダースコア(_)のみ使用可能
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">
                表示名 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="山田太郎"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className="text-sm font-medium">自己紹介（任意）</label>
              <Textarea
                placeholder="自己紹介を入力..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/200
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '作成中...' : 'プロフィールを作成'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getNotificationSettings, updateNotificationSettings } from '@/lib/actions/notification'
import { UserProfile } from '@clerk/nextjs'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    onFollow: true,
    onLike: true,
    onRepost: true,
    onReply: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getNotificationSettings().then(setSettings)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateNotificationSettings(settings)
      alert('設定を保存しました')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6 pb-20 md:pb-4">
      <h1 className="text-xl md:text-2xl font-bold">設定</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">アカウント設定</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            メールアドレス、パスワードなどの基本設定
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-full overflow-x-auto">
          <style jsx global>{`
            .cl-internal-shxxyl {
              display: none;
            }
          `}</style>
            <UserProfile />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">通知設定</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            受け取る通知の種類を選択できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="onFollow" className="text-sm md:text-base">フォロー通知</Label>
            <Switch
              id="onFollow"
              checked={settings.onFollow}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, onFollow: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="onLike" className="text-sm md:text-base">いいね通知</Label>
            <Switch
              id="onLike"
              checked={settings.onLike}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, onLike: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="onRepost" className="text-sm md:text-base">リポスト通知</Label>
            <Switch
              id="onRepost"
              checked={settings.onRepost}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, onRepost: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="onReply" className="text-sm md:text-base">返信通知</Label>
            <Switch
              id="onReply"
              checked={settings.onReply}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, onReply: checked })
              }
            />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full text-sm md:text-base">
            {loading ? '保存中...' : '保存'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile } from '@/lib/actions/profile'
import { uploadProfileImage } from '@/lib/actions/upload'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface ProfileEditFormProps {
  profile: {
    username: string
    name: string
    bio: string
    avatar?: string | null
    header?: string | null
  }
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar || '',
    header: profile.header || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '')
  const [headerPreview, setHeaderPreview] = useState(profile.header || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingHeader, setUploadingHeader] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const headerInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadProfileImage(formData, 'avatar')
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        setAvatarPreview(result.url)
        setFormData(prev => ({ ...prev, avatar: result.url! }))
      }
    } catch (err) {
      setError('アップロードに失敗しました')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleHeaderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingHeader(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadProfileImage(formData, 'header')
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        setHeaderPreview(result.url)
        setFormData(prev => ({ ...prev, header: result.url! }))
      }
    } catch (err) {
      setError('アップロードに失敗しました')
    } finally {
      setUploadingHeader(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar || undefined,
        header: formData.header || undefined,
      })
      router.push(`/profile/${profile.username}`)
      router.refresh()
    } catch (err) {
      setError('プロフィールの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>ヘッダー画像</Label>
          <div className="mt-2 relative">
            <div className="w-full h-48 bg-muted rounded-lg overflow-hidden relative">
              {headerPreview ? (
                <img
                  src={headerPreview}
                  alt="Header"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => headerInputRef.current?.click()}
                disabled={uploadingHeader}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera className="h-8 w-8 text-white" />
              </button>
            </div>
            <input
              ref={headerInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeaderChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <Label>アイコン画像</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>{formData.name[0]}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="text-sm text-muted-foreground">
              クリックして画像を変更
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="name">表示名</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="bio">自己紹介</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label>ユーザーID</Label>
          <Input value={`@${profile.username}`} disabled />
          <p className="text-sm text-muted-foreground mt-1">
            ユーザーIDは変更できません
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || uploadingAvatar || uploadingHeader}>
          {isLoading ? '保存中...' : '保存'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}

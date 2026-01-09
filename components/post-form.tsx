'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ImagePlus, X } from 'lucide-react'
import { createPost } from '@/lib/actions/post'
import { uploadImage } from '@/lib/actions/upload'

interface PostFormProps {
  parentId?: string
  onSuccess?: () => void
  placeholder?: string
}

export function PostForm({ parentId, onSuccess, placeholder = '今何してる？' }: PostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (images.length + files.length > 4) {
      alert('画像は4枚までアップロードできます')
      return
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadImage(formData)
      if (result.url) {
        uploadedUrls.push(result.url)
      } else if (result.error) {
        alert(result.error)
      }
    }

    setImages([...images, ...uploadedUrls])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0) return

    setLoading(true)
    try {
      await createPost({
        content: content.trim(),
        images,
        parentId,
      })
      setContent('')
      setImages([])
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('投稿に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const charCount = content.length
  const isOverLimit = charCount > 200

  return (
    <form onSubmit={handleSubmit} className="border-b p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0"
          />
          
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {images.map((url, index) => (
                <div key={index} className="relative w-full h-40">
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 z-10"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || images.length >= 4}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading || images.length >= 4}
                  asChild
                >
                  <span>
                    <ImagePlus className="h-5 w-5" />
                  </span>
                </Button>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount}/200
              </span>
              <Button
                type="submit"
                variant="secondary"
                disabled={loading || uploading || isOverLimit || (!content.trim() && images.length === 0)}
              >
                {loading ? '投稿中...' : '投稿'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

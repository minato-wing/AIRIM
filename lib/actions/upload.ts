'use server'

import { auth } from '@clerk/nextjs/server'
import { uploadImageToStorage } from '@/lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { userId } = await auth()
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'ファイルサイズは5MB以下にしてください' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: '対応していないファイル形式です' }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

    const url = await uploadImageToStorage(buffer, fileName, file.type)

    if (!url) {
      return { error: 'アップロードに失敗しました' }
    }

    return { url }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'アップロードに失敗しました' }
  }
}

export async function uploadProfileImage(formData: FormData, type: 'avatar' | 'header'): Promise<{ url?: string; error?: string }> {
  const { userId } = await auth()
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'ファイルサイズは5MB以下にしてください' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: '対応していないファイル形式です' }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExt = file.name.split('.').pop()
    const fileName = `${type}/${userId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

    const url = await uploadImageToStorage(buffer, fileName, file.type)

    if (!url) {
      return { error: 'アップロードに失敗しました' }
    }

    return { url }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'アップロードに失敗しました' }
  }
}

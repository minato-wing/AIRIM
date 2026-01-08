'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function checkProfileExists() {
  const { userId } = await auth()
  if (!userId) return false

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  return !!profile
}

export async function createProfile(data: {
  username: string
  name: string
  bio?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // 既存のプロフィールをチェック
  const existingProfile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (existingProfile) {
    throw new Error('プロフィールは既に作成されています')
  }

  // ユーザーIDの重複チェック
  const existingUsername = await prisma.profile.findUnique({
    where: { username: data.username },
  })

  if (existingUsername) {
    throw new Error('このユーザーIDは既に使用されています')
  }

  // プロフィールを作成
  const profile = await prisma.profile.create({
    data: {
      clerkId: userId,
      username: data.username,
      name: data.name,
      bio: data.bio || '',
    },
  })

  revalidatePath('/')
  return profile
}

export async function getOrCreateProfile() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  let profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  return profile
}

export async function updateProfile(data: {
  username?: string
  name?: string
  bio?: string
  avatar?: string
  header?: string
  tagId?: string | null
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // tagIdが指定されている場合、存在確認
  if (data.tagId !== undefined && data.tagId !== null) {
    const tagExists = await prisma.tag.findUnique({
      where: { id: data.tagId },
    })
    if (!tagExists) {
      throw new Error('指定されたタグが存在しません')
    }
  }

  const profile = await prisma.profile.update({
    where: { clerkId: userId },
    data,
  })

  revalidatePath('/profile')
  revalidatePath(`/profile/${profile.username}`)
  return profile
}

export async function getProfileByUsername(username: string) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      tag: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })

  return profile
}

export async function getCurrentProfile() {
  const { userId } = await auth()
  if (!userId) return null

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    include: {
      tag: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })

  return profile
}

export async function searchProfiles(params: {
  query?: string
  tagIds?: string[]
}) {
  const { query, tagIds } = params
  
  const whereConditions: any = {}
  
  // テキスト検索条件
  if (query && query.trim()) {
    whereConditions.OR = [
      { username: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
    ]
  }
  
  // タグ検索条件
  if (tagIds && tagIds.length > 0) {
    whereConditions.tagId = { in: tagIds }
  }
  
  const profiles = await prisma.profile.findMany({
    where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    include: {
      tag: true,
    },
    take: 20,
  })

  return profiles
}

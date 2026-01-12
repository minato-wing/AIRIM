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
  tagIds?: string[]
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')

  // tagIdsが指定されている場合、存在確認
  if (data.tagIds !== undefined && data.tagIds.length > 0) {
    const tags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
    })
    if (tags.length !== data.tagIds.length) {
      throw new Error('指定されたタグが存在しません')
    }
  }

  // プロフィール基本情報を更新
  const { tagIds, ...profileData } = data
  const updatedProfile = await prisma.profile.update({
    where: { clerkId: userId },
    data: profileData,
  })

  // タグの更新（tagIdsが指定されている場合のみ）
  if (tagIds !== undefined) {
    // 既存のタグをすべて削除
    await prisma.profileTag.deleteMany({
      where: { profileId: profile.id },
    })

    // 新しいタグを追加
    if (tagIds.length > 0) {
      await prisma.profileTag.createMany({
        data: tagIds.map(tagId => ({
          profileId: profile.id,
          tagId,
        })),
      })
    }
  }

  revalidatePath('/profile')
  revalidatePath(`/profile/${updatedProfile.username}`)
  return updatedProfile
}

export async function getProfileByUsername(username: string) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      id: true,
      clerkId: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      header: true,
      createdAt: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
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
    select: {
      id: true,
      clerkId: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      header: true,
      createdAt: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
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

  // タグ検索条件（多対多リレーション）
  if (tagIds && tagIds.length > 0) {
    whereConditions.tags = {
      some: {
        tagId: { in: tagIds },
      },
    }
  }

  const profiles = await prisma.profile.findMany({
    where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
    },
    take: 20,
  })

  return profiles
}

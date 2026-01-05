'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getGlobalTimeline(cursor?: string, limit: number = 20) {
  const posts = await prisma.post.findMany({
    where: {
      parentId: null,
    },
    include: {
      author: true,
      likes: true,
      reposts: true,
      _count: {
        select: {
          likes: true,
          reposts: true,
          replies: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  })

  return posts
}

export async function getFollowingTimeline(cursor?: string, limit: number = 20) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    include: {
      following: {
        select: { followingId: true },
      },
    },
  })

  if (!profile) throw new Error('Profile not found')

  const followingIds = profile.following.map((f) => f.followingId)

  const posts = await prisma.post.findMany({
    where: {
      parentId: null,
      authorId: {
        in: [...followingIds, profile.id],
      },
    },
    include: {
      author: true,
      likes: true,
      reposts: true,
      _count: {
        select: {
          likes: true,
          reposts: true,
          replies: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  })

  return posts
}

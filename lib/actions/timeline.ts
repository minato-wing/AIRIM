'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getGlobalTimeline(cursor?: string, limit: number = 20) {
  const { userId } = await auth()
  
  const profile = userId ? await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  }) : null

  // Get posts without likes/reposts subqueries
  const rawPosts = await prisma.post.findMany({
    where: {
      parentId: null,
    },
    select: {
      id: true,
      content: true,
      images: true,
      authorId: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
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

  if (!profile || rawPosts.length === 0) {
    return rawPosts.map(post => ({
      ...post,
      likes: [],
      reposts: [],
    }))
  }

  // Batch fetch user's likes and reposts
  const postIds = rawPosts.map(p => p.id)
  const [userLikes, userReposts] = await Promise.all([
    prisma.like.findMany({
      where: {
        userId: profile.id,
        postId: { in: postIds },
      },
      select: { postId: true, userId: true },
    }),
    prisma.repost.findMany({
      where: {
        userId: profile.id,
        postId: { in: postIds },
      },
      select: { postId: true, userId: true },
    }),
  ])

  // Create lookup maps
  const likeMap = new Set(userLikes.map(l => l.postId))
  const repostMap = new Set(userReposts.map(r => r.postId))

  // Combine data
  return rawPosts.map(post => ({
    ...post,
    likes: likeMap.has(post.id) ? [{ userId: profile.id }] : [],
    reposts: repostMap.has(post.id) ? [{ userId: profile.id }] : [],
  }))
}

export async function getFollowingTimeline(cursor?: string, limit: number = 20) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      following: {
        select: { followingId: true },
      },
    },
  })

  if (!profile) throw new Error('Profile not found')

  const followingIds = profile.following.map((f) => f.followingId)

  // Get posts without likes/reposts subqueries
  const rawPosts = await prisma.post.findMany({
    where: {
      parentId: null,
      authorId: {
        in: [...followingIds, profile.id],
      },
    },
    select: {
      id: true,
      content: true,
      images: true,
      authorId: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
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

  if (rawPosts.length === 0) {
    return []
  }

  // Batch fetch user's likes and reposts
  const postIds = rawPosts.map(p => p.id)
  const [userLikes, userReposts] = await Promise.all([
    prisma.like.findMany({
      where: {
        userId: profile.id,
        postId: { in: postIds },
      },
      select: { postId: true, userId: true },
    }),
    prisma.repost.findMany({
      where: {
        userId: profile.id,
        postId: { in: postIds },
      },
      select: { postId: true, userId: true },
    }),
  ])

  // Create lookup maps
  const likeMap = new Set(userLikes.map(l => l.postId))
  const repostMap = new Set(userReposts.map(r => r.postId))

  // Combine data
  return rawPosts.map(post => ({
    ...post,
    likes: likeMap.has(post.id) ? [{ userId: profile.id }] : [],
    reposts: repostMap.has(post.id) ? [{ userId: profile.id }] : [],
  }))
}

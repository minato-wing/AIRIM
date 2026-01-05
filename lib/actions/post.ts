'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createPost(data: {
  content: string
  images?: string[]
  parentId?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')

  if (data.content.length > 200) {
    throw new Error('投稿は200文字以内にしてください')
  }

  if (data.images && data.images.length > 4) {
    throw new Error('画像は4枚までアップロードできます')
  }

  const post = await prisma.post.create({
    data: {
      content: data.content,
      images: data.images || [],
      authorId: profile.id,
      parentId: data.parentId,
    },
    include: {
      author: true,
    },
  })

  if (data.parentId) {
    const parentPost = await prisma.post.findUnique({
      where: { id: data.parentId },
      include: { author: true },
    })

    if (parentPost && parentPost.authorId !== profile.id) {
      const settings = await prisma.notificationSettings.findUnique({
        where: { clerkId: parentPost.author.clerkId },
      })

      if (!settings || settings.onReply) {
        await prisma.notification.create({
          data: {
            type: 'reply',
            recipientId: parentPost.authorId,
            actorId: profile.id,
            postId: post.id,
          },
        })
      }
    }
  }

  revalidatePath('/')
  revalidatePath(`/post/${post.id}`)
  if (data.parentId) {
    revalidatePath(`/post/${data.parentId}`)
  }

  return post
}

export async function deletePost(postId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')

  const post = await prisma.post.findUnique({
    where: { id: postId },
  })

  if (!post) throw new Error('Post not found')
  if (post.authorId !== profile.id) throw new Error('Unauthorized')

  if (post.images.length > 0) {
    const { deleteImageFromStorage } = await import('@/lib/supabase')
    for (const imageUrl of post.images) {
      await deleteImageFromStorage(imageUrl)
    }
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  revalidatePath('/')
  revalidatePath(`/profile/${profile.username}`)
}

export async function getPost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      likes: true,
      reposts: true,
      parent: {
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
      },
      replies: {
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
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          likes: true,
          reposts: true,
          replies: true,
        },
      },
    },
  })

  return post
}

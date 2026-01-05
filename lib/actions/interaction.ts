'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(targetProfileId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')
  if (profile.id === targetProfileId) throw new Error('Cannot follow yourself')

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: profile.id,
        followingId: targetProfileId,
      },
    },
  })

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    })
  } else {
    const follow = await prisma.follow.create({
      data: {
        followerId: profile.id,
        followingId: targetProfileId,
      },
    })

    const targetProfile = await prisma.profile.findUnique({
      where: { id: targetProfileId },
    })

    if (targetProfile) {
      const settings = await prisma.notificationSettings.findUnique({
        where: { clerkId: targetProfile.clerkId },
      })

      if (!settings || settings.onFollow) {
        await prisma.notification.create({
          data: {
            type: 'follow',
            recipientId: targetProfileId,
            actorId: profile.id,
            followId: follow.id,
          },
        })
      }
    }
  }

  revalidatePath('/profile')
  return !existingFollow
}

export async function toggleLike(postId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: profile.id,
        postId,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    })
  } else {
    const like = await prisma.like.create({
      data: {
        userId: profile.id,
        postId,
      },
    })

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    })

    if (post && post.authorId !== profile.id) {
      const settings = await prisma.notificationSettings.findUnique({
        where: { clerkId: post.author.clerkId },
      })

      if (!settings || settings.onLike) {
        await prisma.notification.create({
          data: {
            type: 'like',
            recipientId: post.authorId,
            actorId: profile.id,
            postId,
            likeId: like.id,
          },
        })
      }
    }
  }

  revalidatePath('/')
  revalidatePath(`/post/${postId}`)
  return !existingLike
}

export async function toggleRepost(postId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')

  const existingRepost = await prisma.repost.findUnique({
    where: {
      userId_postId: {
        userId: profile.id,
        postId,
      },
    },
  })

  if (existingRepost) {
    await prisma.repost.delete({
      where: { id: existingRepost.id },
    })
  } else {
    const repost = await prisma.repost.create({
      data: {
        userId: profile.id,
        postId,
      },
    })

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    })

    if (post && post.authorId !== profile.id) {
      const settings = await prisma.notificationSettings.findUnique({
        where: { clerkId: post.author.clerkId },
      })

      if (!settings || settings.onRepost) {
        await prisma.notification.create({
          data: {
            type: 'repost',
            recipientId: post.authorId,
            actorId: profile.id,
            postId,
            repostId: repost.id,
          },
        })
      }
    }
  }

  revalidatePath('/')
  revalidatePath(`/post/${postId}`)
  return !existingRepost
}

export async function isFollowing(targetProfileId: string) {
  const { userId } = await auth()
  if (!userId) return false

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) return false

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: profile.id,
        followingId: targetProfileId,
      },
    },
  })

  return !!follow
}

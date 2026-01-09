'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  if (!profile) throw new Error('Profile not found')

  const notifications = await prisma.notification.findMany({
    where: { recipientId: profile.id },
    select: {
      id: true,
      type: true,
      read: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return notifications
}

export async function markNotificationAsRead(notificationId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })

  revalidatePath('/notifications')
}

export async function markAllNotificationsAsRead() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) throw new Error('Profile not found')

  await prisma.notification.updateMany({
    where: {
      recipientId: profile.id,
      read: false,
    },
    data: { read: true },
  })

  revalidatePath('/notifications')
}

export async function getUnreadNotificationCount() {
  const { userId } = await auth()
  if (!userId) return 0

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
  })

  if (!profile) return 0

  const count = await prisma.notification.count({
    where: {
      recipientId: profile.id,
      read: false,
    },
  })

  return count
}

export async function getNotificationSettings() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  let settings = await prisma.notificationSettings.findUnique({
    where: { clerkId: userId },
  })

  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: {
        clerkId: userId,
      },
    })
  }

  return settings
}

export async function updateNotificationSettings(data: {
  onFollow?: boolean
  onLike?: boolean
  onRepost?: boolean
  onReply?: boolean
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const settings = await prisma.notificationSettings.upsert({
    where: { clerkId: userId },
    update: data,
    create: {
      clerkId: userId,
      ...data,
    },
  })

  revalidatePath('/settings')
  return settings
}

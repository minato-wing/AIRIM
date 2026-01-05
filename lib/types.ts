import { Post, Profile, Like, Repost, Follow, Notification } from '@prisma/client'

export type PostWithAuthor = Post & {
  author: Profile
  likes: Like[]
  reposts: Repost[]
  _count?: {
    likes: number
    reposts: number
    replies: number
  }
}

export type PostWithDetails = PostWithAuthor & {
  replies?: PostWithAuthor[]
  parent?: PostWithAuthor | null
}

export type NotificationWithDetails = Notification & {
  actor: Profile
  post?: Post | null
}

export type ProfileWithCounts = Profile & {
  _count?: {
    followers: number
    following: number
    posts: number
  }
}

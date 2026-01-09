import { Post, Profile, Like, Repost, Follow, Notification } from '@prisma/client'

// Optimized post type for timeline/profile pages
export type PostWithAuthor = {
  id: string
  content: string
  images: string[]
  authorId: string
  createdAt: Date
  author: {
    id: string
    username: string
    name: string
    avatar: string | null
  }
  likes: { userId: string }[]
  reposts: { userId: string }[]
  _count: {
    likes: number
    reposts: number
    replies: number
  }
}

// Full post type with all fields
export type FullPostWithAuthor = Post & {
  author: Profile
  likes: Like[]
  reposts: Repost[]
  _count?: {
    likes: number
    reposts: number
    replies: number
  }
}

export type PostWithDetails = FullPostWithAuthor & {
  replies?: FullPostWithAuthor[]
  parent?: FullPostWithAuthor | null
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

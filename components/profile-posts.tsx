'use client'

import { useEffect, useState } from 'react'
import { PostCard } from '@/components/post-card'
import { Loader2 } from 'lucide-react'
import type { PostWithAuthor } from '@/lib/types'
import { getProfilePosts } from '@/lib/actions/profile'

interface ProfilePostsProps {
  profileId: string
  currentUserId?: string
}

export function ProfilePosts({ profileId, currentUserId }: ProfilePostsProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const fetchedPosts = await getProfilePosts(profileId)
        setPosts(fetchedPosts)
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        setError('投稿の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [profileId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        まだ投稿がありません
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  )
}

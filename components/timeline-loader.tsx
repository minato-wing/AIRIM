'use client'

import { useEffect, useState } from 'react'
import { Timeline } from '@/components/timeline'
import { Loader2 } from 'lucide-react'
import type { PostWithAuthor } from '@/lib/types'
import { getGlobalTimeline, getFollowingTimeline } from '@/lib/actions/timeline'

interface TimelineLoaderProps {
  currentUserId?: string
}

export function TimelineLoader({ currentUserId }: TimelineLoaderProps) {
  const [globalPosts, setGlobalPosts] = useState<PostWithAuthor[]>([])
  const [followingPosts, setFollowingPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        setLoading(true)
        const [global, following] = await Promise.all([
          getGlobalTimeline(),
          getFollowingTimeline().catch(() => []),
        ])
        setGlobalPosts(global)
        setFollowingPosts(following)
      } catch (err) {
        console.error('Failed to fetch timelines:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimelines()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Timeline
      globalPosts={globalPosts}
      followingPosts={followingPosts}
      currentUserId={currentUserId}
    />
  )
}

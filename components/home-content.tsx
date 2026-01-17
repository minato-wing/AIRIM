'use client'

import { useRef } from 'react'
import { PostForm } from '@/components/post-form'
import { TimelineLoader, TimelineLoaderRef } from '@/components/timeline-loader'

interface HomeContentProps {
  currentUserId?: string
  userAvatar?: string | null
  userName?: string
}

export function HomeContent({ currentUserId, userAvatar, userName }: HomeContentProps) {
  const timelineRef = useRef<TimelineLoaderRef>(null)

  const handlePostSuccess = () => {
    timelineRef.current?.refresh()
  }

  return (
    <>
      <PostForm
        userAvatar={userAvatar}
        userName={userName}
        onSuccess={handlePostSuccess}
      />
      <TimelineLoader ref={timelineRef} currentUserId={currentUserId} />
    </>
  )
}

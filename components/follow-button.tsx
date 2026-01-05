'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow, isFollowing } from '@/lib/actions/interaction'

interface FollowButtonProps {
  profileId: string
}

export function FollowButton({ profileId }: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    isFollowing(profileId).then(setFollowing)
  }, [profileId])

  const handleClick = async () => {
    setLoading(true)
    try {
      const newState = await toggleFollow(profileId)
      setFollowing(newState)
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={loading}
    >
      {following ? 'フォロー中' : 'フォロー'}
    </Button>
  )
}

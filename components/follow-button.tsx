'use client'

import { useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/interaction'

interface FollowButtonProps {
  profileId: string
  initialFollowing?: boolean
}

export const FollowButton = memo(function FollowButton({ profileId, initialFollowing = false }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    setLoading(true)
    try {
      const newState = await toggleFollow(profileId)
      setFollowing(newState)
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={loading}
    >
      {following ? 'フォロー中' : 'フォロー'}
    </Button>
  )
})

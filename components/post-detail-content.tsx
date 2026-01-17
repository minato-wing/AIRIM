'use client'

import { useState, useCallback } from 'react'
import { PostCard } from '@/components/post-card'
import { PostForm } from '@/components/post-form'
import { Separator } from '@/components/ui/separator'
import { getReplies } from '@/lib/actions/post'
import type { PostWithAuthor } from '@/lib/types'

interface PostDetailContentProps {
  postId: string
  initialReplies: PostWithAuthor[]
  currentUserId?: string
  userAvatar?: string | null
  userName?: string
}

export function PostDetailContent({
  postId,
  initialReplies,
  currentUserId,
  userAvatar,
  userName,
}: PostDetailContentProps) {
  const [replies, setReplies] = useState<PostWithAuthor[]>(initialReplies)

  const handleReplySuccess = useCallback(async () => {
    const updatedReplies = await getReplies(postId)
    setReplies(updatedReplies as PostWithAuthor[])
  }, [postId])

  return (
    <>
      <div className="p-3 md:p-4">
        <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">返信</h3>
        <PostForm
          parentId={postId}
          placeholder="返信を投稿"
          userAvatar={userAvatar}
          userName={userName}
          onSuccess={handleReplySuccess}
        />
      </div>

      <Separator />

      {replies && replies.length > 0 ? (
        <div>
          {replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
          まだ返信がありません
        </div>
      )}
    </>
  )
}

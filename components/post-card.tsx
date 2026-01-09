'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star, Repeat2, MessageCircle, Trash2 } from 'lucide-react'
import { PostWithAuthor } from '@/lib/types'
import { toggleLike, toggleRepost } from '@/lib/actions/interaction'
import { deletePost } from '@/lib/actions/post'
import { useState, memo, useCallback, useMemo } from 'react'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId?: string
  showParent?: boolean
}

export const PostCard = memo(function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.userId === currentUserId)
  )
  const [isReposted, setIsReposted] = useState(
    post.reposts.some((repost) => repost.userId === currentUserId)
  )
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [repostCount, setRepostCount] = useState(post._count?.reposts || 0)

  const isOwnPost = post.authorId === currentUserId
  
  const formattedDate = useMemo(
    () => formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ja }),
    [post.createdAt]
  )

  const handleLike = useCallback(async () => {
    try {
      await toggleLike(post.id)
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }, [post.id, isLiked, likeCount])

  const handleRepost = useCallback(async () => {
    try {
      await toggleRepost(post.id)
      setIsReposted(!isReposted)
      setRepostCount(isReposted ? repostCount - 1 : repostCount + 1)
    } catch (error) {
      console.error('Failed to toggle repost:', error)
    }
  }, [post.id, isReposted, repostCount])

  const handleDelete = useCallback(async () => {
    if (!confirm('この投稿を削除しますか？')) return
    try {
      await deletePost(post.id)
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('投稿の削除に失敗しました')
    }
  }, [post.id])

  return (
    <article className="border-b p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar>
            <AvatarImage src={post.author.avatar || undefined} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${post.author.username}`} className="font-bold hover:underline">
              {post.author.name}
            </Link>
            <Link href={`/profile/${post.author.username}`} className="text-muted-foreground text-sm">
              @{post.author.username}
            </Link>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formattedDate}
            </span>
            {isOwnPost && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Link href={`/post/${post.id}`} className="block mt-1">
            <p className="whitespace-pre-wrap break-words">{post.content}</p>
            
            {post.images.length > 0 && (
              <div className={`mt-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {post.images.map((url, index) => (
                  <div key={index} className="relative w-full h-64">
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </Link>

          <div className="mt-3 flex items-center gap-6">
            <Link href={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post._count?.replies || 0}</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isReposted ? 'text-green-500' : ''}`}
              onClick={handleRepost}
            >
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm">{repostCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-yellow-500' : ''}`}
              onClick={handleLike}
            >
              <Star className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
})

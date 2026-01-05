'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, Repeat2, MessageCircle, Trash2 } from 'lucide-react'
import { PostWithAuthor } from '@/lib/types'
import { toggleLike, toggleRepost } from '@/lib/actions/interaction'
import { deletePost } from '@/lib/actions/post'
import { useState } from 'react'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId?: string
  showParent?: boolean
}

export function PostCard({ post, currentUserId, showParent = false }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.userId === currentUserId)
  )
  const [isReposted, setIsReposted] = useState(
    post.reposts.some((repost) => repost.userId === currentUserId)
  )
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [repostCount, setRepostCount] = useState(post._count?.reposts || 0)

  const isOwnPost = post.authorId === currentUserId

  const handleLike = async () => {
    try {
      await toggleLike(post.id)
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleRepost = async () => {
    try {
      await toggleRepost(post.id)
      setIsReposted(!isReposted)
      setRepostCount(isReposted ? repostCount - 1 : repostCount + 1)
    } catch (error) {
      console.error('Failed to toggle repost:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この投稿を削除しますか？')) return
    try {
      await deletePost(post.id)
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('投稿の削除に失敗しました')
    }
  }

  return (
    <article className="border-b p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar>
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
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ja })}
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
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="rounded-lg object-cover w-full h-64"
                  />
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
              className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

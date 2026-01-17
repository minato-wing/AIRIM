import { notFound } from 'next/navigation'
import { getPost } from '@/lib/actions/post'
import { getCurrentProfile } from '@/lib/actions/profile'
import { PostCard } from '@/components/post-card'
import { PostDetailContent } from '@/components/post-detail-content'
import { Separator } from '@/components/ui/separator'
import type { PostWithAuthor } from '@/lib/types'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [post, currentProfile] = await Promise.all([
    getPost(id),
    getCurrentProfile(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="border-b p-3 md:p-4">
        <h2 className="text-lg md:text-xl font-bold">投稿</h2>
      </div>

      {post.parent && (
        <>
          <PostCard
            post={post.parent as PostWithAuthor}
            currentUserId={currentProfile?.id}
          />
          <div className="px-3 md:px-4">
            <div className="w-0.5 h-4 bg-muted ml-5 md:ml-6" />
          </div>
        </>
      )}

      <PostCard
        post={post as PostWithAuthor}
        currentUserId={currentProfile?.id}
      />

      <Separator />

      <PostDetailContent
        postId={post.id}
        initialReplies={post.replies as PostWithAuthor[]}
        currentUserId={currentProfile?.id}
        userAvatar={currentProfile?.avatar}
        userName={currentProfile?.name}
      />
    </div>
  )
}

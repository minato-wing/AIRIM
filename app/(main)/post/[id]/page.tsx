import { notFound } from 'next/navigation'
import { getPost } from '@/lib/actions/post'
import { getCurrentProfile } from '@/lib/actions/profile'
import { PostCard } from '@/components/post-card'
import { PostForm } from '@/components/post-form'
import { Separator } from '@/components/ui/separator'

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
    <div className="max-w-2xl mx-auto">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">投稿</h2>
      </div>

      {post.parent && (
        <>
          <PostCard
            post={post.parent}
            currentUserId={currentProfile?.id}
          />
          <div className="px-4">
            <div className="w-0.5 h-4 bg-muted ml-6" />
          </div>
        </>
      )}

      <PostCard
        post={post}
        currentUserId={currentProfile?.id}
      />

      <Separator />

      <div className="p-4">
        <h3 className="font-bold mb-4">返信</h3>
        <PostForm parentId={post.id} placeholder="返信を投稿" />
      </div>

      <Separator />

      {post.replies && post.replies.length > 0 ? (
        <div>
          {post.replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUserId={currentProfile?.id}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          まだ返信がありません
        </div>
      )}
    </div>
  )
}

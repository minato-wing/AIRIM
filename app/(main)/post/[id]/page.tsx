import { notFound } from 'next/navigation'
import { getPost } from '@/lib/actions/post'
import { getCurrentProfile } from '@/lib/actions/profile'
import { PostCard } from '@/components/post-card'
import { PostForm } from '@/components/post-form'
import { Separator } from '@/components/ui/separator'

type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>
type Reply = Post['replies'][number]

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
            post={post.parent}
            currentUserId={currentProfile?.id}
          />
          <div className="px-3 md:px-4">
            <div className="w-0.5 h-4 bg-muted ml-5 md:ml-6" />
          </div>
        </>
      )}

      <PostCard
        post={post}
        currentUserId={currentProfile?.id}
      />

      <Separator />

      <div className="p-3 md:p-4">
        <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">返信</h3>
        <PostForm parentId={post.id} placeholder="返信を投稿" />
      </div>

      <Separator />

      {post.replies && post.replies.length > 0 ? (
        <div>
          {post.replies.map((reply: Reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUserId={currentProfile?.id}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
          まだ返信がありません
        </div>
      )}
    </div>
  )
}

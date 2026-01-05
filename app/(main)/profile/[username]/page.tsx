import { notFound } from 'next/navigation'
import { getProfileByUsername, getCurrentProfile } from '@/lib/actions/profile'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { PostCard } from '@/components/post-card'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  const currentProfile = await getCurrentProfile()

  if (!profile) {
    notFound()
  }

  const isOwnProfile = currentProfile?.id === profile.id

  const posts = await prisma.post.findMany({
    where: { authorId: profile.id },
    include: {
      author: true,
      likes: true,
      reposts: true,
      _count: {
        select: {
          likes: true,
          reposts: true,
          replies: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              {!isOwnProfile && currentProfile && (
                <FollowButton profileId={profile.id} />
              )}
            </div>
            <p className="mt-3">{profile.bio}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <span>
                <strong>{profile._count?.following || 0}</strong> フォロー中
              </span>
              <span>
                <strong>{profile._count?.followers || 0}</strong> フォロワー
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentProfile?.id} />
        ))}
      </div>
    </div>
  )
}

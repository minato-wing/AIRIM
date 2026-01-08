import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProfileByUsername, getCurrentProfile } from '@/lib/actions/profile'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { PostCard } from '@/components/post-card'
import { TagBadge } from '@/components/tag-badge'
import { Image as ImageIcon } from 'lucide-react'
import type { Prisma } from '@prisma/client'

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: true
    likes: true
    reposts: true
    _count: {
      select: {
        likes: true
        reposts: true
        replies: true
      }
    }
  }
}>

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
      <div className="border-b">
        {/* Header Image */}
        <div className="w-full h-48 bg-muted relative">
          {profile.header ? (
            <img
              src={profile.header}
              alt="Header"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start gap-4 -mt-16 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-16">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  {profile.tag && (
                    <div className="mt-2">
                      <TagBadge tag={profile.tag} size="md" />
                    </div>
                  )}
                </div>
                {isOwnProfile ? (
                  <Link href="/profile/edit">
                    <Button variant="outline">プロフィール編集</Button>
                  </Link>
                ) : currentProfile ? (
                  <FollowButton profileId={profile.id} />
                ) : null}
              </div>
            </div>
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

      <div>
        {posts.map((post: PostWithRelations) => (
          <PostCard key={post.id} post={post} currentUserId={currentProfile?.id} />
        ))}
      </div>
    </div>
  )
}

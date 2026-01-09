import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProfileByUsername, getCurrentProfile } from '@/lib/actions/profile'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { ProfilePosts } from '@/components/profile-posts'
import { TagBadge } from '@/components/tag-badge'
import { Image as ImageIcon } from 'lucide-react'

export const revalidate = 30 // Cache for 30 seconds

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  const startTime = Date.now()
  
  // Only fetch profile data - posts will be loaded on client side
  const [profile, currentProfile] = await Promise.all([
    getProfileByUsername(username),
    getCurrentProfile(),
  ])
  console.log(`[Profile Page] Profile queries: ${Date.now() - startTime}ms`)

  if (!profile) {
    notFound()
  }

  const isOwnProfile = currentProfile?.id === profile.id

  // Pre-fetch follow status for FollowButton
  const isFollowingUser = currentProfile && !isOwnProfile
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentProfile.id,
            followingId: profile.id,
          },
        },
        select: { id: true },
      })
    : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b">
        {/* Header Image */}
        <div className="w-full h-48 bg-muted relative">
          {profile.header ? (
            <Image
              src={profile.header}
              alt="Header"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
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
                  <FollowButton profileId={profile.id} initialFollowing={!!isFollowingUser} />
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

      <ProfilePosts profileId={profile.id} currentUserId={currentProfile?.id} />
    </div>
  )
}

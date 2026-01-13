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
    <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="border-b">
        {/* Header Image */}
        <div className="w-full h-32 md:h-48 bg-muted relative">
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
              <ImageIcon className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-3 md:p-6">
          <div className="flex items-start gap-2 md:gap-4 -mt-12 md:-mt-16 mb-4">
            <Avatar className="h-16 w-16 md:h-24 md:w-24 border-4 border-background">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-12 md:mt-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold truncate">{profile.name}</h1>
                  <p className="text-muted-foreground text-sm md:text-base truncate">@{profile.username}</p>
                  {profile.tags && profile.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {profile.tags.map((pt) => (
                        <TagBadge key={pt.tag.id} tag={pt.tag} size="md" />
                      ))}
                    </div>
                  )}
                </div>
                {isOwnProfile ? (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm" className="w-full md:w-auto">プロフィール編集</Button>
                  </Link>
                ) : currentProfile ? (
                  <FollowButton profileId={profile.id} initialFollowing={!!isFollowingUser} />
                ) : null}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm md:text-base break-words">{profile.bio}</p>
          <div className="mt-3 flex gap-3 md:gap-4 text-xs md:text-sm">
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

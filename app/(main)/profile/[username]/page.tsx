import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProfileByUsername, getCurrentProfile } from '@/lib/actions/profile'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { PostCard } from '@/components/post-card'
import { TagBadge } from '@/components/tag-badge'
import { Image as ImageIcon } from 'lucide-react'
import type { PostWithAuthor } from '@/lib/types'

export const revalidate = 30 // Cache for 30 seconds

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  
  const startTime = Date.now()
  
  // Parallel execution of all queries
  const profileStart = Date.now()
  const [profile, currentProfile] = await Promise.all([
    getProfileByUsername(username),
    getCurrentProfile(),
  ])
  console.log(`[Profile Page] Profile queries: ${Date.now() - profileStart}ms`)

  if (!profile) {
    notFound()
  }

  const isOwnProfile = currentProfile?.id === profile.id

  // Get posts with limit and optimized query
  const postsStart = Date.now()
  
  // First, get posts without likes/reposts subqueries
  const [rawPosts, isFollowingUser, userLikes, userReposts] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: profile.id },
      select: {
        id: true,
        content: true,
        images: true,
        authorId: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    // Pre-fetch follow status for FollowButton
    currentProfile && !isOwnProfile
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentProfile.id,
              followingId: profile.id,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    // Batch fetch user's likes for all posts
    currentProfile
      ? prisma.like.findMany({
          where: {
            userId: currentProfile.id,
            postId: { in: [] }, // Will be filled after we get post IDs
          },
          select: { postId: true, userId: true },
        })
      : Promise.resolve([]),
    // Batch fetch user's reposts for all posts
    currentProfile
      ? prisma.repost.findMany({
          where: {
            userId: currentProfile.id,
            postId: { in: [] }, // Will be filled after we get post IDs
          },
          select: { postId: true, userId: true },
        })
      : Promise.resolve([]),
  ])
  
  // Now fetch likes and reposts for the actual posts
  const postIds = rawPosts.map(p => p.id)
  const [actualLikes, actualReposts] = currentProfile && postIds.length > 0
    ? await Promise.all([
        prisma.like.findMany({
          where: {
            userId: currentProfile.id,
            postId: { in: postIds },
          },
          select: { postId: true, userId: true },
        }),
        prisma.repost.findMany({
          where: {
            userId: currentProfile.id,
            postId: { in: postIds },
          },
          select: { postId: true, userId: true },
        }),
      ])
    : [[], []]
  
  // Create lookup maps
  const likeMap = new Set(actualLikes.map(l => l.postId))
  const repostMap = new Set(actualReposts.map(r => r.postId))
  
  // Combine data
  const posts = rawPosts.map(post => ({
    ...post,
    likes: likeMap.has(post.id) ? [{ userId: currentProfile!.id }] : [],
    reposts: repostMap.has(post.id) ? [{ userId: currentProfile!.id }] : [],
  }))
  
  console.log(`[Profile Page] Posts query: ${Date.now() - postsStart}ms`)
  console.log(`[Profile Page] Total time: ${Date.now() - startTime}ms`)
  console.log(`[Profile Page] Posts count: ${posts.length}`)

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

      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentProfile?.id} />
        ))}
      </div>
    </div>
  )
}

import { PostForm } from '@/components/post-form'
import { Timeline } from '@/components/timeline'
import { getGlobalTimeline, getFollowingTimeline } from '@/lib/actions/timeline'
import { getCurrentProfile } from '@/lib/actions/profile'

export default async function HomePage() {
  const [globalPosts, followingPosts, currentProfile] = await Promise.all([
    getGlobalTimeline(),
    getFollowingTimeline().catch(() => []),
    getCurrentProfile(),
  ])

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="border-b">
        <h2 className="text-xl font-bold p-4">ホーム</h2>
      </div>
      
      <PostForm />
      
      <Timeline
        globalPosts={globalPosts}
        followingPosts={followingPosts}
        currentUserId={currentProfile?.id}
      />
    </div>
  )
}

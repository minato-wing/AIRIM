import { PostForm } from '@/components/post-form'
import { TimelineLoader } from '@/components/timeline-loader'
import { getCurrentProfile } from '@/lib/actions/profile'

export const revalidate = 10 // Cache for 10 seconds

export default async function HomePage() {
  const currentProfile = await getCurrentProfile()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b">
        <h2 className="text-xl font-bold p-4">ホーム</h2>
      </div>
      
      <PostForm />
      
      <TimelineLoader currentUserId={currentProfile?.id} />
    </div>
  )
}

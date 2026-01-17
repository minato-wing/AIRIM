import { PostForm } from '@/components/post-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentProfile } from '@/lib/actions/profile'

export default async function ComposePage() {
  const currentProfile = await getCurrentProfile()

  return (
    <div className="w-full max-w-2xl mx-auto p-3 md:p-4 pb-20 md:pb-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">新規投稿</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm userAvatar={currentProfile?.avatar} userName={currentProfile?.name} />
        </CardContent>
      </Card>
    </div>
  )
}

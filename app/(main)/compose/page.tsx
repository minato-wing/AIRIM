import { PostForm } from '@/components/post-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ComposePage() {
  return (
    <div className="w-full max-w-2xl mx-auto p-3 md:p-4 pb-20 md:pb-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">新規投稿</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </div>
  )
}

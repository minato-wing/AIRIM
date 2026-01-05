import { PostForm } from '@/components/post-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ComposePage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>新規投稿</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </div>
  )
}

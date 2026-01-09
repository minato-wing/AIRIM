import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getNotifications, markAllNotificationsAsRead } from '@/lib/actions/notification'
import { Heart, Repeat2, UserPlus, MessageCircle } from 'lucide-react'

const notificationIcons = {
  like: Heart,
  repost: Repeat2,
  follow: UserPlus,
  reply: MessageCircle,
}

const notificationMessages = {
  like: 'があなたの投稿にいいねしました',
  repost: 'があなたの投稿をリポストしました',
  follow: 'があなたをフォローしました',
  reply: 'があなたの投稿に返信しました',
}

type Notification = Awaited<ReturnType<typeof getNotifications>>[number]

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">通知</h2>
        <form action={markAllNotificationsAsRead}>
          <Button variant="ghost" size="sm" type="submit">
            すべて既読にする
          </Button>
        </form>
      </div>

      {notifications.length > 0 ? (
        <div>
          {notifications.map((notification: Notification) => {
            const Icon = notificationIcons[notification.type as keyof typeof notificationIcons]
            const message = notificationMessages[notification.type as keyof typeof notificationMessages]

            return (
              <Link
                key={notification.id}
                href={notification.post?.id ? `/post/${notification.post.id}` : `/profile/${notification.actor.username}`}
                className={`block border-b p-4 hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-bold">{notification.actor.name}</span>
                          {message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </p>
                      </div>
                    </div>
                    {notification.post && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {notification.post.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          通知はありません
        </div>
      )}
    </div>
  )
}

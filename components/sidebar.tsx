'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Settings, User, PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'

const navItems = [
  { href: '/home', label: 'ホーム', icon: Home },
  { href: '/search', label: '検索', icon: Search },
  { href: '/notifications', label: '通知', icon: Bell },
  { href: '/settings', label: '設定', icon: Settings },
  { href: '/profile', label: 'プロフィール', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AIRIM</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Link href="/compose" className="mb-4">
        <Button className="w-full gap-2">
          <PenSquare className="h-5 w-5" />
          投稿する
        </Button>
      </Link>

      <div className="border-t pt-4">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </aside>
  )
}

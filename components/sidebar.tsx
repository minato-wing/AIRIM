'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Settings, User, PenSquare, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'

const navItems = [
  { href: '/home', label: 'ホーム', icon: Home },
  { href: '/search', label: '検索', icon: Search },
  { href: '/notifications', label: '通知', icon: Bell },
  { href: '/settings', label: '設定', icon: Settings },
  { href: '/profile', label: 'プロフィール', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/sign-in' })
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-primary border-b z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-white">AIRIM</h1>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 h-screen w-64 border-r bg-primary p-4 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:top-0
        top-14
      `}>
        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-white">AIRIM</h1>
        </div>
        
        <nav className="flex-1 space-y-2 text-white">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3 text-lg"
                >
                  <Icon className="h-5 w-5" />
                  <span className="md:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <Link href="/compose" className="mb-4" onClick={closeMobileMenu}>
          <Button
            className="w-full gap-2"
            variant="secondary"
          >
            <PenSquare className="h-5 w-5" />
            <span className="md:inline">投稿する</span>
          </Button>
        </Link>

        <div className="border-t pt-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-3 text-lg text-white"
          >
            <LogOut className="h-5 w-5" />
            <span className="md:inline">ログアウト</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-primary border-t z-40 flex items-center justify-around px-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  isActive ? 'text-secondary' : 'text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
        <Link href="/compose">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 text-white"
          >
            <PenSquare className="h-5 w-5" />
            <span className="text-xs">投稿</span>
          </Button>
        </Link>
      </nav>
    </>
  )
}

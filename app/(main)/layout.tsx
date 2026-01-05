import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { checkProfileExists } from '@/lib/actions/profile'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hasProfile = await checkProfileExists()

  // プロフィールが存在しない場合はオンボーディングページにリダイレクト
  if (!hasProfile) {
    redirect('/onboarding/setup')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 border-r">
        {children}
      </main>
      <aside className="w-80 p-4">
        {/* Right sidebar for trends, suggestions, etc. */}
      </aside>
    </div>
  )
}

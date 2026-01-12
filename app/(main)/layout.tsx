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
      <main className="flex-1 border-r md:ml-64 lg:ml-64 pt-14 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>
      <aside className="hidden xl:block xl:w-80 p-4">
        {/* Right sidebar for trends, suggestions, etc. */}
      </aside>
    </div>
  )
}

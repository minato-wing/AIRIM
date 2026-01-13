import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { ProfileEditForm } from '@/components/profile-edit-form'

export default async function ProfileEditPage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/onboarding/setup')
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-3 md:p-6 pb-20 md:pb-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">プロフィール編集</h1>
      <ProfileEditForm profile={profile} />
    </div>
  )
}

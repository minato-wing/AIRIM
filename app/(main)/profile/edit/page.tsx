import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { ProfileEditForm } from '@/components/profile-edit-form'

export default async function ProfileEditPage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/onboarding/setup')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
      <ProfileEditForm profile={profile} />
    </div>
  )
}

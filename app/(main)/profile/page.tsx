import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'

export default async function ProfilePage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/onboarding/setup')
  }

  redirect(`/profile/${profile.username}`)
}

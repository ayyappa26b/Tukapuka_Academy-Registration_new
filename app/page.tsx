import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LandingPageClient from '@/components/LandingPageClient'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const { userId } = await auth()

  // Never render the landing page for an authenticated user.
  // This removes the visible landing-page flash after Clerk login.
  if (userId) {
    redirect('/after-sign-in')
  }

  return <LandingPageClient />
}

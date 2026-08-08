import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AfterSignIn() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // register/page.tsx decides:
  // - existing approved Tuka -> /dashboard
  // - existing pending/rejected academy -> status screen
  // - new account -> academy registration form
  redirect('/register')
}

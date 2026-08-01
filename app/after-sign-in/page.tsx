import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// This site only ever has one destination after signing in: the
// registration form (which itself checks whether the account already
// belongs to an academy and shows the right screen).
export default async function AfterSignIn() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  redirect('/register')
}

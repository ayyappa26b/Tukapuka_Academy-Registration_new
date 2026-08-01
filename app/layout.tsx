import type { Metadata } from 'next'
import { Kalam, Ruda, Baloo_2 } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import './globals.css'
import '@clerk/ui/themes/shadcn.css'

// Same font setup as the main TukaPuka app, for a consistent brand feel.
const kalam = Kalam({
  subsets:  ['latin'],
  variable: '--font-kalam',
  weight:   ['400', '700'],
  display:  'swap',
})

const ruda = Ruda({
  subsets:  ['latin'],
  variable: '--font-ruda',
  weight:   ['400', '500', '600', '700', '900'],
  display:  'swap',
})

const baloo2 = Baloo_2({
  subsets:  ['latin'],
  variable: '--font-baloo',
  weight:   ['400', '700'],
  display:  'swap',
})

export const metadata: Metadata = {
  title: 'Register Your Academy — TukaPuka',
  description: 'Create your TukaPuka Academy and get your teachers set up in minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kalam.variable} ${ruda.variable} ${baloo2.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}

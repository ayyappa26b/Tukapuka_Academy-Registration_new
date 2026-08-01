'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Clock, XCircle } from 'lucide-react'

interface Props {
  defaultName: string
  defaultEmail: string
}

type ReviewStatus = 'PENDING' | 'REJECTED'

interface SubmitResult {
  academyName: string
  status: ReviewStatus
  rejectionReason?: string | null
}

export function RegisterForm({ defaultName, defaultEmail }: Props) {
  const [contactName, setContactName] = useState(defaultName)
  const [contactEmail, setContactEmail] = useState(defaultEmail)
  const [academyName, setAcademyName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)

  const isValid = academyName.trim().length >= 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/academy/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'create',
          academyName: academyName.trim(),
          contactName,
          contactEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')

      // The tenant is created as PENDING — no code or dashboard access
      // until an admin approves it in academy-admin.
      setResult({
        academyName: data.academyName,
        status: 'PENDING',
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Lets someone revisit this page later and check whether they've since
  // been approved or rejected, using the email they registered with.
  async function checkStatus() {
    if (!contactEmail.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/academy/register/status?email=${encodeURIComponent(contactEmail.trim())}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not find a registration for that email')

      if (data.reviewStatus === 'APPROVED') {
        window.location.href = '/dashboard'
        return
      }

      setResult({
        academyName: data.academyName,
        status: data.reviewStatus,
        rejectionReason: data.rejectionReason,
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            {result.status === 'REJECTED' ? (
              <XCircle className="w-12 h-12 mx-auto text-destructive" />
            ) : (
              <Clock className="w-12 h-12 mx-auto text-tuka-orange" />
            )}
            <CardTitle className="font-heading text-2xl mt-2">
              {result.status === 'REJECTED'
                ? `${result.academyName} wasn't approved`
                : `${result.academyName} is under review`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {result.status === 'REJECTED' ? (
              <p className="text-sm text-muted-foreground font-body">
                {result.rejectionReason
                  ? result.rejectionReason
                  : "We're not able to create this academy due to our policies."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground font-body">
                Thanks for registering! Our team reviews every new academy before
                it goes live. We'll email {contactEmail} once a decision is made —
                you can also check back here anytime.
              </p>
            )}
            {result.status !== 'REJECTED' && (
              <Button onClick={checkStatus} disabled={loading} variant="outline" className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check status again'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <Card className="max-w-md w-full">
        <CardHeader>
          <span className="text-5xl select-none">🐦</span>
          <CardTitle className="font-heading text-2xl mt-2">Register Your Academy</CardTitle>
          <p className="text-sm text-muted-foreground font-body">
            A couple of details and we'll get your academy reviewed.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="academyName">Academy Name</Label>
              <Input
                id="academyName"
                placeholder="e.g. Riverbend Learning Academy"
                value={academyName}
                onChange={e => setAcademyName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Your Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive font-body">{error}</p>}

            <Button type="submit" disabled={!isValid || loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Academy'}
            </Button>

            <button
              type="button"
              onClick={checkStatus}
              className="w-full text-xs text-muted-foreground font-body underline underline-offset-2"
            >
              Already registered? Check your status
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

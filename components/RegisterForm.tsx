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

export function RegisterForm({
  defaultName,
  defaultEmail,
}: Props) {
  const [contactName, setContactName] =
    useState(defaultName)
  const [contactEmail, setContactEmail] =
    useState(defaultEmail)
  const [academyName, setAcademyName] =
    useState('')

  const [loading, setLoading] =
    useState(false)
  const [error, setError] =
    useState<string | null>(null)
  const [result, setResult] =
    useState<SubmitResult | null>(null)

  const academyNameValid =
    academyName.trim().length >= 2 &&
    academyName.trim().length <= 100

  const contactNameValid =
    contactName.trim().length >= 1 &&
    contactName.trim().length <= 100

  const contactEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      contactEmail.trim(),
    )

  const isValid =
    academyNameValid &&
    contactNameValid &&
    contactEmailValid

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (!isValid || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        '/api/academy/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: 'create',
            academyName:
              academyName.trim(),
            contactName:
              contactName.trim(),
            contactEmail:
              contactEmail.trim().toLowerCase(),
          }),
        },
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.error ??
            'Unable to create academy',
        )
      }

      setResult({
        academyName: data.academyName,
        status: 'PENDING',
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong',
      )
    } finally {
      setLoading(false)
    }
  }

  async function checkStatus() {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        '/api/academy/register/status',
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        },
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.error ??
            'Could not check registration status',
        )
      }

      // The status endpoint creates the Tuka only
      // after approval, then we refresh into the
      // normal dashboard-auth flow.
      if (
        data.reviewStatus ===
        'APPROVED'
      ) {
        window.location.href = '/dashboard'
        return
      }

      setResult({
        academyName: data.academyName,
        status: data.reviewStatus,
        rejectionReason:
          data.rejectionReason,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to check status',
      )
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="pond-bg min-h-screen flex items-center justify-center px-6 py-12">
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
                {result.rejectionReason ||
                  "We're not able to create this academy due to our policies."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground font-body">
                Thanks for registering! Our
                team reviews every new academy
                before it goes live.
              </p>
            )}

            {result.status !== 'REJECTED' && (
              <Button
                onClick={checkStatus}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking status...
                  </>
                ) : (
                  'Check status'
                )}
              </Button>
            )}

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pond-bg min-h-screen flex items-center justify-center px-6 py-16">
      <Card className="card-organic-solid max-w-md w-full">
        <CardHeader>
          <span className="text-5xl select-none">
            🐦
          </span>

          <CardTitle className="font-heading text-2xl mt-2">
            Register Your Academy
          </CardTitle>

          <p className="text-sm text-muted-foreground font-body">
            A couple of details and we'll get
            your academy reviewed.
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="academyName">
                Academy Name
              </Label>

              <Input
                id="academyName"
                placeholder="e.g. Riverbend Learning Academy"
                value={academyName}
                onChange={(e) =>
                  setAcademyName(
                    e.target.value,
                  )
                }
                autoFocus
              />

              {academyName.length > 0 &&
                !academyNameValid && (
                  <p className="text-xs text-destructive">
                    Academy name must be between
                    2 and 100 characters.
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">
                Your Name
              </Label>

              <Input
                id="contactName"
                value={contactName}
                onChange={(e) =>
                  setContactName(
                    e.target.value,
                  )
                }
              />

              {!contactNameValid && (
                <p className="text-xs text-destructive">
                  Your name is required.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">
                Your Email
              </Label>

              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) =>
                  setContactEmail(
                    e.target.value,
                  )
                }
              />

              {contactEmail.length > 0 &&
                !contactEmailValid && (
                  <p className="text-xs text-destructive">
                    Enter a valid email address.
                  </p>
                )}
            </div>

            {error && (
              <p className="text-sm text-destructive font-body">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!isValid || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating academy...
                </>
              ) : (
                'Create Academy'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

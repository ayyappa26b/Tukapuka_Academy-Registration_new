'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Clock,
  XCircle,
  LogOut,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

type ReviewStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export function AlreadyRegistered({
  academyName,
  reviewStatus,
  rejectionReason,
}: {
  academyName: string
  reviewStatus: ReviewStatus
  rejectionReason: string | null
}) {
  const rejected =
    reviewStatus === 'REJECTED'

  const { signOut } = useClerk()

  const [loading, setLoading] =
    useState(false)
  const [error, setError] =
    useState<string | null>(null)

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
            'Could not check status',
        )
      }

      if (
        data.reviewStatus ===
        'APPROVED'
      ) {
        // The status endpoint creates the Tuka
        // only at this point, after approval.
        window.location.href = '/dashboard'
        return
      }

      // Refresh so the server reads the latest
      // database state.
      window.location.reload()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not check status',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pond-bg min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="card-organic-solid max-w-md w-full text-center">
        <CardHeader>
          {rejected ? (
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
          ) : reviewStatus === 'APPROVED' ? (
            <CheckCircle2 className="w-12 h-12 mx-auto text-puka-emerald" />
          ) : (
            <Clock className="w-12 h-12 mx-auto text-tuka-orange" />
          )}

          <CardTitle className="font-heading text-2xl mt-2">
            {rejected
              ? `${academyName} wasn't approved`
              : reviewStatus === 'APPROVED'
                ? `${academyName} is approved`
                : `${academyName} is under review`}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {rejected ? (
            <p className="text-sm text-muted-foreground font-body">
              <span className="font-medium text-foreground">
                Reason for not approved is:{' '}
              </span>
              {rejectionReason ||
                "We're not able to create this academy due to our policies."}
            </p>
          ) : reviewStatus === 'APPROVED' ? (
            <p className="text-sm text-muted-foreground font-body">
              Your academy has been approved.
              Click below to continue to your
              academy dashboard.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground font-body">
              Our team reviews every new academy
              before it goes live. Click below to
              check whether the status has changed.
            </p>
          )}

          {!rejected && (
            <Button
              variant="outline"
              className="w-full"
              onClick={checkStatus}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking status...
                </>
              ) : reviewStatus === 'APPROVED' ? (
                'Continue to dashboard'
              ) : (
                'Check status'
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() =>
              signOut({
                redirectUrl: '/sign-in',
              })
            }
          >
            <LogOut className="mr-2" />
            Sign out
          </Button>

          {error && (
            <p className="text-sm text-destructive font-body">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

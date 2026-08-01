'use client'

import { useClerk } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, XCircle, LogOut } from 'lucide-react'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export function AlreadyRegistered({
  academyName,
  reviewStatus,
  rejectionReason,
}: {
  academyName: string
  reviewStatus: ReviewStatus
  rejectionReason: string | null
}) {
  const rejected = reviewStatus === 'REJECTED'
  const { signOut } = useClerk()

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          {rejected ? (
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
          ) : (
            <Clock className="w-12 h-12 mx-auto text-tuka-orange" />
          )}
          <CardTitle className="font-heading text-2xl mt-2">
            {rejected ? `${academyName} wasn't approved` : `${academyName} is under review`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {rejected ? (
            <p className="text-sm text-muted-foreground font-body">
              <span className="font-medium text-foreground">Reason for not approved is: </span>
              {rejectionReason || "We're not able to create this academy due to our policies."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground font-body">
              Our team reviews every new academy before it goes live. We'll email you once a decision is made.
            </p>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
          >
            <LogOut />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

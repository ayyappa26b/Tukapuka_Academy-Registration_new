import { RequestsDirectory } from '@/components/dashboard/RequestsDirectory'

export default function RequestsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl text-tuka-navy">Requests</h2>
        <p className="text-sm text-muted-foreground font-body">
          Payment verifications from Guardians.
        </p>
      </div>
      <RequestsDirectory />
    </div>
  )
}

import { UserDirectory } from '@/components/dashboard/UserDirectory'

export default function PukaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl text-tuka-navy">Puka</h2>
        <p className="text-sm text-muted-foreground font-body">
          Every learner enrolled in your academy.
        </p>
      </div>
      <UserDirectory role="PUKA" emptyLabel="No learners enrolled yet." />
    </div>
  )
}

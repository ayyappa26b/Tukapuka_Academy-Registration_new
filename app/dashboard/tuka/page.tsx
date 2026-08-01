import { UserDirectory } from '@/components/dashboard/UserDirectory'

export default function TukaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl text-tuka-navy">Tuka</h2>
        <p className="text-sm text-muted-foreground font-body">
          Every educator in your academy.
        </p>
      </div>
      <UserDirectory role="TUKA" emptyLabel="No educators yet." />
    </div>
  )
}

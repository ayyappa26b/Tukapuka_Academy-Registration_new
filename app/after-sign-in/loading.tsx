export default function Loading() {
  return (
    <div className="pond-bg min-h-screen flex items-center justify-center px-6">
      <div className="card-organic-solid w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-tuka-blue/10 text-3xl">
          🐦
        </div>

        <div className="mx-auto mb-4 size-6 animate-spin rounded-full border-2 border-tuka-blue/20 border-t-tuka-blue" />

        <h1 className="font-heading text-xl font-bold text-tuka-navy">
          Taking you to your academy
        </h1>

        <p className="mt-2 text-sm font-body text-muted-foreground">
          Checking your account and academy status...
        </p>
      </div>
    </div>
  )
}

'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface TourStep {
  target: string // matches a data-tour="..." attribute
  title: string
  body: string
}

const STEPS: TourStep[] = [
  {
    target: 'academy-header',
    title: 'Welcome to your Academy Console 🐦',
    body: "This is home base for running your academy. Let's take a quick look around.",
  },
  {
    target: 'nav-dashboard',
    title: 'Dashboard',
    body: 'A quick-glance overview of your academy, plus your student enrollment code to share.',
  },
  {
    target: 'nav-tuka',
    title: 'Tuka',
    body: 'Every educator (Tuka) in your academy — search by name and browse the full list here.',
  },
  {
    target: 'nav-puka',
    title: 'Puka',
    body: 'Every learner (Puka) enrolled in your academy — same searchable, paginated view.',
  },
  {
    target: 'nav-academy',
    title: 'Academy',
    body: 'Tukas asking to move from their current academy to yours.',
  },
]

interface TourContextValue {
  startTour: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const startTour = useCallback(() => setStepIndex(0), [])
  const close = useCallback(() => setStepIndex(null), [])

  useEffect(() => {
    if (stepIndex === null) {
      setRect(null)
      return
    }
    const step = STEPS[stepIndex]
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    if (!el) {
      // Target isn't on this page/state — skip forward rather than get stuck.
      setStepIndex(i => (i !== null && i < STEPS.length - 1 ? i + 1 : null))
      return
    }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const update = () => setRect(el.getBoundingClientRect())
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [stepIndex])

  const step = stepIndex !== null ? STEPS[stepIndex] : null

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      {step && rect && (
        <>
          <div className="fixed inset-0 z-40 bg-tuka-navy/40" onClick={close} />
          <div
            className="fixed z-40 rounded-xl ring-2 ring-tuka-cyan pointer-events-none transition-all duration-200"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
          <div
            className="fixed z-50 w-72 card-organic-solid p-5 transition-all duration-200"
            style={{
              top: Math.min(rect.bottom + 14, window.innerHeight - 200),
              left: Math.min(rect.left, window.innerWidth - 300),
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-lg text-tuka-navy">{step.title}</h3>
              <button
                onClick={close}
                aria-label="Close tour"
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground font-body mt-2">{step.body}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground font-body">
                {stepIndex! + 1} / {STEPS.length}
              </span>
              <div className="flex gap-2">
                {stepIndex! > 0 && (
                  <button
                    onClick={() => setStepIndex(i => (i ?? 1) - 1)}
                    className="pill-btn px-3 py-1.5 text-xs bg-muted text-foreground hover:opacity-80"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() =>
                    stepIndex! < STEPS.length - 1 ? setStepIndex(i => (i ?? 0) + 1) : close()
                  }
                  className="pill-btn px-3 py-1.5 text-xs bg-tuka-blue text-white hover:opacity-90"
                >
                  {stepIndex! < STEPS.length - 1 ? 'Next' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </TourContext.Provider>
  )
}

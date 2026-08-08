'use client'

import Link from 'next/link'
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from '@clerk/nextjs'
import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'One academy console',
    text: 'Manage educators, learners, sessions and academy activity from one calm workspace.',
  },
  {
    icon: Zap,
    title: 'Live learning',
    text: 'Launch real-time game sessions that keep your classroom active, focused and connected.',
  },
  {
    icon: Users,
    title: 'Grow your community',
    text: 'Invite Tukas and Pukas with simple academy codes instead of complicated setup.',
  },
  {
    icon: ShieldCheck,
    title: 'Human-reviewed onboarding',
    text: 'Every new academy is reviewed before it goes live, so your learning space stays trusted.',
  },
]

const STEPS = [
  ['01', 'Register your academy', 'Tell us your academy name and contact details.'],
  ['02', 'Get reviewed', 'Our admin team checks the registration and approves your academy.'],
  ['03', 'Invite your educators', 'Your academy gets a permanent code for your Tukas to join.'],
  ['04', 'Start learning live', 'Build sessions, invite Pukas and watch your classroom come alive.'],
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 70])
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    [1, 0],
  )

  useEffect(() => {
    if (isSignedIn) {
      // Keep the registration/approval flow authoritative.
      window.location.replace('/after-sign-in')
    }
  }, [isSignedIn])

  return (
    <main className="min-h-screen overflow-x-hidden bg-pond-water">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-32 -top-32 size-[520px] rounded-full bg-tuka-cyan/15 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[480px] rounded-full bg-puka-lime/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-tuka-blue/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-[#E3F2FD]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-3xl" aria-hidden>🐦</span>
            <div>
              <p className="font-heading text-2xl font-bold leading-none text-tuka-navy">
                Tuka<span className="text-tuka-blue">Puka</span>
              </p>
              <p className="mt-1 text-[10px] font-body font-bold tracking-[0.2em] text-tuka-navy/55">
                ACADEMY
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link href="#features" className="text-sm font-body font-semibold text-tuka-navy/70 hover:text-tuka-blue">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-body font-semibold text-tuka-navy/70 hover:text-tuka-blue">
              How it works
            </Link>
            <Link href="#start" className="text-sm font-body font-semibold text-tuka-navy/70 hover:text-tuka-blue">
              Get started
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Link
                  href="/after-sign-in"
                  className="hidden rounded-xl bg-tuka-blue px-4 py-2 text-sm font-body font-bold text-white shadow-sm sm:inline-flex"
                >
                  Continue
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="redirect" forceRedirectUrl="/after-sign-in">
                  <button className="rounded-xl px-3 py-2 text-sm font-body font-semibold text-tuka-navy/70 hover:text-tuka-blue">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
                  <button className="rounded-xl bg-tuka-blue px-4 py-2.5 text-sm font-body font-bold text-white shadow-[0_8px_24px_rgba(26,115,232,0.28)] hover:bg-tuka-blue/90">
                    Register academy
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex min-h-[760px] items-center px-5 pb-20 pt-32 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-tuka-blue/20 bg-white/70 px-4 py-2 text-xs font-body font-bold tracking-wide text-tuka-blue shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" />
              BUILT FOR MODERN ACADEMIES
            </div>

            <h1 className="max-w-3xl font-heading text-5xl font-bold leading-[1.03] text-tuka-navy sm:text-6xl lg:text-7xl">
              Your academy.
              <br />
              <span className="bg-gradient-to-r from-tuka-blue via-[#00BCD4] to-puka-emerald bg-clip-text text-transparent">
                One live learning space.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base font-body leading-8 text-slate-600 sm:text-lg">
              TukaPuka gives your academy a simple home for educators,
              learners and live game-based learning. Register your academy,
              get reviewed, then bring your whole learning community together.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
                <button className="group inline-flex items-center gap-2 rounded-2xl bg-tuka-blue px-6 py-3.5 text-sm font-body font-bold text-white shadow-[0_12px_32px_rgba(26,115,232,0.32)] transition hover:-translate-y-0.5 hover:bg-[#1768d1]">
                  Register your academy
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </button>
              </SignUpButton>

              <Link
                href="#how-it-works"
                className="inline-flex items-center rounded-2xl border border-tuka-blue/20 bg-white/65 px-6 py-3.5 text-sm font-body font-bold text-tuka-navy shadow-sm hover:bg-white"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-body font-semibold text-tuka-navy/65">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-puka-emerald" />
                No database changes required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-puka-emerald" />
                Human-reviewed onboarding
              </span>
            </div>
          </motion.div>

          {/* Console preview */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: .7, delay: .15 }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-tuka-cyan/20 via-transparent to-puka-lime/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 shadow-[0_30px_90px_rgba(11,59,96,0.16)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-tuka-blue/10 text-xl">
                    🐦
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-tuka-navy">Academy Console</p>
                    <p className="text-[11px] font-body text-muted-foreground">Your academy at a glance</p>
                  </div>
                </div>
                <span className="rounded-full bg-puka-emerald/10 px-2.5 py-1 text-[10px] font-body font-bold text-puka-emerald">
                  LIVE
                </span>
              </div>

              <div className="p-5">
                <div className="rounded-2xl bg-pond-water p-4">
                  <p className="text-[10px] font-body font-bold tracking-widest text-tuka-blue">ACADEMY CODE</p>
                  <p className="mt-1 font-score text-xl font-bold tracking-[0.18em] text-tuka-navy">ZHI-1786202055618-4PN48Q</p>
                  <p className="mt-1 text-[11px] font-body text-muted-foreground">One code for your educators to join.</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ['🐦', 'Tukas', '24'],
                    ['🐸', 'Pukas', '186'],
                    ['🔔', 'Requests', '3'],
                  ].map(([icon, label, value]) => (
                    <div key={label} className="rounded-2xl border border-border bg-white p-3">
                      <span className="text-lg">{icon}</span>
                      <p className="mt-2 font-score text-2xl font-bold text-tuka-navy">{value}</p>
                      <p className="text-[10px] font-body text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-bold text-tuka-navy">Today&apos;s activity</p>
                    <span className="text-[10px] font-body font-bold text-puka-emerald">● Live</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      'A new Tuka joined the academy',
                      'KnowQuest session completed',
                      '3 Pukas reached a new score',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs font-body text-slate-600">
                        <span className="size-1.5 rounded-full bg-tuka-blue" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/70 bg-white/55">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 sm:grid-cols-4 sm:px-8">
          {[
            ['⚡', 'Fast setup', 'Register in minutes'],
            ['🛡', 'Reviewed', 'Approval before go-live'],
            ['🐦', 'Educator-first', 'Simple Tuka workflows'],
            ['🐸', 'Learner-ready', 'Live Puka sessions'],
          ].map(([icon, title, text]) => (
            <div key={title} className="text-center sm:text-left">
              <div className="text-xl">{icon}</div>
              <p className="mt-2 font-heading text-base font-bold text-tuka-navy">{title}</p>
              <p className="text-xs font-body text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-body font-bold tracking-[.22em] text-tuka-blue">
              EVERYTHING IN ONE PLACE
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-tuka-navy sm:text-5xl">
              A calmer way to run your academy.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: .2 }}
                  transition={{ delay: index * .05 }}
                  className="card-organic-solid p-7"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-tuka-blue/10 text-tuka-blue">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold text-tuka-navy">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm font-body leading-7 text-muted-foreground">
                    {feature.text}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white/60 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-body font-bold tracking-[.22em] text-tuka-blue">HOW IT WORKS</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-tuka-navy sm:text-5xl">
              From registration to your first class.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {STEPS.map(([number, title, text]) => (
              <div key={number} className="relative rounded-[2rem] border border-tuka-blue/10 bg-white/90 p-6 shadow-sm">
                <span className="font-score text-5xl font-bold text-tuka-blue/10">{number}</span>
                <h3 className="mt-3 font-heading text-lg font-bold text-tuka-navy">{title}</h3>
                <p className="mt-2 text-sm font-body leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start CTA */}
      <section id="start" className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-tuka-navy px-7 py-14 text-center shadow-[0_24px_70px_rgba(11,59,96,.22)] sm:px-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
            🐦
          </div>
          <h2 className="mt-5 font-heading text-4xl font-bold text-white sm:text-5xl">
            Ready to build your academy?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-body leading-7 text-white/65 sm:text-base">
            Register today. Your academy will stay under review until an admin approves it.
            Once approved, check your status and continue into the Academy Console.
          </p>
          <div className="mt-8">
            <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-body font-bold text-tuka-navy shadow-lg hover:-translate-y-0.5">
                Register your academy
                <ArrowRight className="size-4" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-tuka-navy px-5 py-10 text-center sm:px-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🐦</span>
          <span className="font-heading text-xl font-bold text-white">
            Tuka<span className="text-tuka-cyan">Puka</span>
          </span>
        </div>
        <p className="mt-2 text-xs font-body text-white/40">
          Academy Console · Learn Together, Live.
        </p>
      </footer>
    </main>
  )
}

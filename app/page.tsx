'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import { motion, useScroll, useTransform, type Easing } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
/* ── Game data ──────────────────────────────────────────────────────────── */
const GAMES = [
  {
    name: 'WordQuest',
    tag: 'VOCABULARY',
    icon: '📝',
    color: 'var(--tuka-blue)',
    glow: 'rgba(41,98,255,0.18)',
    border: 'rgba(41,98,255,0.35)',
    desc: 'Build as many unique words as possible from a shared letter set. Speed and creativity both score.',
  },
  {
    name: 'KnowQuest',
    tag: 'KNOWLEDGE',
    icon: '🧠',
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.18)',
    border: 'rgba(124,58,237,0.35)',
    desc: '10 rapid-fire MCQs. First correct answer earns a speed bonus. Every second counts.',
  },
  {
    name: 'TaleQuest',
    tag: 'CREATIVITY',
    icon: '📖',
    color: '#00C853',
    glow: 'rgba(0,200,83,0.18)',
    border: 'rgba(0,200,83,0.35)',
    desc: 'Write a timed story. Tuka scores for imagination; peers vote on their favourite.',
  },
  {
    name: 'RecallQuest',
    tag: 'MEMORY',
    icon: '🔍',
    color: '#FF6D00',
    glow: 'rgba(255,109,0,0.18)',
    border: 'rgba(255,109,0,0.35)',
    desc: 'Study an image for 8 seconds, then recall every item you can see.',
  },
  {
    name: 'MathQuest',
    tag: 'NUMERACY',
    icon: '➕',
    color: '#00BCD4',
    glow: 'rgba(0,188,212,0.18)',
    border: 'rgba(0,188,212,0.35)',
    desc: 'Speed arithmetic with streak multipliers. Chain 10 in a row for maximum PukaPoints.',
  },
]

/* ── How it works ───────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: '🐦',
    title: 'Your Tuka prepares a session',
    desc: 'Your teacher (Tuka) stacks a few games, sets the class, and generates a unique join code.',
    color: 'var(--tuka-blue)',
  },
  {
    num: '02',
    icon: '🐸',
    title: 'Pukas join in one tap',
    desc: 'Students tap a shared link — or enter the join code — on any device. No app download.',
    color: '#00C853',
  },
  {
    num: '03',
    icon: '🏆',
    title: 'Play live, grow together',
    desc: 'Games run in sync. PukaPoints fly. MindMap tracks five cognitive skills across every session.',
    color: '#FF6D00',
  },
]

/* ── Animation variants ─────────────────────────────────────────────────── */
const SPRING_EASE: Easing = [0.22, 1, 0.36, 1] as unknown as Easing
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: SPRING_EASE } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
}

/* ── Floating orbs background ───────────────────────────────────────────── */
function PondOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* large slow drift */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-30"
        style={{ width: 520, height: 520, background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)', top: -120, left: -80 }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{ width: 400, height: 400, background: 'radial-gradient(circle, #AEEA00 0%, transparent 70%)', bottom: -60, right: -60 }}
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute rounded-full blur-2xl opacity-15"
        style={{ width: 280, height: 280, background: 'radial-gradient(circle, var(--tuka-blue) 0%, transparent 70%)', top: '40%', right: '10%' }}
        animate={{ x: [0, 15, 0], y: [0, 25, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
    </div>
  )
}

/* ── Ripple animation ───────────────────────────────────────────────────── */
function PondRipple() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-tuka-cyan/20"
          style={{ width: 200 + i * 180, height: 200 + i * 180 }}
          animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
          transition={{ duration: 3.5, delay: i * 1.1, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY  = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0])

const { isSignedIn } = useAuth()
const router = useRouter()

useEffect(() => {
  if (isSignedIn) {
    router.replace('/after-sign-in')
  }
}, [isSignedIn, router])
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-xl"
        style={{ background: 'rgba(227,242,253,0.82)' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2.5">
          <motion.span
            className="text-2xl select-none"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
          >
            🐦
          </motion.span>
          <span className="font-heading text-xl font-semibold" style={{ color: '#0D1B4B' }}>
            Tuka<span style={{ color: 'var(--tuka-blue)' }}>Puka</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="hidden sm:block text-sm font-body font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Our Story
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/after-sign-in"
                className="text-sm font-body font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ background: 'var(--tuka-blue)', color: '#fff', boxShadow: '0 2px 12px rgba(41,98,255,0.32)' }}
              >
                Dashboard →
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="redirect" forceRedirectUrl="/after-sign-in">
                <button className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
                <motion.button
                  className="text-sm font-body font-semibold px-5 py-2.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, var(--tuka-blue) 0%, #0039CB 100%)', boxShadow: '0 2px 16px rgba(41,98,255,0.40)' }}
                  whileHover={{ scale: 1.04, boxShadow: '0 4px 24px rgba(41,98,255,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Started 🐦
                </motion.button>
              </SignUpButton>
            </>
          )}
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        <PondOrbs />
        <PondRipple />

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          style={{ y: heroY, opacity: heroOp }}
        >
          {/* badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-body font-bold mb-8 tracking-wide"
            style={{ background: 'rgba(41,98,255,0.1)', border: '1px solid rgba(41,98,255,0.25)', color: 'var(--tuka-blue)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            🌿 LIVE · NATURE-INSPIRED · HUMAN-GUIDED
          </motion.div>

          {/* headline */}
          <motion.h1
            className="font-heading leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', color: '#0D1B4B' }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Learning that leaps.<br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--tuka-blue) 0%, #00E5FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Together, in real time.
            </span>
          </motion.h1>

          {/* sub */}
          <motion.p
            className="text-lg font-body leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: '#4A5568' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Your <strong style={{ color: 'var(--tuka-blue)' }}>Tuka</strong> (teacher) runs live game sessions.
            Your <strong style={{ color: '#00C853' }}>Pukas</strong> (students aged 6–14) compete,
            collaborate and grow — five cognitive skills tracked in every session.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.48 }}
          >
            {isSignedIn ? (
              <Link href="/after-sign-in">
                <motion.button
                  className="font-body font-bold text-sm px-8 py-3.5 rounded-2xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--tuka-blue) 0%, #0039CB 100%)',
                    boxShadow: '0 4px 24px rgba(41,98,255,0.45)',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 6px 32px rgba(41,98,255,0.60)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  🐦 Go to Dashboard
                </motion.button>
              </Link>
            ) : (
              <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
                <motion.button
                  className="font-body font-bold text-sm px-8 py-3.5 rounded-2xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--tuka-blue) 0%, #0039CB 100%)',
                    boxShadow: '0 4px 24px rgba(41,98,255,0.45)',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 6px 32px rgba(41,98,255,0.60)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  🐦 Start Your First Session
                </motion.button>
              </SignUpButton>
            )}
            <Link href="#how-it-works">
              <motion.button
                className="font-body font-semibold text-sm px-8 py-3.5 rounded-2xl"
                style={{ border: '1.5px solid rgba(41,98,255,0.3)', color: 'var(--tuka-blue)', background: 'rgba(41,98,255,0.05)' }}
                whileHover={{ background: 'rgba(41,98,255,0.12)', scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                How it works ↓
              </motion.button>
            </Link>
          </motion.div>

          {/* floating session card preview */}
          <motion.div
            className="mt-16 relative max-w-sm mx-auto"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl p-5 text-left"
              style={{
                background: 'rgba(255,255,255,0.80)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(41,98,255,0.15), 0 1px 0 rgba(255,255,255,0.8) inset',
                border: '1px solid rgba(255,255,255,0.6)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-puka-emerald animate-pulse" />
                  <span className="text-xs font-body font-bold text-puka-emerald tracking-wide">LIVE SESSION</span>
                </div>
                <span className="text-xs font-score font-bold" style={{ color: '#FF6D00' }}>02:45 ⏱</span>
              </div>
              <p className="font-heading text-base font-semibold mb-1" style={{ color: '#0D1B4B' }}>🧠 KnowQuest — Round 2</p>
              <p className="text-xs font-body text-muted-foreground mb-4">Maths & Science — 18 Pukas active</p>
              <div className="space-y-2">
                {[
                  { name: 'Aisha K.', pts: 2840, emoji: '🥇' },
                  { name: 'Dev R.',   pts: 2610, emoji: '🥈' },
                  { name: 'Priya M.', pts: 2390, emoji: '🥉' },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between bg-background/60 rounded-xl px-3 py-2">
                    <span className="text-xs font-body font-semibold" style={{ color: '#0D1B4B' }}>{p.emoji} {p.name}</span>
                    <span className="text-xs font-score font-bold" style={{ color: 'var(--tuka-blue)' }}>{p.pts.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <span className="text-xs font-body text-muted-foreground">scroll</span>
          <div className="w-px h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(41,98,255,0.5), transparent)' }} />
        </motion.div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
          >
            <p className="text-xs font-body font-bold tracking-widest mb-3" style={{ color: 'var(--tuka-blue)' }}>HOW IT WORKS</p>
            <h2 className="font-heading text-4xl font-semibold" style={{ color: '#0D1B4B' }}>
              A classroom, re-imagined.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          >
            {STEPS.map(s => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                className="relative rounded-2xl p-7"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: `1.5px solid ${s.color}22`,
                  boxShadow: `0 8px 32px ${s.color}12`,
                }}
              >
                <div
                  className="absolute -top-4 -left-1 font-score font-bold text-5xl leading-none select-none"
                  style={{ color: `${s.color}18` }}
                >
                  {s.num}
                </div>
                <div className="text-4xl mb-4 select-none">{s.icon}</div>
                <h3 className="font-heading font-semibold text-lg mb-2" style={{ color: '#0D1B4B' }}>{s.title}</h3>
                <p className="text-sm font-body leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Games grid ───────────────────────────────────────────────────── */}
      <section id="games" className="px-6 py-24 relative" style={{ background: 'linear-gradient(180deg, #E3F2FD 0%, #EFF8FF 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
          >
            <p className="text-xs font-body font-bold tracking-widest mb-3" style={{ color: 'var(--tuka-blue)' }}>THE GAMES</p>
            <h2 className="font-heading text-4xl font-semibold mb-3" style={{ color: '#0D1B4B' }}>
              Five quests. Five skills.
            </h2>
            <p className="text-base font-body text-muted-foreground max-w-xl mx-auto">
              Each session uses 3 games chosen by the Tuka. Every game targets a different cognitive dimension.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          >
            {GAMES.map(g => (
              <SignUpButton key={g.name} mode="redirect" forceRedirectUrl="/after-sign-in" signInForceRedirectUrl="/after-sign-in">
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: `0 20px 48px ${g.glow}` }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="rounded-2xl p-6 cursor-pointer group"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: `1.5px solid ${g.border}`,
                    boxShadow: `0 4px 16px ${g.glow}`,
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      className="text-4xl select-none"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      {g.icon}
                    </motion.div>
                    <div>
                      <p className="font-heading font-semibold text-lg leading-tight" style={{ color: g.color }}>{g.name}</p>
                      <span
                        className="text-[10px] font-body font-bold tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: `${g.color}15`, color: g.color }}
                      >
                        {g.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-body leading-relaxed text-muted-foreground">{g.desc}</p>
                  <div
                    className="mt-4 text-xs font-body font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: g.color }}
                  >
                    Sign up to play →
                  </div>
                </motion.div>
              </SignUpButton>
            ))}

            {/* 6th card — join CTA */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--tuka-blue) 0%, #0039CB 100%)',
                boxShadow: '0 8px 32px rgba(41,98,255,0.35)',
              }}
            >
              <div className="text-4xl mb-3 select-none">🐸</div>
              <p className="font-heading font-semibold text-lg text-white mb-1">Ready to play?</p>
              <p className="text-xs font-body text-white/70 mb-4">Ask your Tuka for a session code</p>
              <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
                <motion.button
                  className="text-xs font-body font-bold px-5 py-2.5 rounded-xl text-tuka-blue"
                  style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Create Your Account
                </motion.button>
              </SignUpButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── MindMap tracking strip ────────────────────────────────────────── */}
      <section className="px-6 py-20 relative overflow-hidden" style={{ background: '#0D1B4B' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
          >
            <p className="text-xs font-body font-bold tracking-widest mb-3" style={{ color: '#00E5FF' }}>MINDMAP SKILL TRACKING</p>
            <h2 className="font-heading text-4xl font-semibold text-white mb-3">
              Every session builds the map.
            </h2>
            <p className="text-base font-body max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Five cognitive dimensions grow with every answer. Tukas see each Puka&apos;s radar in real time.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-5 gap-4"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          >
            {[
              { label: 'Vocabulary',  color: 'var(--tuka-blue)', icon: '📝', score: 72 },
              { label: 'Knowledge',   color: '#7C3AED', icon: '🧠', score: 85 },
              { label: 'Creativity',  color: '#00C853', icon: '📖', score: 60 },
              { label: 'Memory',      color: '#FF6D00', icon: '🔍', score: 91 },
              { label: 'Numeracy',    color: '#00BCD4', icon: '➕', score: 78 },
            ].map(d => (
              <motion.div
                key={d.label}
                variants={fadeUp}
                className="rounded-2xl p-4 text-center flex flex-col items-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${d.color}30` }}
              >
                <span className="text-2xl mb-2 select-none">{d.icon}</span>
                <p className="text-xs font-body font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{d.label}</p>
                <div className="w-full h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: d.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${d.score}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    viewport={{ once: true }}
                  />
                </div>
                <span className="font-score text-xs font-bold" style={{ color: d.color }}>{d.score}%</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How to join (replaces pricing) ───────────────────────────────── */}
      <section className="px-6 py-24 relative" style={{ background: '#E3F2FD' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
          >
            <p className="text-xs font-body font-bold tracking-widest mb-3" style={{ color: 'var(--tuka-blue)' }}>GET STARTED</p>
            <h2 className="font-heading text-4xl font-semibold mb-4" style={{ color: '#0D1B4B' }}>
              Join your classroom.
            </h2>
            <p className="text-base font-body text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
              TukaPuka works through your school or academy. Your teacher sets up the sessions — you just show up and play. Enrollment is handled directly with your coach.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left max-w-xl mx-auto">
              {[
                { icon: '🐦', role: 'I\'m a Tuka (Teacher)', desc: 'Sign up and run your first live session in minutes. No tech setup required.' },
                { icon: '🐸', role: 'I\'m a Puka (Student)',  desc: 'Create your account and enter your coach\'s session code to join a live game.' },
              ].map(r => (
                <SignUpButton key={r.role} mode="redirect" forceRedirectUrl="/after-sign-in">
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    role="button"
                    tabIndex={0}
                    className="rounded-2xl p-5 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(41,98,255,0.15)', boxShadow: '0 4px 20px rgba(41,98,255,0.08)' }}
                  >
                    <div className="text-3xl mb-3 select-none">{r.icon}</div>
                    <p className="font-heading font-semibold text-base mb-1" style={{ color: '#0D1B4B' }}>{r.role}</p>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">{r.desc}</p>
                  </motion.div>
                </SignUpButton>
              ))}
            </div>

            <SignUpButton mode="redirect" forceRedirectUrl="/after-sign-in">
              <motion.button
                className="font-body font-bold text-sm px-10 py-4 rounded-2xl text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--tuka-blue) 0%, #0039CB 100%)',
                  boxShadow: '0 4px 24px rgba(41,98,255,0.40)',
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(41,98,255,0.55)' }}
                whileTap={{ scale: 0.97 }}
              >
                Create Your Account →
              </motion.button>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 text-center" style={{ background: '#0D1B4B', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl select-none">🐦</span>
          <span className="font-heading text-base font-semibold text-white">
            Tuka<span style={{ color: '#00E5FF' }}>Puka</span>
          </span>
          <span className="text-xl select-none">🐸</span>
        </div>
        <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Learn Together, Live. © {new Date().getFullYear()} TukaPuka. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

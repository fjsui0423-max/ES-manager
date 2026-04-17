'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  GitBranch,
  PenLine,
  CalendarDays,
  Sparkles,
  Monitor,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const MOBILE_UA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i

/* ---------- Scroll-reveal hook ---------- */
function useAnimateOnScroll<T extends HTMLElement = HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}

/* ---------- Gradient style objects ---------- */
const heroMeshStyle: React.CSSProperties = {
  background: `
    radial-gradient(at 20% 30%, oklch(0.568 0.224 254 / 0.22) 0px, transparent 55%),
    radial-gradient(at 80% 10%, oklch(0.568 0.224 254 / 0.10) 0px, transparent 50%),
    radial-gradient(at 50% 85%, oklch(0.568 0.224 254 / 0.15) 0px, transparent 50%),
    radial-gradient(at 90% 60%, oklch(0.62 0.22 15 / 0.06) 0px, transparent 45%)
  `,
}

const showcaseMeshStyle: React.CSSProperties = {
  background: `
    radial-gradient(at 70% 20%, oklch(0.568 0.224 254 / 0.20) 0px, transparent 50%),
    radial-gradient(at 10% 80%, oklch(0.58 0.2 300 / 0.12) 0px, transparent 50%),
    radial-gradient(at 50% 50%, oklch(0.568 0.224 254 / 0.06) 0px, transparent 60%)
  `,
}

const ctaMeshStyle: React.CSSProperties = {
  background: `
    radial-gradient(at 30% 50%, oklch(0.568 0.224 254 / 0.18) 0px, transparent 55%),
    radial-gradient(at 75% 25%, oklch(0.568 0.224 254 / 0.12) 0px, transparent 50%)
  `,
}

/* ---------- Feature data ---------- */
const features = [
  {
    icon: GitBranch,
    title: '業界・企業のツリー管理',
    description:
      '複雑な志望先を構造的に整理。業界→企業→選考の階層で一目で把握でき、戦略的な就活が叶います。',
    delay: 0,
  },
  {
    icon: PenLine,
    title: 'スマート・リッチエディタ',
    description:
      '文字数カウントやテンプレート連携で執筆を効率化。質の高いESを、素早く、美しく仕上げられます。',
    delay: 150,
  },
  {
    icon: CalendarDays,
    title: '選考カレンダー',
    description:
      '締め切りを直感的に把握。提出漏れのない就活スケジュールを一画面でスマートに管理します。',
    delay: 300,
  },
]

/* ---------- Feature card ---------- */
function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const ref = useAnimateOnScroll<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className="scroll-animate group relative p-8 rounded-2xl
                 bg-white/40 backdrop-blur-sm border border-white/50
                 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10
                 hover:border-primary/20
                 transition-all duration-300 ease-out cursor-default"
      style={{ transitionDelay: `${feature.delay}ms` }}
    >
      <div
        className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4
                   group-hover:bg-primary/15 transition-colors duration-300"
      >
        <feature.icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </div>
  )
}

/* ---------- Landing page ---------- */
function LandingPage() {
  const featureHeadingRef = useAnimateOnScroll<HTMLDivElement>()
  const showcaseRef = useAnimateOnScroll<HTMLDivElement>()
  const ctaRef = useAnimateOnScroll<HTMLDivElement>()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Floating Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-b border-white/40 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">ES Manager</span>
          </div>

          {/* Nav CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="h-9 px-5 rounded-full border border-border bg-transparent text-sm font-medium hover:bg-muted transition-colors duration-200 cursor-pointer">
                ログイン
              </button>
            </Link>
            <Link href="/login">
              <button className="h-9 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer">
                今すぐ始める
              </button>
            </Link>
          </div>

        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 z-0 bg-background" />
        <div className="absolute inset-0 z-0" style={heroMeshStyle} />

        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              就活管理ツール
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              就活の思考を、
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary/70 bg-clip-text text-transparent">
                美しく整理する。
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              業界・企業ごとのES管理から執筆まで、あなたの就活をスマートに加速させるマネージャー。
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <button className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer">
                  無料で始める
                </button>
              </Link>
              <Link href="/login">
                <button className="h-12 px-8 rounded-full border border-border bg-white/60 backdrop-blur-sm font-semibold text-foreground hover:bg-muted transition-all duration-200 cursor-pointer">
                  ログイン
                </button>
              </Link>
            </div>
          </div>

          {/* Right — App window mockup */}
          <div className="relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">

            {/* Glow halo */}
            <div className="absolute inset-0 -m-8 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Window frame */}
            <div className="relative rounded-3xl overflow-hidden border border-white/50 shadow-2xl shadow-primary/15 bg-white/40 backdrop-blur-md">

              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/40 bg-white/30">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4">
                  <div className="h-5 rounded-md bg-white/40 w-44 mx-auto" />
                </div>
              </div>

              {/* Window body */}
              <div className="p-5 h-72 md:h-80">
                <div className="flex gap-3 h-full">
                  {/* Simulated sidebar */}
                  <div className="w-28 flex flex-col gap-2">
                    <div className="h-6 rounded-lg bg-primary/15 w-3/4" />
                    <div className="h-5 rounded-lg bg-white/30 w-full" />
                    <div className="h-5 rounded-lg bg-white/30 w-4/5" />
                    <div className="h-5 rounded-lg bg-white/30 w-full" />
                    <div className="mt-2 h-5 rounded-lg bg-white/20 w-3/4" />
                    <div className="h-5 rounded-lg bg-white/20 w-full" />
                  </div>
                  {/* Simulated content */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-8 rounded-xl bg-white/30 border border-white/30" />
                    <div className="flex-1 rounded-2xl bg-white/20 border border-white/20 p-3 flex flex-col gap-2">
                      <div className="h-3 rounded-full bg-white/40 w-3/4" />
                      <div className="h-3 rounded-full bg-white/30 w-full" />
                      <div className="h-3 rounded-full bg-white/30 w-5/6" />
                      <div className="h-3 rounded-full bg-white/20 w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Feature Section ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Section heading */}
          <div ref={featureHeadingRef} className="scroll-animate text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-4">
              就活を、もっとスマートに。
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              ES Managerが提供する3つの核心機能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual Showcase ── */}
      <section className="py-24 px-6" style={{ background: 'oklch(0.955 0.008 254 / 0.3)' }}>
        <div className="max-w-6xl mx-auto">
          <div ref={showcaseRef} className="scroll-animate">
            <div className="aspect-video rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">
              <div className="absolute inset-0" style={showcaseMeshStyle} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-4">
                    <Monitor className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium tracking-wide">
                    App Screenshot Placeholder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={ctaMeshStyle} />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/8" />

        <div ref={ctaRef} className="scroll-animate relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 leading-tight">
            あなたの就活を、
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              今日から変えよう。
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
            無料でアカウントを作成して、ES Managerを使い始めましょう。
          </p>
          <Link href="/login">
            <button className="h-14 px-12 rounded-full bg-white text-foreground font-bold text-base shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer">
              無料で利用を開始する
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © 2025 ES Manager. All rights reserved.
        </p>
      </footer>

    </div>
  )
}

/* ---------- Root page ---------- */
export default function RootPage() {
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const isMobile = MOBILE_UA.test(navigator.userAgent)
        router.replace(isMobile ? '/home' : '/editor')
      } else {
        setShowLanding(true)
      }
    })
  }, [router])

  if (!showLanding) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <LandingPage />
}

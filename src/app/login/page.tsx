'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const meshStyle: React.CSSProperties = {
  background: `
    radial-gradient(at 30% 20%, rgba(66, 133, 244, 0.28) 0px, transparent 55%),
    radial-gradient(at 85% 10%, rgba(234, 67, 53, 0.16) 0px, transparent 50%),
    radial-gradient(at 10% 70%, rgba(251, 188, 4, 0.20) 0px, transparent 50%),
    radial-gradient(at 78% 68%, rgba(52, 168, 83, 0.16) 0px, transparent 50%),
    radial-gradient(at 50% 92%, rgba(66, 133, 244, 0.22) 0px, transparent 50%)
  `,
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.71 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" />
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送信しました。メールを確認してください。')
      }
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[oklch(0.977_0.008_254)]">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 z-0" style={meshStyle} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/ES-manager-logo.png"
              alt="ES Manager"
              width={56}
              height={56}
              className="rounded-2xl shadow-xl shadow-primary/25"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">ES Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">就活ES管理ツール</p>
        </div>

        {/* Glassmorphism card */}
        <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-blue-200/40 dark:shadow-black/50 rounded-3xl p-8">
          <h2 className="text-base font-semibold mb-5 text-foreground">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h2>

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3
                       rounded-2xl border border-white/60 dark:border-white/20
                       bg-white/85 dark:bg-white/10 backdrop-blur-sm
                       px-4 py-3 text-sm font-medium text-foreground
                       shadow-sm hover:bg-white/95 hover:shadow-md hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-sm
                       transition-all duration-200 ease-out
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:shadow-sm disabled:hover:translate-y-0"
          >
            <GoogleIcon />
            {googleLoading ? '接続中...' : 'Googleで続ける'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">または</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/50 dark:border-white/20
                           bg-white/60 dark:bg-white/10 backdrop-blur-sm
                           px-4 py-3 text-sm outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary/30
                           transition-all duration-200 ease-out placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-2xl border border-white/50 dark:border-white/20
                           bg-white/60 dark:bg-white/10 backdrop-blur-sm
                           px-4 py-3 text-sm outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary/30
                           transition-all duration-200 ease-out placeholder:text-muted-foreground/60"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-green-700 bg-green-50/80 backdrop-blur-sm border border-green-200/60 rounded-xl px-4 py-2.5">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary text-primary-foreground
                         px-4 py-3 text-sm font-semibold
                         shadow-md shadow-primary/20
                         hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5
                         active:translate-y-0 active:shadow-md
                         transition-all duration-300 ease-out
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:shadow-md disabled:hover:translate-y-0"
            >
              {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null) }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {mode === 'login' ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

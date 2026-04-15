'use client'

import { useState } from 'react'
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

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[oklch(0.977_0.008_254)]">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 z-0" style={meshStyle} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
            <span className="text-white font-bold text-lg">ES</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">ES Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">就活ES管理ツール</p>
        </div>

        {/* Glassmorphism card */}
        <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-blue-200/40 dark:shadow-black/50 rounded-3xl p-8">
          <h2 className="text-base font-semibold mb-6 text-foreground">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h2>

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
              className="w-full mt-2 rounded-2xl bg-primary text-primary-foreground
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

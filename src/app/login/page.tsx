'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

const meshStyle: React.CSSProperties = {
  background: `
    radial-gradient(at 30% 20%, rgba(66, 133, 244, 0.28) 0px, transparent 55%),
    radial-gradient(at 85% 10%, rgba(234, 67, 53, 0.16) 0px, transparent 50%),
    radial-gradient(at 10% 70%, rgba(251, 188, 4, 0.20) 0px, transparent 50%),
    radial-gradient(at 78% 68%, rgba(52, 168, 83, 0.16) 0px, transparent 50%),
    radial-gradient(at 50% 92%, rgba(66, 133, 244, 0.22) 0px, transparent 50%)
  `,
}

// ─────────────────────────────────────────────────────────────────────────────
// 利用規約モーダル
// ─────────────────────────────────────────────────────────────────────────────
function TermsDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger render={<button type="button" />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>利用規約</DialogTitle>
        </DialogHeader>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TODO: 以下に利用規約の本文を記載してください
            例: 各条文を <section> + <h3> + <p> で構造化する
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex-1 overflow-y-auto pr-1 text-sm text-muted-foreground space-y-4 leading-relaxed min-h-0">
          <section>
            <h3 className="font-semibold text-foreground mb-1">第1条（目的）</h3>
            <p>【ここに利用規約の本文を記載してください】</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">第2条（サービスの内容）</h3>
            <p>【ここに利用規約の本文を記載してください】</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">第3条（禁止事項）</h3>
            <p>【ここに利用規約の本文を記載してください】</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">第4条（免責事項）</h3>
            <p>【ここに利用規約の本文を記載してください】</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1">第5条（個人情報の取扱い）</h3>
            <p>【ここに利用規約の本文を記載してください】</p>
          </section>
        </div>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        <DialogFooter showCloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// メインページ
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // フォーム値
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // 状態
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next)
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
    setAgreedToTerms(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('パスワードが一致しません。')
        return
      }
      if (!agreedToTerms) {
        setError('利用規約への同意が必要です。')
        return
      }
    }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。')
      }
    }

    setLoading(false)
  }

  const isSignupValid = mode === 'signup'
    ? Boolean(email && password && confirmPassword && agreedToTerms)
    : Boolean(email && password)

  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  return (
    <div className="relative min-h-screen flex flex-col bg-[oklch(0.977_0.008_254)]">
      {/* Mesh gradient */}
      <div className="absolute inset-0 z-0" style={meshStyle} />

      {/* サイトヘッダー */}
      <header className="relative z-10 flex items-center gap-4 px-8 py-5 bg-white/30 backdrop-blur-md border-b border-white/40">
        <Image
          src="/ES-manager-logo.png"
          alt="ES Manager"
          width={48}
          height={48}
          className="rounded-2xl shadow-lg shadow-primary/20"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-black tracking-tight text-foreground">ES Manager</span>
          <span className="text-[11px] font-medium tracking-widest text-primary uppercase opacity-80">
            Entry Sheet Manager
          </span>
        </div>
      </header>

      {/* フォームエリア */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* カード */}
        <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-blue-200/40 dark:shadow-black/50 rounded-3xl p-8">

          {/* タブ切替 */}
          <div className="flex bg-muted/60 rounded-2xl p-1 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ease-out ${
                  mode === m
                    ? 'bg-white dark:bg-white/15 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* メールアドレス */}
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

            {/* パスワード */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'signup' ? '6文字以上' : '••••••••'}
                minLength={6}
                className="w-full rounded-2xl border border-white/50 dark:border-white/20
                           bg-white/60 dark:bg-white/10 backdrop-blur-sm
                           px-4 py-3 text-sm outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary/30
                           transition-all duration-200 ease-out placeholder:text-muted-foreground/60"
              />
            </div>

            {/* パスワード確認（新規登録のみ） */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">パスワード（確認）</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="もう一度入力"
                    className={`w-full rounded-2xl border backdrop-blur-sm
                               bg-white/60 dark:bg-white/10
                               px-4 py-3 text-sm outline-none pr-10
                               focus:ring-2 transition-all duration-200 ease-out
                               placeholder:text-muted-foreground/60
                               ${!passwordsMatch
                                 ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/25'
                                 : confirmPassword
                                   ? 'border-green-400/70 focus:border-green-400 focus:ring-green-400/25'
                                   : 'border-white/50 dark:border-white/20 focus:border-primary focus:ring-primary/30'
                               }`}
                  />
                  {confirmPassword && passwordsMatch && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                {!passwordsMatch && (
                  <p className="text-[11px] text-red-500 pl-1">パスワードが一致しません</p>
                )}
              </div>
            )}

            {/* 利用規約同意（新規登録のみ） */}
            {mode === 'signup' && (
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      agreedToTerms
                        ? 'bg-primary border-primary'
                        : 'border-border/70 bg-white/60 group-hover:border-primary/50'
                    }`}>
                      {agreedToTerms && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    <TermsDialog>
                      <button
                        type="button"
                        className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        利用規約
                      </button>
                    </TermsDialog>
                    に同意する
                  </span>
                </label>
              </div>
            )}

            {/* エラー / メッセージ */}
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

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading || !isSignupValid}
              className="w-full mt-1 rounded-2xl bg-primary text-primary-foreground
                         px-4 py-3 text-sm font-semibold
                         shadow-md shadow-primary/20
                         hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5
                         active:translate-y-0 active:shadow-md
                         transition-all duration-300 ease-out
                         disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:hover:shadow-md disabled:hover:translate-y-0"
            >
              {loading
                ? '処理中...'
                : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}

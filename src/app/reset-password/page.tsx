'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
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

type PageState = 'loading' | 'form' | 'success' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Supabase は PASSWORD_RECOVERY イベントでリカバリセッションを確立する
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('form')
      }
    })

    // すでにセッションが存在する場合（リロード時など）も対応
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPageState('form')
      else {
        // 数秒待ってもイベントが来なければ無効リンクと判断
        setTimeout(() => {
          setPageState((prev) => prev === 'loading' ? 'invalid' : prev)
        }, 3000)
      }
    })

    return () => { subscription.unsubscribe() }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('パスワードが一致しません。')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください。')
      return
    }
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setPageState('success')
    }
  }

  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  return (
    <div className="relative min-h-screen flex flex-col bg-[oklch(0.977_0.008_254)]">
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

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-blue-200/40 dark:shadow-black/50 rounded-3xl p-8">

            {/* ─── Loading ─── */}
            {pageState === 'loading' && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">確認中...</p>
              </div>
            )}

            {/* ─── Invalid ─── */}
            {pageState === 'invalid' && (
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-foreground">リンクが無効です</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  パスワード再設定リンクの有効期限が切れているか、すでに使用済みです。<br/>
                  再度リセットをお試しください。
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ログインページへ
                </button>
              </div>
            )}

            {/* ─── Form ─── */}
            {pageState === 'form' && (
              <>
                <div className="mb-6">
                  <h1 className="text-base font-bold text-foreground">新しいパスワードを設定</h1>
                  <p className="mt-1 text-xs text-muted-foreground">6文字以上で入力してください。</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">新しいパスワード</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="6文字以上"
                      minLength={6}
                      className="w-full rounded-2xl border border-white/50 dark:border-white/20
                                 bg-white/60 dark:bg-white/10 backdrop-blur-sm
                                 px-4 py-3 text-sm outline-none
                                 focus:border-primary focus:ring-2 focus:ring-primary/30
                                 transition-all duration-200 ease-out placeholder:text-muted-foreground/60"
                    />
                  </div>

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

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword || !passwordsMatch}
                    className="w-full mt-1 rounded-2xl bg-primary text-primary-foreground
                               px-4 py-3 text-sm font-semibold
                               shadow-md shadow-primary/20
                               hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5
                               active:translate-y-0 active:shadow-md
                               transition-all duration-300 ease-out
                               disabled:opacity-40 disabled:cursor-not-allowed
                               disabled:hover:shadow-md disabled:hover:translate-y-0"
                  >
                    {loading ? '更新中...' : 'パスワードを更新する'}
                  </button>
                </form>
              </>
            )}

            {/* ─── Success ─── */}
            {pageState === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">パスワードを更新しました</p>
                  <p className="mt-1 text-xs text-muted-foreground">新しいパスワードでログインしてください。</p>
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ログインページへ
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

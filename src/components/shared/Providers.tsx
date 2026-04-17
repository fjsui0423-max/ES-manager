'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store'

export function Providers({ children }: { children: React.ReactNode }) {
  const initializeData = useStore((s) => s.initializeData)
  const clearData = useStore((s) => s.clearData)
  const isAuthReady = useStore((s) => s.isAuthReady)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthReadyRef = useRef(isAuthReady)
  const pathnameRef    = useRef(pathname)
  // initializeData の並行実行を防ぐ mutex
  const initLockRef    = useRef(false)

  useEffect(() => { isAuthReadyRef.current = isAuthReady }, [isAuthReady])
  useEffect(() => { pathnameRef.current   = pathname },     [pathname])

  useEffect(() => {
    /**
     * 未初期化かつロック中でない場合のみ initializeData を呼ぶ。
     * isAuthReady = true の間は何度 onAuthStateChange が発火しても無視される。
     */
    const tryInit = (uid: string) => {
      if (isAuthReadyRef.current || initLockRef.current) return
      initLockRef.current = true
      initializeData(uid).finally(() => {
        initLockRef.current = false
      })
    }

    // ① 起動時のセッション確認（一度だけ）
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        tryInit(session.user.id)
      } else {
        clearData()
        if (pathnameRef.current !== '/login' && pathnameRef.current !== '/') router.replace('/login')
      }
    })

    // ② 以降の認証状態の変化を購読
    //    SIGNED_IN / SIGNED_OUT のみ処理し、TOKEN_REFRESHED・INITIAL_SESSION 等は無視する
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        tryInit(session.user.id)
        if (pathnameRef.current === '/login') router.replace('/')
      } else if (event === 'SIGNED_OUT') {
        clearData()
        router.replace('/login')
      }
      // TOKEN_REFRESHED / INITIAL_SESSION / USER_UPDATED 等は意図的に無視
      // → タブ切替・ウィンドウ切替でも選択状態がリセットされない
    })

    return () => {
      subscription.unsubscribe()
      initLockRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ログインページ以外でデータ未読込の場合はローディング表示
  if (!isAuthReady && pathname !== '/login' && pathname !== '/') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

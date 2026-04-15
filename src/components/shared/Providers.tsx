'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store'

export function Providers({ children }: { children: React.ReactNode }) {
  const initializeData = useStore((s) => s.initializeData)
  const clearData = useStore((s) => s.clearData)
  const isAuthReady = useStore((s) => s.isAuthReady)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 初回セッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initializeData(session.user.id)
      } else {
        clearData()
        if (pathname !== '/login') router.replace('/login')
      }
    })

    // 認証状態の変化を購読
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initializeData(session.user.id)
        if (pathname === '/login') router.replace('/')
      } else {
        clearData()
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ログインページ以外でデータ未読込の場合はローディング表示
  if (!isAuthReady && pathname !== '/login') {
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

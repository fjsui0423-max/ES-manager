'use client'

import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function MobileSettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">設定</h1>
      <button
        onClick={() => supabase.auth.signOut()}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-border text-sm text-destructive hover:bg-destructive/5 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </button>
    </div>
  )
}

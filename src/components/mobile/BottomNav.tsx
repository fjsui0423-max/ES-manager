'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/calendar', icon: CalendarDays, label: 'カレンダー' },
  { href: '/home', icon: Home, label: 'ホーム' },
  { href: '/settings', icon: Settings, label: '設定' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div className="bg-background/75 backdrop-blur-xl border-t border-border/30 shadow-lg shadow-black/5">
        <div className="flex">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all duration-200"
              >
                <div className={cn(
                  'flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200',
                  isActive ? 'bg-primary/12' : ''
                )}>
                  <Icon className={cn(
                    'h-5 w-5 transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

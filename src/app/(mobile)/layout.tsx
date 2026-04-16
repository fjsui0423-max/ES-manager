import Image from 'next/image'
import { BottomNav } from '@/components/mobile/BottomNav'
import { MobileSheetPortal } from '@/components/mobile/MobileSheetPortal'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 半透明ヘッダー */}
      <header className="sticky top-0 z-20 flex items-center gap-2.5 px-4 h-12 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0">
        <Image
          src="/ES-manager-logo.png"
          alt="ES Manager"
          width={26}
          height={26}
          className="rounded-xl"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">ES Manager</span>
      </header>

      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
      <MobileSheetPortal />
    </div>
  )
}

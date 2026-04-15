import { BottomNav } from '@/components/mobile/BottomNav'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { MobileSelectionSheet } from '@/components/mobile/MobileSelectionSheet'
import { cn } from '@/lib/utils'

function deadlineUrgency(deadline: string): 'past' | 'near' | 'normal' {
  const now = new Date()
  const d = new Date(deadline.includes('T') ? deadline : `${deadline}T00:00`)
  if (d < now) return 'past'
  const week = new Date(now)
  week.setDate(week.getDate() + 7)
  return d <= week ? 'near' : 'normal'
}


export default function MobileCalendarPage() {
  const selections = useStore((s) => s.selections)
  const companies = useStore((s) => s.companies)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  const allDeadlines = selections
    .filter((s) => s.deadline)
    .map((s) => {
      const company = companies.find((c) => c.id === s.company_id)
      return { id: s.id, companyId: s.company_id, deadline: s.deadline!, label: s.label ?? '', companyName: company?.name ?? '', status: s.status }
    })
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1))

  const upcomingDeadlines = allDeadlines.filter((d) => d.status !== 'submitted' && deadlineUrgency(d.deadline) !== 'past')
  const submittedDeadlines = allDeadlines.filter((d) => d.status === 'submitted')
  const expiredDeadlines = allDeadlines.filter((d) => d.status !== 'submitted' && deadlineUrgency(d.deadline) === 'past')

  const urgencyClasses = {
    past: 'border-red-200 bg-red-50 opacity-70',
    near: 'border-yellow-200 bg-yellow-50',
    normal: 'border-border bg-card',
  }
  const urgencyDateClasses = {
    past: 'bg-red-100 text-red-600',
    near: 'bg-yellow-100 text-yellow-700',
    normal: 'bg-primary/10 text-primary',
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">締切カレンダー</h1>
      <div className="space-y-6">
        {allDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">締切が設定されていません</p>
        ) : (
          (
            [
              { label: '締切が来ていないもの', items: upcomingDeadlines },
              { label: '提出済み', items: submittedDeadlines },
              { label: '期限切れ', items: expiredDeadlines },
            ] as const
          ).map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label}>
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-2 px-1">
                  {label}
                  <span className="ml-1.5 opacity-60">({items.length})</span>
                </h3>
                <div className="space-y-3">
                  {items.map((d) => {
                    const urgency = d.status === 'submitted' ? 'normal' : deadlineUrgency(d.deadline)
                    const [datePart, timePart] = d.deadline.includes('T') ? d.deadline.split('T') : [d.deadline, '']
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedCompanyId(d.companyId)}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 rounded-xl border active:scale-[0.98] transition-all text-left',
                          d.status === 'submitted' ? 'border-border bg-card opacity-50' : urgencyClasses[urgency]
                        )}
                      >
                        <div className={cn('rounded-lg px-2 py-1 text-center shrink-0', urgencyDateClasses[urgency])}>
                          <p className="text-xs font-mono">{datePart.slice(5)}</p>
                          {timePart && <p className="text-[10px] opacity-70">{timePart}</p>}
                        </div>
                        <div>
                          <p className={cn('text-sm font-medium', d.status === 'submitted' && 'line-through')}>
                            {d.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground">{d.label}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )
        )}
      </div>

      <MobileSelectionSheet
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, List } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Selection } from '@/types/app'

// ── helpers ──────────────────────────────────
function deadlineUrgency(deadline: string): 'past' | 'near' | 'normal' {
  const now = new Date()
  const d = new Date(deadline.includes('T') ? deadline : `${deadline}T00:00`)
  if (d < now) return 'past'
  const week = new Date(now)
  week.setDate(week.getDate() + 7)
  return d <= week ? 'near' : 'normal'
}

function toDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function getDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const offset = first.getDay()
  const cells: (Date | null)[] = Array(offset).fill(null)
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    cells.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return cells
}

export default function MobileCalendarPage() {
  const selections = useStore((s) => s.selections)
  const companies = useStore((s) => s.companies)
  const setSelectedMobileCompanyId = useStore((s) => s.setSelectedMobileCompanyId)

  const [mode, setMode] = useState<'list' | 'month'>('list')
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const allDeadlines = selections
    .filter((s) => s.deadline)
    .map((s) => {
      const company = companies.find((c) => c.id === s.company_id)
      return {
        id: s.id,
        companyId: s.company_id,
        deadline: s.deadline!,
        label: s.label ?? '',
        companyName: company?.name ?? '',
        status: s.status,
        selection: s as Selection,
      }
    })
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1))

  const upcomingDeadlines = allDeadlines.filter((d) => d.status !== 'submitted' && deadlineUrgency(d.deadline) !== 'past')
  const submittedDeadlines = allDeadlines.filter((d) => d.status === 'submitted')
  const expiredDeadlines = allDeadlines.filter((d) => d.status !== 'submitted' && deadlineUrgency(d.deadline) === 'past')

  // date-key → items map for month view
  const deadlineMap: Record<string, typeof allDeadlines> = {}
  allDeadlines.forEach((d) => {
    const key = d.deadline.slice(0, 10)
    if (!deadlineMap[key]) deadlineMap[key] = []
    deadlineMap[key].push(d)
  })

  const todayKey = toDateKey(today)
  const days = getDays(viewYear, viewMonth)
  const selectedItems = selectedDay ? (deadlineMap[selectedDay] ?? []) : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
    setSelectedDay(null)
  }

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

  const chipColor = (item: (typeof allDeadlines)[0]) => {
    if (item.status === 'submitted') return 'bg-green-100 text-green-700'
    const urgency = deadlineUrgency(item.deadline)
    if (urgency === 'past') return 'bg-red-100 text-red-600'
    if (urgency === 'near') return 'bg-yellow-100 text-yellow-700'
    if (item.status === 'in_progress') return 'bg-blue-100 text-blue-700'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">締切カレンダー</h1>
        <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setMode('list')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors',
              mode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-3 w-3" />リスト
          </button>
          <button
            onClick={() => setMode('month')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors',
              mode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarDays className="h-3 w-3" />月
          </button>
        </div>
      </div>

      {/* ── List View ── */}
      {mode === 'list' && (
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
                          onClick={() => setSelectedMobileCompanyId(d.companyId)}
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
      )}

      {/* ── Month View ── */}
      {mode === 'month' && (
        <div className="space-y-3">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1.5 rounded hover:bg-accent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">{viewYear}年 {viewMonth + 1}月</span>
            <button onClick={nextMonth} className="p-1.5 rounded hover:bg-accent">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={cn('text-xs font-medium py-1', i === 0 && 'text-red-500', i === 6 && 'text-blue-500')}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />
              const key = toDateKey(day)
              const items = deadlineMap[key] ?? []
              const isToday = key === todayKey
              const isSelected = key === selectedDay
              const visible = items.slice(0, 2)
              const overflow = items.length - visible.length
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={cn(
                    'min-h-[3.5rem] flex flex-col items-center justify-start pt-1 pb-1 rounded-lg text-xs transition-colors',
                    isToday && 'ring-2 ring-primary',
                    isSelected ? 'bg-primary/10' : 'hover:bg-accent',
                  )}
                >
                  <span className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full shrink-0',
                    isToday && 'bg-primary text-primary-foreground font-bold'
                  )}>
                    {day.getDate()}
                  </span>
                  {visible.length > 0 && (
                    <div className="w-full px-0.5 space-y-0.5 mt-0.5">
                      {visible.map((item) => (
                        <span
                          key={item.id}
                          className={cn('block truncate text-[9px] px-1 py-0.5 rounded leading-none', chipColor(item))}
                        >
                          {item.companyName}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="block text-[9px] text-muted-foreground px-1 leading-none">
                          +{overflow}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {selectedDay.slice(5).replace('-', '/')} の締切
              </p>
              {selectedItems.length === 0 ? (
                <p className="text-xs text-muted-foreground">締切なし</p>
              ) : (
                selectedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCompanyId(item.companyId)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.companyName}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

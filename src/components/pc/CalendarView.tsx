'use client'

import { useState } from 'react'
import { CalendarDays, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { STATUS_LABELS, TYPE_LABELS } from '@/types/app'
import type { Selection } from '@/types/app'
import { cn } from '@/lib/utils'

type CalendarMode = 'list' | 'month'

// ── helpers ──────────────────────────────────
function parseDeadline(deadline: string): Date {
  return new Date(deadline.includes('T') ? deadline : `${deadline}T00:00`)
}

function deadlineUrgency(deadline: string): 'past' | 'near' | 'normal' {
  const now = new Date()
  const d = parseDeadline(deadline)
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

// ── component ────────────────────────────────
export function CalendarView() {
  const selections = useStore(useShallow((s) => s.selections.filter((sel) => !!sel.deadline)))
  const companies = useStore((s) => s.companies)
  const setActiveSelection = useStore((s) => s.setActiveSelection)
  const setQuestionsForSelection = useStore((s) => s.setQuestionsForSelection)
  const setPcView = useStore((s) => s.setPcView)

  const [mode, setMode] = useState<CalendarMode>('list')
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  type Item = { selection: Selection; companyName: string }

  const allItems: Item[] = selections
    .map((s) => ({ selection: s, companyName: companies.find((c) => c.id === s.company_id)?.name ?? '' }))
    .sort((a, b) => (a.selection.deadline! > b.selection.deadline! ? 1 : -1))

  const upcomingItems = allItems.filter(
    ({ selection }) => selection.status !== 'submitted' && deadlineUrgency(selection.deadline!) !== 'past'
  )
  const submittedItems = allItems.filter(({ selection }) => selection.status === 'submitted')
  const expiredItems = allItems.filter(
    ({ selection }) => selection.status !== 'submitted' && deadlineUrgency(selection.deadline!) === 'past'
  )

  // date-key → items map for month view
  const deadlineMap: Record<string, Item[]> = {}
  selections.forEach((s) => {
    const key = s.deadline!.slice(0, 10)
    if (!deadlineMap[key]) deadlineMap[key] = []
    deadlineMap[key].push({ selection: s, companyName: companies.find((c) => c.id === s.company_id)?.name ?? '' })
  })

  const handleClick = (selectionId: string) => {
    setActiveSelection(selectionId)
    setQuestionsForSelection(selectionId)
    setPcView('editor')
  }

  const urgencyBorder: Record<string, string> = {
    past: 'border-red-300 bg-red-50 opacity-70',
    near: 'border-yellow-300 bg-yellow-50',
    normal: 'border-border bg-card hover:border-primary hover:bg-primary/5',
  }
  const urgencyDate: Record<string, string> = {
    past: 'bg-red-100 text-red-600',
    near: 'bg-yellow-100 text-yellow-700',
    normal: 'bg-primary/10 text-primary',
  }
  const statusColors: Record<string, string> = {
    not_started: 'bg-muted text-muted-foreground',
    in_progress: 'bg-blue-100 text-blue-700',
    submitted: 'bg-green-100 text-green-700',
  }

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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">締切カレンダー</h2>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setMode('list')}
              className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors',
                mode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <List className="h-3.5 w-3.5" />リスト
            </button>
            <button
              onClick={() => setMode('month')}
              className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors',
                mode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <CalendarDays className="h-3.5 w-3.5" />月
            </button>
          </div>
        </div>

        {/* ── List View ── */}
        {mode === 'list' && (
          allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">締切が設定されていません</p>
          ) : (
            <div className="space-y-6">
              {(
                [
                  { label: '締切が来ていないもの', items: upcomingItems },
                  { label: '提出済み', items: submittedItems },
                  { label: '期限切れ', items: expiredItems },
                ] as const
              ).map(({ label, items }) =>
                items.length === 0 ? null : (
                  <div key={label}>
                    <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-2 px-1">
                      {label}
                      <span className="ml-1.5 opacity-60">({items.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {items.map(({ selection, companyName }) => {
                        const urgency = selection.status === 'submitted' ? 'normal' : deadlineUrgency(selection.deadline!)
                        const [datePart, timePart] = selection.deadline!.includes('T')
                          ? selection.deadline!.split('T')
                          : [selection.deadline!, '']
                        return (
                          <button
                            key={selection.id}
                            onClick={() => handleClick(selection.id)}
                            className={cn(
                              'w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left',
                              selection.status === 'submitted'
                                ? 'border-border bg-card opacity-50 hover:opacity-70'
                                : urgencyBorder[urgency]
                            )}
                          >
                            <div className={cn('rounded-lg px-3 py-2 text-center shrink-0 min-w-[56px]', urgencyDate[urgency])}>
                              <p className="text-xs font-mono font-medium">{datePart.slice(5)}</p>
                              {timePart && <p className="text-[10px] opacity-70">{timePart}</p>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-medium truncate', selection.status === 'submitted' && 'line-through')}>
                                {companyName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {selection.label ?? TYPE_LABELS[selection.type]}
                              </p>
                            </div>
                            <span className={cn('text-[10px] px-2 py-0.5 rounded-full shrink-0', statusColors[selection.status])}>
                              {STATUS_LABELS[selection.status]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )
        )}

        {/* ── Month View ── */}
        {mode === 'month' && (
          <div className="space-y-3">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-accent">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold">{viewYear}年 {viewMonth + 1}月</span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-accent">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={cn('text-xs font-medium py-1',
                  i === 0 && 'text-red-500', i === 6 && 'text-blue-500')}>
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
                const chipColor = (s: Selection) => {
                  if (s.status === 'submitted') return 'bg-green-100 text-green-700'
                  if (deadlineUrgency(s.deadline!) === 'past') return 'bg-red-100 text-red-600'
                  if (s.status === 'in_progress') return 'bg-blue-100 text-blue-700'
                  return 'bg-muted text-muted-foreground'
                }
                const visible = items.slice(0, 3)
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
                    <span className={cn('w-6 h-6 flex items-center justify-center rounded-full shrink-0',
                      isToday && 'bg-primary text-primary-foreground font-bold')}>
                      {day.getDate()}
                    </span>
                    {visible.length > 0 && (
                      <div className="w-full px-0.5 space-y-0.5 mt-0.5">
                        {visible.map(({ selection, companyName }) => (
                          <span
                            key={selection.id}
                            className={cn('block truncate text-[9px] px-1 py-0.5 rounded leading-none', chipColor(selection))}
                          >
                            {companyName}
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
                  selectedItems.map(({ selection, companyName }) => (
                    <button
                      key={selection.id}
                      onClick={() => handleClick(selection.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{companyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selection.label ?? TYPE_LABELS[selection.type]}
                          {selection.deadline?.includes('T') && (
                            <span className="ml-2 font-mono">{selection.deadline.split('T')[1]}</span>
                          )}
                        </p>
                      </div>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full shrink-0', statusColors[selection.status])}>
                        {STATUS_LABELS[selection.status]}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

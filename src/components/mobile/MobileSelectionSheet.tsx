'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { TYPE_LABELS, STATUS_LABELS } from '@/types/app'
import type { SelectionStatus } from '@/types/app'
import { cn } from '@/lib/utils'

interface MobileSelectionSheetProps {
  companyId: string | null
  onClose: () => void
}

const STATUS_CYCLE: SelectionStatus[] = ['not_started', 'in_progress', 'submitted', 'declined']

const statusColors: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted:   'bg-green-100 text-green-700',
  declined:    'bg-muted text-muted-foreground line-through',
}

function formatDeadline(deadline: string): string {
  if (deadline.includes('T')) {
    const [date, time] = deadline.split('T')
    return `${date.slice(5)} ${time}`
  }
  return deadline.slice(5)
}

export function MobileSelectionSheet({ companyId, onClose }: MobileSelectionSheetProps) {
  const companies = useStore((s) => s.companies)
  const selections = useStore(
    useShallow((s) => s.selections.filter((sel) => sel.company_id === companyId))
  )
  const updateSelectionStatus = useStore((s) => s.updateSelectionStatus)

  const company = companies.find((c) => c.id === companyId)

  const handleStatusCycle = (selectionId: string, currentStatus: SelectionStatus) => {
    const idx = STATUS_CYCLE.indexOf(currentStatus)
    updateSelectionStatus(selectionId, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length])
  }

  return (
    <Sheet open={!!companyId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-left">{company?.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 overflow-y-auto">
          {selections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">選考がありません</p>
          ) : (
            selections.map((selection) => (
              <div key={selection.id} className="p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selection.label ?? TYPE_LABELS[selection.type]}
                  </span>
                  <button
                    onClick={() => handleStatusCycle(selection.id, selection.status)}
                    title="タップでステータスを変更"
                    className={cn('text-[10px] px-2 py-0.5 rounded-full active:opacity-70', statusColors[selection.status])}
                  >
                    {STATUS_LABELS[selection.status]}
                  </button>
                </div>
                {selection.deadline && (
                  <p className="text-xs text-muted-foreground mt-1">締切: {formatDeadline(selection.deadline)}</p>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

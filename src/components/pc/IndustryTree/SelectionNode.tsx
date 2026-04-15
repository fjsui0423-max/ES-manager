'use client'

import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import type { Selection, SelectionStatus } from '@/types/app'
import { TYPE_LABELS, STATUS_LABELS } from '@/types/app'
import { cn } from '@/lib/utils'
import { EditSelectionDialog } from './EditSelectionDialog'

interface SelectionNodeProps {
  selection: Selection
}

const STATUS_CYCLE: SelectionStatus[] = [
  'not_started', 'in_progress', 'submitted', 'passed_doc', 'interview', 'offered', 'rejected', 'declined',
]

const statusColors: Partial<Record<string, string>> = {
  not_started:  'bg-muted text-muted-foreground',
  in_progress:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  submitted:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  passed_doc:   'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  interview:    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  offered:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected:     'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  declined:     'bg-muted text-muted-foreground line-through',
}

function formatDeadline(deadline: string): string {
  if (deadline.includes('T')) {
    const [date, time] = deadline.split('T')
    return `${date.slice(5)} ${time}`
  }
  return deadline.slice(5)
}

export function SelectionNode({ selection }: SelectionNodeProps) {
  const activeSelectionId = useStore((s) => s.activeSelectionId)
  const setActiveSelection = useStore((s) => s.setActiveSelection)
  const setQuestionsForSelection = useStore((s) => s.setQuestionsForSelection)
  const deleteSelection = useStore((s) => s.deleteSelection)
  const updateSelectionStatus = useStore((s) => s.updateSelectionStatus)

  const [editOpen, setEditOpen] = useState(false)
  const isActive = activeSelectionId === selection.id

  const handleClick = () => {
    setActiveSelection(selection.id)
    setQuestionsForSelection(selection.id)
  }

  const handleStatusCycle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentIndex = STATUS_CYCLE.indexOf(selection.status)
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length]
    updateSelectionStatus(selection.id, nextStatus)
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 rounded-sm mx-1 cursor-pointer transition-colors',
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
        )}
        onClick={handleClick}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium truncate">
              {selection.label ?? TYPE_LABELS[selection.type]}
            </span>
            <button
              onClick={handleStatusCycle}
              title="クリックでステータスを変更"
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full shrink-0 transition-opacity hover:opacity-70',
                statusColors[selection.status]
              )}
            >
              {STATUS_LABELS[selection.status]}
            </button>
          </div>
          {selection.deadline && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              締切: {formatDeadline(selection.deadline)}
            </p>
          )}
        </div>
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
            title="編集"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); deleteSelection(selection.id) }}
            title="選考を削除"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <EditSelectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        selection={selection}
      />
    </>
  )
}

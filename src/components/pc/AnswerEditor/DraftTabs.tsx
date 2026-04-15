'use client'

import { Plus } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export function DraftTabs() {
  const drafts = useStore((s) => s.drafts)
  const activeDraftIndex = useStore((s) => s.activeDraftIndex)
  const setActiveDraftIndex = useStore((s) => s.setActiveDraftIndex)
  const markSaved = useStore((s) => s.markSaved)
  const addDraft = useStore((s) => s.addDraft)
  const isDirty = useStore((s) => s.isDirty)

  const handleTabClick = (index: number) => {
    if (index === activeDraftIndex) return
    if (isDirty) markSaved()
    setActiveDraftIndex(index)
  }

  const handleAddDraft = () => {
    if (isDirty) markSaved()
    addDraft()
  }

  return (
    <div className="flex items-center gap-0 border-b border-border px-3 pt-1 shrink-0 overflow-x-auto">
      {drafts.map((draft) => (
        <button
          key={draft.draft_index}
          onClick={() => handleTabClick(draft.draft_index)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
            draft.draft_index === activeDraftIndex
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          案{draft.draft_index}
        </button>
      ))}
      <button
        onClick={handleAddDraft}
        className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors"
        title="下書きを追加"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

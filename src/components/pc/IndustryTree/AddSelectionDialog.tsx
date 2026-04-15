'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import type { SelectionType } from '@/types/app'
import { TYPE_LABELS } from '@/types/app'

interface AddSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
}

function todayAt(time: string) {
  return `${new Date().toISOString().slice(0, 10)}T${time}`
}

export function AddSelectionDialog({ open, onOpenChange, companyId }: AddSelectionDialogProps) {
  const addSelection = useStore((s) => s.addSelection)
  const [label, setLabel] = useState('')
  const [type, setType] = useState<SelectionType>('main')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = () => {
    const trimmed = label.trim()
    if (!trimmed) return
    addSelection(companyId, trimmed, type, deadline || undefined)
    setLabel('')
    setType('main')
    setDeadline('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>選考を追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">種別</label>
            <div className="flex gap-2">
              {(['main', 'internship', 'other'] as SelectionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    type === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ラベル</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') handleSubmit() }}
              placeholder="例: 25卒 本選考"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">締切日時（任意）</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => setDeadline(todayAt('23:59'))}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
              >
                23:59
              </button>
              <button
                onClick={() => setDeadline(todayAt('11:59'))}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
              >
                11:59
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>追加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

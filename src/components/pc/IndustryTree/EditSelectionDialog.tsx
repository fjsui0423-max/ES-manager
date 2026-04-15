'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import type { Selection, SelectionType, SelectionStatus } from '@/types/app'
import { TYPE_LABELS, STATUS_LABELS } from '@/types/app'

interface EditSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selection: Selection
}

const STATUSES: SelectionStatus[] = ['not_started', 'in_progress', 'submitted']

export function EditSelectionDialog({ open, onOpenChange, selection }: EditSelectionDialogProps) {
  const updateSelection = useStore((s) => s.updateSelection)

  const [label, setLabel] = useState(selection.label ?? '')
  const [type, setType] = useState<SelectionType>(selection.type)
  const [status, setStatus] = useState<SelectionStatus>(selection.status)
  const [deadline, setDeadline] = useState(selection.deadline ?? '')

  // Reset when selection changes
  useEffect(() => {
    setLabel(selection.label ?? '')
    setType(selection.type)
    setStatus(selection.status)
    setDeadline(selection.deadline ?? '')
  }, [selection])

  const handleSubmit = () => {
    if (!label.trim()) return
    updateSelection(selection.id, {
      label: label.trim(),
      type,
      status,
      deadline: deadline || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>選考を編集</DialogTitle>
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
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ステータス</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    status === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">締切日時（任意）</label>
            <div className="space-y-1.5">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {!deadline && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setDeadline(`${today}T23:59`)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
                  >
                    今日 23:59
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setDeadline(`${today}T11:59`)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
                  >
                    今日 11:59
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

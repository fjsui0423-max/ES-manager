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

interface AddQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddQuestionDialog({ open, onOpenChange }: AddQuestionDialogProps) {
  const addQuestion = useStore((s) => s.addQuestion)
  const [body, setBody] = useState('')
  const [charLimit, setCharLimit] = useState<number | null>(null)

  const handleSubmit = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    addQuestion(trimmed, charLimit ?? undefined)
    setBody('')
    setCharLimit(null)
    onOpenChange(false)
  }

  const adjust = (delta: number) => {
    setCharLimit((prev) => {
      const base = prev ?? 0
      const next = base + delta
      return next <= 0 ? null : next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>設問を追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">設問文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="例: 学生時代に最も力を入れたことを教えてください"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">文字数制限（任意）</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjust(-100)}
                disabled={!charLimit}
                className="w-9 h-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-mono">
                {charLimit != null ? `${charLimit} 字` : '—'}
              </span>
              <button
                onClick={() => adjust(100)}
                className="w-9 h-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
              >
                ＋
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={!body.trim()}>追加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

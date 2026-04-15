'use client'

import { useState } from 'react'
import { BookOpen, Plus, Trash2, ArrowLeft, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/store'
import type { SelectionType, Template } from '@/types/app'
import { TYPE_LABELS } from '@/types/app'

type View = 'list' | 'create' | 'edit'

export function TemplateModal() {
  const isOpen = useStore((s) => s.isTemplateModalOpen)
  const closeTemplateModal = useStore((s) => s.closeTemplateModal)
  const applyTemplate = useStore((s) => s.applyTemplate)
  const templates = useStore((s) => s.templates)
  const addTemplate = useStore((s) => s.addTemplate)
  const updateTemplate = useStore((s) => s.updateTemplate)
  const deleteTemplate = useStore((s) => s.deleteTemplate)

  const [view, setView] = useState<View>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<SelectionType | ''>('')
  const [content, setContent] = useState('')

  const handleClose = () => {
    closeTemplateModal()
    resetForm()
  }

  const resetForm = () => {
    setView('list')
    setEditingId(null)
    setTitle('')
    setCategory('')
    setType('')
    setContent('')
  }

  const handleApply = (template: Template) => {
    applyTemplate(template)
    handleClose()
  }

  const handleEdit = (template: Template) => {
    setEditingId(template.id)
    setTitle(template.title)
    setCategory(template.category ?? '')
    setType(template.type ?? '')
    setContent(template.content_text)
    setView('edit')
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    if (view === 'edit' && editingId) {
      updateTemplate(editingId, title.trim(), category.trim(), type || undefined, content.trim())
    } else {
      addTemplate(title.trim(), category.trim(), type || undefined, content.trim())
    }
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view !== 'list' && (
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="戻る"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <BookOpen className="h-4 w-4" />
            {view === 'list' ? 'テンプレートを読み込む' : view === 'edit' ? 'テンプレートを編集' : 'テンプレートを作成'}
          </DialogTitle>
        </DialogHeader>

        {view === 'list' ? (
          <>
            <ScrollArea className="max-h-[52vh]">
              <div className="space-y-2 pr-1">
                {templates.map((template) => (
                  <div key={template.id} className="group flex items-start gap-1">
                    <button
                      onClick={() => handleApply(template)}
                      className="flex-1 text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-medium">{template.title}</span>
                        {template.type && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {TYPE_LABELS[template.type]}
                          </Badge>
                        )}
                        {template.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.content_text}
                      </p>
                    </button>
                    <div className="shrink-0 mt-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          aria-label="編集"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="削除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="pt-1">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setView('create')}
              >
                <Plus className="h-4 w-4" />
                新しいテンプレートを作成
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                タイトル <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 自己PR ベース"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">種別（任意）</label>
              <div className="flex gap-2">
                {(['', 'main', 'internship', 'other'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      type === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {t === '' ? '未設定' : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                カテゴリ（任意）
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例: 自己PR、ガクチカ、志望動機"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                内容 <span className="text-destructive">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="テンプレートの内容をここにペーストしてください"
                rows={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={resetForm}>
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
              >
                {view === 'edit' ? '更新' : '保存'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

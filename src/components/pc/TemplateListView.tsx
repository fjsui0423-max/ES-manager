'use client'

import { useState } from 'react'
import { BookOpen, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/store'
import type { SelectionType, Template } from '@/types/app'
import { TYPE_LABELS } from '@/types/app'
import { cn } from '@/lib/utils'

type View = 'list' | 'create' | 'edit'

export function TemplateListView() {
  const templates = useStore((s) => s.templates)
  const addTemplate = useStore((s) => s.addTemplate)
  const updateTemplate = useStore((s) => s.updateTemplate)
  const deleteTemplate = useStore((s) => s.deleteTemplate)
  const applyTemplate = useStore((s) => s.applyTemplate)
  const setPcView = useStore((s) => s.setPcView)

  const [view, setView] = useState<View>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<SelectionType | ''>('')
  const [content, setContent] = useState('')
  const [filterType, setFilterType] = useState<SelectionType | 'all'>('all')

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
    setPcView('editor')
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
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        {view !== 'list' && (
          <button
            onClick={resetForm}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          {view === 'list' ? 'テンプレート一覧' : view === 'edit' ? 'テンプレートを編集' : 'テンプレートを作成'}
        </h2>
      </div>

      {view === 'list' ? (
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl mx-auto space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'main', 'internship', 'other'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs border transition-colors',
                    filterType === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  {t === 'all' ? 'すべて' : TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            {(filterType === 'all' ? templates : templates.filter((t) => t.type === filterType)).map((template) => (
              <div key={template.id} className="group flex items-start gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors"
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
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="shrink-0 mt-1 p-2 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                  aria-label="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setView('create')}
            >
              <Plus className="h-4 w-4" />
              新しいテンプレートを作成
            </Button>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                タイトル <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 自己PR ベース"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                rows={12}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const tmpl = templates.find((t) => t.id === editingId)
                  if (tmpl) handleApply(tmpl)
                }}
                disabled={!editingId}
              >
                <BookOpen className="h-4 w-4" />
                エディタに読み込む
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
                {(view === 'create' || view === 'edit') && (
                  <Button
                    onClick={handleSave}
                    disabled={!title.trim() || !content.trim()}
                  >
                    {view === 'edit' ? '更新' : '保存'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

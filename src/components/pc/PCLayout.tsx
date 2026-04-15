'use client'

import { useRef, useCallback } from 'react'
import { PenLine, BookOpen, CalendarDays, LogOut } from 'lucide-react'
import { useStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { IndustryTree } from './IndustryTree/IndustryTree'
import { QuestionList } from './QuestionList/QuestionList'
import { AnswerEditor } from './AnswerEditor/AnswerEditor'
import { CalendarView } from './CalendarView'
import { TemplateListView } from './TemplateListView'
import { cn } from '@/lib/utils'
import type { PcView } from '@/store/uiSlice'

const NAV_ITEMS: { view: PcView; label: string; icon: React.ElementType }[] = [
  { view: 'editor', label: 'エディタ', icon: PenLine },
  { view: 'templates', label: 'テンプレート', icon: BookOpen },
  { view: 'calendar', label: 'カレンダー', icon: CalendarDays },
]

export function PCLayout() {
  const treeWidth = useStore((s) => s.treeWidth)
  const questionWidth = useStore((s) => s.questionWidth)
  const setTreeWidth = useStore((s) => s.setTreeWidth)
  const setQuestionWidth = useStore((s) => s.setQuestionWidth)
  const pcView = useStore((s) => s.pcView)
  const setPcView = useStore((s) => s.setPcView)

  const isResizingTree = useRef(false)
  const isResizingQuestion = useRef(false)

  const startResizeTree = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizingTree.current = true
    const startX = e.clientX
    const startWidth = treeWidth

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingTree.current) return
      setTreeWidth(Math.max(180, Math.min(400, startWidth + e.clientX - startX)))
    }
    const onMouseUp = () => {
      isResizingTree.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [treeWidth, setTreeWidth])

  const startResizeQuestion = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizingQuestion.current = true
    const startX = e.clientX
    const startWidth = questionWidth

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingQuestion.current) return
      setQuestionWidth(Math.max(220, Math.min(500, startWidth + e.clientX - startX)))
    }
    const onMouseUp = () => {
      isResizingQuestion.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [questionWidth, setQuestionWidth])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 半透明ヘッダー */}
      <div className="flex items-center gap-0.5 px-3 border-b border-border/40 bg-background/80 backdrop-blur-md shrink-0 h-12 sticky top-0 z-10">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setPcView(view)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ease-out',
              pcView === view
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => supabase.auth.signOut()}
            title="ログアウト"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-out"
          >
            <LogOut className="h-3.5 w-3.5" />
            ログアウト
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      {pcView === 'editor' ? (
        <div className="flex flex-1 overflow-hidden p-3 gap-0">
          {/* 左カラム: 業界ツリー */}
          <div
            className="bg-card rounded-2xl shadow-sm border border-border/50 shrink-0 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md"
            style={{ width: treeWidth }}
          >
            <IndustryTree />
          </div>

          {/* リサイズハンドル 1 */}
          <div
            className="w-3 shrink-0 flex items-center justify-center cursor-col-resize group"
            onMouseDown={startResizeTree}
          >
            <div className="w-0.5 h-10 rounded-full bg-transparent group-hover:bg-primary/40 transition-all duration-300 ease-out" />
          </div>

          {/* 中カラム: 設問リスト */}
          <div
            className="bg-card rounded-2xl shadow-sm border border-border/50 shrink-0 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md"
            style={{ width: questionWidth }}
          >
            <QuestionList />
          </div>

          {/* リサイズハンドル 2 */}
          <div
            className="w-3 shrink-0 flex items-center justify-center cursor-col-resize group"
            onMouseDown={startResizeQuestion}
          >
            <div className="w-0.5 h-10 rounded-full bg-transparent group-hover:bg-primary/40 transition-all duration-300 ease-out" />
          </div>

          {/* 右カラム: 回答エディタ */}
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex-1 overflow-hidden flex flex-col min-w-0 transition-shadow duration-200 hover:shadow-md">
            <AnswerEditor />
          </div>
        </div>
      ) : pcView === 'templates' ? (
        <div className="flex flex-1 overflow-hidden p-3">
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex-1 overflow-hidden flex flex-col">
            <TemplateListView />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden p-3">
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 flex-1 overflow-hidden flex flex-col">
            <CalendarView />
          </div>
        </div>
      )}
    </div>
  )
}

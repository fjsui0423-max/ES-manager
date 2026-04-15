'use client'

import { BookOpen, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { DraftTabs } from './DraftTabs'
import { RichTextEditor } from './RichTextEditor'
import { TemplateModal } from './TemplateModal'

export function AnswerEditor() {
  const activeQuestionId = useStore((s) => s.activeQuestionId)
  const questions = useStore((s) => s.questions)
  const openTemplateModal = useStore((s) => s.openTemplateModal)

  const activeQuestion = questions.find((q) => q.id === activeQuestionId)

  if (!activeQuestionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
        <PenLine className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          設問を選択すると回答エディタが表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 設問ヘッダー */}
      <div className="px-4 py-2.5 border-b border-border shrink-0 bg-muted/30">
        <p className="text-xs font-medium text-foreground line-clamp-2">
          {activeQuestion?.body}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {activeQuestion?.char_limit ? `${activeQuestion.char_limit}字以内` : '文字数制限なし'}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2 gap-1"
            onClick={openTemplateModal}
          >
            <BookOpen className="h-3 w-3" />
            テンプレートを読み込む
          </Button>
        </div>
      </div>

      {/* ドラフトタブ */}
      <DraftTabs />

      {/* エディタ */}
      <div className="flex-1 overflow-hidden">
        <RichTextEditor charLimit={activeQuestion?.char_limit} />
      </div>

      {/* テンプレートモーダル */}
      <TemplateModal />
    </div>
  )
}

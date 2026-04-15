'use client'

import { useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/store'
import { QuestionItem } from './QuestionItem'
import { AddQuestionDialog } from './AddQuestionDialog'

export function QuestionList() {
  const questions = useStore((s) => s.questions)
  const activeSelectionId = useStore((s) => s.activeSelectionId)
  const selections = useStore((s) => s.selections)
  const [addOpen, setAddOpen] = useState(false)

  const activeSelection = selections.find((s) => s.id === activeSelectionId)

  if (!activeSelectionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          左のツリーから選考を選んでください
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">設問</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setAddOpen(true)}
            title="設問を追加"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {activeSelection?.label && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{activeSelection.label}</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {questions.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">設問がありません</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                設問を追加
              </Button>
            </div>
          ) : (
            questions.map((question, index) => (
              <QuestionItem key={question.id} question={question} index={index + 1} />
            ))
          )}
        </div>
      </ScrollArea>

      <AddQuestionDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

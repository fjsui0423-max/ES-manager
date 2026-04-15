'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import type { Question } from '@/types/app'
import { cn } from '@/lib/utils'

interface QuestionItemProps {
  question: Question
  index: number
}

export function QuestionItem({ question, index }: QuestionItemProps) {
  const activeQuestionId = useStore((s) => s.activeQuestionId)
  const setActiveQuestion = useStore((s) => s.setActiveQuestion)
  const deleteQuestion = useStore((s) => s.deleteQuestion)
  const activeDraftIndex = useStore((s) => s.activeDraftIndex)
  const drafts = useStore((s) => s.drafts)

  const isActive = activeQuestionId === question.id

  const charCount = isActive
    ? (drafts.find((d) => d.draft_index === activeDraftIndex)?.content_text.length ?? 0)
    : 0

  const pct = question.char_limit ? charCount / question.char_limit : null

  return (
    <div
      className={cn(
        'group px-3 py-2 cursor-pointer transition-colors border-b border-border/50 last:border-0',
        isActive ? 'bg-primary/10' : 'hover:bg-accent/50'
      )}
      onClick={() => setActiveQuestion(question.id)}
    >
      <div className="flex items-start gap-2">
        <span className="text-xs text-muted-foreground mt-0.5 shrink-0 w-4">{index}.</span>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs line-clamp-3', isActive ? 'text-primary font-medium' : 'text-foreground')}>
            {question.body}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            {question.char_limit && (
              <span className={cn(
                'text-[10px] font-mono',
                pct !== null && pct >= 1 ? 'text-red-500' :
                pct !== null && pct >= 0.8 ? 'text-yellow-500' :
                'text-muted-foreground'
              )}>
                {isActive ? charCount : '—'} / {question.char_limit}字
              </span>
            )}
            {question.deadline && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                {question.deadline}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hidden group-hover:flex text-destructive hover:text-destructive shrink-0 mt-0.5"
          onClick={(e) => { e.stopPropagation(); deleteQuestion(question.id) }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

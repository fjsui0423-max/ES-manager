'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import type { Industry } from '@/types/app'
import { CompanyNode } from './CompanyNode'
import { AddItemDialog } from './AddItemDialog'

interface IndustryNodeProps {
  industry: Industry
}

export function IndustryNode({ industry }: IndustryNodeProps) {
  const companies = useStore(
    useShallow((s) => s.companies.filter((c) => c.industry_id === industry.id))
  )
  const pendingCount = useStore(
    useShallow((s) => {
      const companyIds = new Set(s.companies.filter((c) => c.industry_id === industry.id).map((c) => c.id))
      return s.selections.filter(
        (sel) => companyIds.has(sel.company_id) && (sel.status === 'not_started' || sel.status === 'in_progress')
      ).length
    })
  )
  const expandedNodes = useStore((s) => s.expandedNodes)
  const toggleNode = useStore((s) => s.toggleNode)
  const addCompany = useStore((s) => s.addCompany)
  const deleteIndustry = useStore((s) => s.deleteIndustry)
  const [addOpen, setAddOpen] = useState(false)

  const isExpanded = expandedNodes.has(industry.id)

  return (
    <div>
      <div className="group flex items-center gap-1 px-2 py-1 hover:bg-accent/50 rounded-sm mx-1 cursor-pointer">
        <button
          className="flex items-center gap-1 flex-1 min-w-0"
          onClick={() => toggleNode(industry.id)}
        >
          <span className="text-muted-foreground shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="text-sm font-medium truncate">{industry.name}</span>
          <span className="text-xs text-muted-foreground ml-1">({companies.length})</span>
        </button>
        {pendingCount > 0 && (
          <span className="shrink-0 text-[10px] font-medium leading-none px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            {pendingCount}
          </span>
        )}
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => { e.stopPropagation(); setAddOpen(true) }}
            title="企業を追加"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); deleteIndustry(industry.id) }}
            title="業界を削除"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-3">
          {companies.length === 0 ? (
            <button
              className="w-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground text-left transition-colors"
              onClick={() => setAddOpen(true)}
            >
              + 企業を追加
            </button>
          ) : (
            companies.map((company) => (
              <CompanyNode key={company.id} company={company} />
            ))
          )}
        </div>
      )}

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="企業を追加"
        placeholder="例: 株式会社〇〇"
        onSubmit={(name) => addCompany(industry.id, name)}
      />
    </div>
  )
}

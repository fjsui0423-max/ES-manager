'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import type { Company } from '@/types/app'
import { SelectionNode } from './SelectionNode'
import { AddSelectionDialog } from './AddSelectionDialog'

interface CompanyNodeProps {
  company: Company
}

export function CompanyNode({ company }: CompanyNodeProps) {
  const selections = useStore(
    useShallow((s) => s.selections.filter((sel) => sel.company_id === company.id))
  )
  const expandedNodes = useStore((s) => s.expandedNodes)
  const toggleNode = useStore((s) => s.toggleNode)
  const deleteCompany = useStore((s) => s.deleteCompany)
  const [addOpen, setAddOpen] = useState(false)

  const isExpanded = expandedNodes.has(company.id)

  return (
    <div>
      <div className="group flex items-center gap-1 px-2 py-1 hover:bg-accent/50 rounded-sm mx-1 cursor-pointer">
        <button
          className="flex items-center gap-1 flex-1 min-w-0"
          onClick={() => toggleNode(company.id)}
        >
          <span className="text-muted-foreground shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="text-sm truncate">{company.name}</span>
        </button>
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => { e.stopPropagation(); setAddOpen(true) }}
            title="選考を追加"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); deleteCompany(company.id) }}
            title="企業を削除"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-3">
          {selections.length === 0 ? (
            <button
              className="w-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground text-left transition-colors"
              onClick={() => setAddOpen(true)}
            >
              + 選考を追加
            </button>
          ) : (
            selections.map((selection) => (
              <SelectionNode key={selection.id} selection={selection} />
            ))
          )}
        </div>
      )}

      <AddSelectionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        companyId={company.id}
      />
    </div>
  )
}

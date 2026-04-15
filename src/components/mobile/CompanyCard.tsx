'use client'

import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import type { Company } from '@/types/app'
import { STATUS_LABELS, TYPE_LABELS } from '@/types/app'
import { cn } from '@/lib/utils'

interface CompanyCardProps {
  company: Company
  onSelect: (companyId: string) => void
}

const statusColors: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-green-100 text-green-700',
}

export function CompanyCard({ company, onSelect }: CompanyCardProps) {
  const selections = useStore(
    useShallow((s) => s.selections.filter((sel) => sel.company_id === company.id))
  )

  const nearestDeadline = selections
    .filter((s) => s.deadline)
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))[0]?.deadline

  return (
    <button
      className="w-full text-left p-4 border border-border rounded-xl bg-card shadow-sm active:scale-[0.98] transition-transform"
      onClick={() => onSelect(company.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{company.name}</p>
          {nearestDeadline && (
            <p className="text-xs text-muted-foreground mt-0.5">
              締切: {nearestDeadline.includes('T')
                ? `${nearestDeadline.slice(5, 10)} ${nearestDeadline.split('T')[1]}`
                : nearestDeadline.slice(5)}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {selections.map((sel) => (
              <span
                key={sel.id}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  statusColors[sel.status]
                )}
              >
                {sel.label ?? TYPE_LABELS[sel.type]}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      </div>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/store'
import { IndustryNode } from './IndustryNode'
import { AddItemDialog } from './AddItemDialog'

export function IndustryTree() {
  const industries = useStore((s) => s.industries)
  const addIndustry = useStore((s) => s.addIndustry)
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">業界・企業</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setOpen(true)}
          title="業界を追加"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {industries.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              業界を追加してください
            </p>
          ) : (
            industries.map((industry) => (
              <IndustryNode key={industry.id} industry={industry} />
            ))
          )}
        </div>
      </ScrollArea>
      <AddItemDialog
        open={open}
        onOpenChange={setOpen}
        title="業界を追加"
        placeholder="例: IT・通信"
        onSubmit={(name) => addIndustry(name)}
      />
    </div>
  )
}

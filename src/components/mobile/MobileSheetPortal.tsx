'use client'

import { useStore } from '@/store'
import { MobileSelectionSheet } from '@/components/mobile/MobileSelectionSheet'

export function MobileSheetPortal() {
  const selectedMobileCompanyId = useStore((s) => s.selectedMobileCompanyId)
  const setSelectedMobileCompanyId = useStore((s) => s.setSelectedMobileCompanyId)

  return (
    <MobileSelectionSheet
      companyId={selectedMobileCompanyId}
      onClose={() => setSelectedMobileCompanyId(null)}
    />
  )
}

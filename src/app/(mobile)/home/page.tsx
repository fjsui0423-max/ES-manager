'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { CompanyCard } from '@/components/mobile/CompanyCard'
import { MobileSelectionSheet } from '@/components/mobile/MobileSelectionSheet'

export default function MobileHomePage() {
  const companies = useStore((s) => s.companies)
  const industries = useStore((s) => s.industries)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">ES管理</h1>
      {industries.map((industry) => {
        const industryCompanies = companies.filter((c) => c.industry_id === industry.id)
        if (industryCompanies.length === 0) return null
        return (
          <div key={industry.id} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {industry.name}
            </h2>
            <div className="space-y-2">
              {industryCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onSelect={setSelectedCompanyId}
                />
              ))}
            </div>
          </div>
        )
      })}
      {companies.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          企業が登録されていません
        </p>
      )}
      <MobileSelectionSheet
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  )
}

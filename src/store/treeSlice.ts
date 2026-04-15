import type { StateCreator } from 'zustand'
import type { Industry, Company, Selection, SelectionStatus } from '@/types/app'
import {
  MOCK_INDUSTRIES,
  MOCK_COMPANIES,
  MOCK_SELECTIONS,
} from '@/lib/mockData'

export interface TreeSlice {
  industries: Industry[]
  companies: Company[]
  selections: Selection[]

  activeIndustryId: string | null
  activeCompanyId: string | null
  activeSelectionId: string | null

  expandedNodes: Set<string>

  setActiveSelection: (selectionId: string) => void
  toggleNode: (nodeId: string) => void
  addIndustry: (name: string) => void
  addCompany: (industryId: string, name: string) => void
  addSelection: (companyId: string, label: string, type: Selection['type'], deadline?: string) => void
  updateSelection: (id: string, data: Partial<Pick<Selection, 'label' | 'type' | 'status' | 'deadline'>>) => void
  updateSelectionStatus: (id: string, status: SelectionStatus) => void
  deleteIndustry: (id: string) => void
  deleteCompany: (id: string) => void
  deleteSelection: (id: string) => void
}

export const createTreeSlice: StateCreator<TreeSlice, [], [], TreeSlice> = (set) => ({
  industries: MOCK_INDUSTRIES,
  companies: MOCK_COMPANIES,
  selections: MOCK_SELECTIONS,

  activeIndustryId: null,
  activeCompanyId: null,
  activeSelectionId: null,

  expandedNodes: new Set<string>(),

  setActiveSelection: (selectionId) =>
    set((state) => {
      const selection = state.selections.find((s) => s.id === selectionId)
      if (!selection) return {}
      const company = state.companies.find((c) => c.id === selection.company_id)
      const newExpanded = new Set(state.expandedNodes)
      if (company) {
        newExpanded.add(company.id)
        newExpanded.add(company.industry_id)
      }
      return {
        activeSelectionId: selectionId,
        activeCompanyId: selection.company_id,
        activeIndustryId: company?.industry_id ?? null,
        expandedNodes: newExpanded,
      }
    }),

  toggleNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes)
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId)
      } else {
        newExpanded.add(nodeId)
      }
      return { expandedNodes: newExpanded }
    }),

  addIndustry: (name) =>
    set((state) => ({
      industries: [
        ...state.industries,
        {
          id: `ind-${Date.now()}`,
          user_id: 'user-1',
          name,
          sort_order: state.industries.length,
          created_at: new Date().toISOString(),
        },
      ],
    })),

  addCompany: (industryId, name) =>
    set((state) => {
      const count = state.companies.filter((c) => c.industry_id === industryId).length
      const newExpanded = new Set(state.expandedNodes)
      newExpanded.add(industryId)
      return {
        companies: [
          ...state.companies,
          {
            id: `co-${Date.now()}`,
            user_id: 'user-1',
            industry_id: industryId,
            name,
            sort_order: count,
            created_at: new Date().toISOString(),
          },
        ],
        expandedNodes: newExpanded,
      }
    }),

  addSelection: (companyId, label, type, deadline) =>
    set((state) => {
      const count = state.selections.filter((s) => s.company_id === companyId).length
      const newExpanded = new Set(state.expandedNodes)
      newExpanded.add(companyId)
      return {
        selections: [
          ...state.selections,
          {
            id: `sel-${Date.now()}`,
            user_id: 'user-1',
            company_id: companyId,
            type,
            label,
            status: 'not_started',
            deadline,
            sort_order: count,
            created_at: new Date().toISOString(),
          },
        ],
        expandedNodes: newExpanded,
      }
    }),

  updateSelection: (id, data) =>
    set((state) => ({
      selections: state.selections.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),

  updateSelectionStatus: (id, status) =>
    set((state) => ({
      selections: state.selections.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    })),

  deleteIndustry: (id) =>
    set((state) => {
      const companyIds = state.companies
        .filter((c) => c.industry_id === id)
        .map((c) => c.id)
      const selectionIds = state.selections
        .filter((s) => companyIds.includes(s.company_id))
        .map((s) => s.id)
      return {
        industries: state.industries.filter((i) => i.id !== id),
        companies: state.companies.filter((c) => c.industry_id !== id),
        selections: state.selections.filter((s) => !selectionIds.includes(s.id)),
        activeIndustryId: state.activeIndustryId === id ? null : state.activeIndustryId,
        activeCompanyId: companyIds.includes(state.activeCompanyId ?? '')
          ? null
          : state.activeCompanyId,
        activeSelectionId: selectionIds.includes(state.activeSelectionId ?? '')
          ? null
          : state.activeSelectionId,
      }
    }),

  deleteCompany: (id) =>
    set((state) => {
      const selectionIds = state.selections
        .filter((s) => s.company_id === id)
        .map((s) => s.id)
      return {
        companies: state.companies.filter((c) => c.id !== id),
        selections: state.selections.filter((s) => s.company_id !== id),
        activeCompanyId: state.activeCompanyId === id ? null : state.activeCompanyId,
        activeSelectionId: selectionIds.includes(state.activeSelectionId ?? '')
          ? null
          : state.activeSelectionId,
      }
    }),

  deleteSelection: (id) =>
    set((state) => ({
      selections: state.selections.filter((s) => s.id !== id),
      activeSelectionId: state.activeSelectionId === id ? null : state.activeSelectionId,
    })),
})

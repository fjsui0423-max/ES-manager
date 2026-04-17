import type { StateCreator } from 'zustand'
import type { AppStore } from './index'
import type { Industry, Company, Selection, SelectionStatus } from '@/types/app'
import { supabase } from '@/lib/supabase'

const LS_SELECTION = 'es-manager:lastSelectionId'
const LS_EXPANDED  = 'es-manager:expandedNodes'

function lsGet(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

function lsGetExpanded(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_EXPANDED)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

export function lsSaveExpanded(nodes: Set<string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_EXPANDED, JSON.stringify([...nodes]))
}

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

export const createTreeSlice: StateCreator<AppStore, [], [], TreeSlice> = (set, get) => ({
  industries: [],
  companies: [],
  selections: [],

  activeIndustryId: null,
  activeCompanyId: null,
  // localStorage から同期読み込みして初期フラッシュを防ぐ
  activeSelectionId: lsGet(LS_SELECTION),

  expandedNodes: lsGetExpanded(),

  setActiveSelection: (selectionId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_SELECTION, selectionId)
      localStorage.removeItem('es-manager:lastQuestionId')
    }
    set((state) => {
      const selection = state.selections.find((s) => s.id === selectionId)
      if (!selection) return {}
      const company = state.companies.find((c) => c.id === selection.company_id)
      const newExpanded = new Set(state.expandedNodes)
      if (company) {
        newExpanded.add(company.id)
        newExpanded.add(company.industry_id)
      }
      lsSaveExpanded(newExpanded)
      return {
        activeSelectionId: selectionId,
        activeCompanyId: selection.company_id,
        activeIndustryId: company?.industry_id ?? null,
        expandedNodes: newExpanded,
      }
    })
  },

  toggleNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes)
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId)
      } else {
        newExpanded.add(nodeId)
      }
      lsSaveExpanded(newExpanded)
      return { expandedNodes: newExpanded }
    }),

  addIndustry: (name) => {
    const { userId, industries } = get()
    if (!userId) return
    const tmpId = `tmp-${Date.now()}`
    const tmp: Industry = {
      id: tmpId,
      user_id: userId,
      name,
      sort_order: industries.length,
      created_at: new Date().toISOString(),
    }
    set((s) => ({ industries: [...s.industries, tmp] }))
    ;(async () => {
      const { data, error } = await supabase
        .from('industries')
        .insert({ user_id: userId, name, sort_order: industries.length })
        .select()
        .single()
      if (error) {
        set((s) => ({ industries: s.industries.filter((i) => i.id !== tmpId) }))
        return
      }
      set((s) => ({ industries: s.industries.map((i) => (i.id === tmpId ? data : i)) }))
    })()
  },

  addCompany: (industryId, name) => {
    const { userId, companies } = get()
    if (!userId) return
    const count = companies.filter((c) => c.industry_id === industryId).length
    const tmpId = `tmp-${Date.now()}`
    const tmp: Company = {
      id: tmpId,
      user_id: userId,
      industry_id: industryId,
      name,
      sort_order: count,
      created_at: new Date().toISOString(),
    }
    set((s) => {
      const newExpanded = new Set(s.expandedNodes)
      newExpanded.add(industryId)
      lsSaveExpanded(newExpanded)
      return { companies: [...s.companies, tmp], expandedNodes: newExpanded }
    })
    ;(async () => {
      const { data, error } = await supabase
        .from('companies')
        .insert({ user_id: userId, industry_id: industryId, name, sort_order: count })
        .select()
        .single()
      if (error) {
        set((s) => ({ companies: s.companies.filter((c) => c.id !== tmpId) }))
        return
      }
      set((s) => ({ companies: s.companies.map((c) => (c.id === tmpId ? data : c)) }))
    })()
  },

  addSelection: (companyId, label, type, deadline) => {
    const { userId, selections } = get()
    if (!userId) return
    const count = selections.filter((s) => s.company_id === companyId).length
    const tmpId = `tmp-${Date.now()}`
    const tmp: Selection = {
      id: tmpId,
      user_id: userId,
      company_id: companyId,
      type,
      label,
      status: 'not_started',
      deadline,
      sort_order: count,
      created_at: new Date().toISOString(),
    }
    set((s) => {
      const newExpanded = new Set(s.expandedNodes)
      newExpanded.add(companyId)
      lsSaveExpanded(newExpanded)
      return { selections: [...s.selections, tmp], expandedNodes: newExpanded }
    })
    ;(async () => {
      const { data, error } = await supabase
        .from('selections')
        .insert({ user_id: userId, company_id: companyId, type, label, status: 'not_started', deadline: deadline ?? null, sort_order: count })
        .select()
        .single()
      if (error) {
        set((s) => ({ selections: s.selections.filter((sel) => sel.id !== tmpId) }))
        return
      }
      set((s) => ({ selections: s.selections.map((sel) => (sel.id === tmpId ? data : sel)) }))
    })()
  },

  updateSelection: (id, data) => {
    set((s) => ({
      selections: s.selections.map((sel) => (sel.id === id ? { ...sel, ...data } : sel)),
    }))
    ;(async () => {
      await supabase.from('selections').update(data).eq('id', id)
    })()
  },

  updateSelectionStatus: (id, status) => {
    set((s) => ({
      selections: s.selections.map((sel) => (sel.id === id ? { ...sel, status } : sel)),
    }))
    ;(async () => {
      await supabase.from('selections').update({ status }).eq('id', id)
    })()
  },

  deleteIndustry: (id) => {
    set((state) => {
      const companyIds = state.companies.filter((c) => c.industry_id === id).map((c) => c.id)
      const selectionIds = state.selections.filter((s) => companyIds.includes(s.company_id)).map((s) => s.id)
      return {
        industries: state.industries.filter((i) => i.id !== id),
        companies: state.companies.filter((c) => c.industry_id !== id),
        selections: state.selections.filter((s) => !selectionIds.includes(s.id)),
        activeIndustryId: state.activeIndustryId === id ? null : state.activeIndustryId,
        activeCompanyId: companyIds.includes(state.activeCompanyId ?? '') ? null : state.activeCompanyId,
        activeSelectionId: selectionIds.includes(state.activeSelectionId ?? '') ? null : state.activeSelectionId,
      }
    })
    ;(async () => {
      await supabase.from('industries').delete().eq('id', id)
    })()
  },

  deleteCompany: (id) => {
    set((state) => {
      const selectionIds = state.selections.filter((s) => s.company_id === id).map((s) => s.id)
      return {
        companies: state.companies.filter((c) => c.id !== id),
        selections: state.selections.filter((s) => s.company_id !== id),
        activeCompanyId: state.activeCompanyId === id ? null : state.activeCompanyId,
        activeSelectionId: selectionIds.includes(state.activeSelectionId ?? '') ? null : state.activeSelectionId,
      }
    })
    ;(async () => {
      await supabase.from('companies').delete().eq('id', id)
    })()
  },

  deleteSelection: (id) => {
    set((state) => ({
      selections: state.selections.filter((s) => s.id !== id),
      activeSelectionId: state.activeSelectionId === id ? null : state.activeSelectionId,
    }))
    ;(async () => {
      await supabase.from('selections').delete().eq('id', id)
    })()
  },
})

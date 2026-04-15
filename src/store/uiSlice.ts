import type { StateCreator } from 'zustand'

export type PcView = 'editor' | 'templates' | 'calendar'

export interface UISlice {
  treeWidth: number
  questionWidth: number
  pcView: PcView
  isTemplateModalOpen: boolean
  isAddIndustryModalOpen: boolean
  isAddCompanyModalOpen: boolean
  isAddSelectionModalOpen: boolean
  addCompanyTargetIndustryId: string | null
  addSelectionTargetCompanyId: string | null

  setTreeWidth: (w: number) => void
  setQuestionWidth: (w: number) => void
  setPcView: (view: PcView) => void
  openTemplateModal: () => void
  closeTemplateModal: () => void
  openAddIndustryModal: () => void
  closeAddIndustryModal: () => void
  openAddCompanyModal: (industryId: string) => void
  closeAddCompanyModal: () => void
  openAddSelectionModal: (companyId: string) => void
  closeAddSelectionModal: () => void
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  treeWidth: 260,
  questionWidth: 320,
  pcView: 'editor',
  isTemplateModalOpen: false,
  isAddIndustryModalOpen: false,
  isAddCompanyModalOpen: false,
  isAddSelectionModalOpen: false,
  addCompanyTargetIndustryId: null,
  addSelectionTargetCompanyId: null,

  setTreeWidth: (w) => set({ treeWidth: w }),
  setQuestionWidth: (w) => set({ questionWidth: w }),
  setPcView: (view) => set({ pcView: view }),
  openTemplateModal: () => set({ isTemplateModalOpen: true }),
  closeTemplateModal: () => set({ isTemplateModalOpen: false }),
  openAddIndustryModal: () => set({ isAddIndustryModalOpen: true }),
  closeAddIndustryModal: () => set({ isAddIndustryModalOpen: false }),
  openAddCompanyModal: (industryId) =>
    set({ isAddCompanyModalOpen: true, addCompanyTargetIndustryId: industryId }),
  closeAddCompanyModal: () =>
    set({ isAddCompanyModalOpen: false, addCompanyTargetIndustryId: null }),
  openAddSelectionModal: (companyId) =>
    set({ isAddSelectionModalOpen: true, addSelectionTargetCompanyId: companyId }),
  closeAddSelectionModal: () =>
    set({ isAddSelectionModalOpen: false, addSelectionTargetCompanyId: null }),
})

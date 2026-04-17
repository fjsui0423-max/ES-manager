import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { createTreeSlice, type TreeSlice } from './treeSlice'
import { createEditorSlice, type EditorSlice } from './editorSlice'
import { createUISlice, type UISlice, type PcView } from './uiSlice'
import { createAuthSlice, type AuthSlice } from './authSlice'

export type AppStore = TreeSlice & EditorSlice & UISlice & AuthSlice

type PersistedState = {
  activeIndustryId?: string | null
  activeCompanyId?: string | null
  activeSelectionId?: string | null
  treeWidth?: number
  questionWidth?: number
  pcView?: PcView
  expandedNodes?: string[]
}

export const useStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createTreeSlice(...args),
        ...createEditorSlice(...args),
        ...createUISlice(...args),
        ...createAuthSlice(...args),
      }),
      {
        name: 'es-manager-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          activeIndustryId:  state.activeIndustryId,
          activeCompanyId:   state.activeCompanyId,
          activeSelectionId: state.activeSelectionId,
          treeWidth:         state.treeWidth,
          questionWidth:     state.questionWidth,
          pcView:            state.pcView,
          expandedNodes:     Array.from(state.expandedNodes),
        }),
        merge: (persistedState, currentState) => {
          const ps = persistedState as PersistedState
          return {
            ...currentState,
            activeIndustryId:  'activeIndustryId'  in ps ? (ps.activeIndustryId  ?? null) : currentState.activeIndustryId,
            activeCompanyId:   'activeCompanyId'   in ps ? (ps.activeCompanyId   ?? null) : currentState.activeCompanyId,
            activeSelectionId: 'activeSelectionId' in ps ? (ps.activeSelectionId ?? null) : currentState.activeSelectionId,
            treeWidth:         ps.treeWidth    ?? currentState.treeWidth,
            questionWidth:     ps.questionWidth ?? currentState.questionWidth,
            pcView:            ps.pcView        ?? currentState.pcView,
            expandedNodes:     new Set(ps.expandedNodes ?? []),
          }
        },
      }
    ),
    { name: 'ESManager' }
  )
)

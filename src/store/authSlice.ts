import type { StateCreator } from 'zustand'
import type { AppStore } from './index'
import { supabase } from '@/lib/supabase'

export interface AuthSlice {
  userId: string | null
  isAuthReady: boolean
  initializeData: (userId: string) => Promise<void>
  clearData: () => void
}

export const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set) => ({
  userId: null,
  isAuthReady: false,

  initializeData: async (userId) => {
    const [
      { data: industries },
      { data: companies },
      { data: selections },
      { data: templates },
    ] = await Promise.all([
      supabase.from('industries').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('companies').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('selections').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('templates').select('*').eq('user_id', userId).order('created_at'),
    ])
    set({
      userId,
      isAuthReady: true,
      industries: industries ?? [],
      companies: companies ?? [],
      selections: selections ?? [],
      templates: templates ?? [],
      // reset editor state on auth
      questions: [],
      activeQuestionId: null,
      drafts: [],
      editorContent: null,
      isDirty: false,
      activeSelectionId: null,
      activeCompanyId: null,
      activeIndustryId: null,
    })
  },

  clearData: () =>
    set({
      userId: null,
      isAuthReady: false,
      industries: [],
      companies: [],
      selections: [],
      templates: [],
      questions: [],
      activeQuestionId: null,
      drafts: [],
      editorContent: null,
      isDirty: false,
      activeSelectionId: null,
      activeCompanyId: null,
      activeIndustryId: null,
    }),
})

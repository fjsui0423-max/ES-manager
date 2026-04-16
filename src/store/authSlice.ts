import type { StateCreator } from 'zustand'
import type { AppStore } from './index'
import type { Question, Answer } from '@/types/app'
import type { JSONContent } from '@tiptap/react'
import { supabase } from '@/lib/supabase'

const LS_SELECTION = 'es-manager:lastSelectionId'
const LS_QUESTION  = 'es-manager:lastQuestionId'

function lsGet(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

export interface AuthSlice {
  userId: string | null
  isAuthReady: boolean
  initializeData: (userId: string) => Promise<void>
  clearData: () => void
}

export const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set, get) => ({
  userId: null,
  isAuthReady: false,

  initializeData: async (userId) => {
    // 同一ユーザーで既に初期化済み（タブフォーカス等による再認証）の場合は
    // マスターデータのみ更新し、選択・エディタ状態はそのまま保持する
    const sameUser = get().userId === userId && get().isAuthReady

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

    if (sameUser) {
      set({
        industries: industries ?? [],
        companies: companies ?? [],
        selections: selections ?? [],
        templates: templates ?? [],
      })
      return
    }

    // 初回ロード: localStorage から最後の選択状態を復元し、追加フェッチする
    const lastSelectionId = lsGet(LS_SELECTION)
    const lastQuestionId  = lsGet(LS_QUESTION)

    const loadedSelections = selections ?? []
    const loadedCompanies  = companies ?? []

    const validSelection = lastSelectionId
      ? loadedSelections.find((s) => s.id === lastSelectionId) ?? null
      : null
    const validCompany = validSelection
      ? loadedCompanies.find((c) => c.id === validSelection.company_id) ?? null
      : null

    let restoredQuestions: Question[] = []
    let restoredDrafts: Answer[]      = []
    let restoredQuestionId: string | null = null
    let restoredDraftIndex = 1
    let restoredContent: JSONContent | null = null

    if (validSelection) {
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('selection_id', validSelection.id)
        .eq('user_id', userId)
        .order('sort_order')
      restoredQuestions = qData ?? []

      const validQuestion = lastQuestionId
        ? restoredQuestions.find((q) => q.id === lastQuestionId) ?? restoredQuestions[0] ?? null
        : restoredQuestions[0] ?? null

      if (validQuestion) {
        restoredQuestionId = validQuestion.id
        const { data: aData } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', validQuestion.id)
          .eq('user_id', userId)
          .order('draft_index')
        restoredDrafts = aData ?? []
        const firstDraft = restoredDrafts[0] ?? null
        restoredDraftIndex = firstDraft?.draft_index ?? 1
        restoredContent    = (firstDraft?.content_json as JSONContent | null) ?? null
      }
    }

    const expandedNodes = new Set<string>()
    if (validCompany) {
      expandedNodes.add(validCompany.id)
      expandedNodes.add(validCompany.industry_id)
    }

    set({
      userId,
      isAuthReady: true,
      industries: industries ?? [],
      companies: loadedCompanies,
      selections: loadedSelections,
      templates: templates ?? [],
      prefetchCache: new Map(),
      // ツリー状態
      activeSelectionId: validSelection?.id ?? null,
      activeCompanyId: validSelection?.company_id ?? null,
      activeIndustryId: validCompany?.industry_id ?? null,
      expandedNodes,
      // エディタ状態
      questions: restoredQuestions,
      activeQuestionId: restoredQuestionId,
      drafts: restoredDrafts,
      activeDraftIndex: restoredDraftIndex,
      editorContent: restoredContent,
      isDirty: false,
      contentLoadSignal: get().contentLoadSignal + 1,
    })

    // バックグラウンドプリフェッチ: アクティブ企業の全選考
    if (validSelection) {
      const companySelections = loadedSelections.filter(
        (s) => s.company_id === validSelection.company_id
      )
      Promise.resolve().then(() => {
        companySelections.forEach((s) => get().prefetchForSelection(s.id))
      })
    }
  },

  clearData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LS_SELECTION)
      localStorage.removeItem(LS_QUESTION)
    }
    set({
      userId: null,
      isAuthReady: false,
      industries: [],
      companies: [],
      selections: [],
      templates: [],
      prefetchCache: new Map(),
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
})

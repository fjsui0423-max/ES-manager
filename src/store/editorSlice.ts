import type { StateCreator } from 'zustand'
import type { AppStore } from './index'
import type { JSONContent } from '@tiptap/react'
import type { Question, Answer, Template, SelectionType } from '@/types/app'
import { supabase } from '@/lib/supabase'

type PrefetchEntry = {
  questions: Question[]
  answers: Record<string, Answer[]> // questionId → answers
}

export interface EditorSlice {
  questions: Question[]
  activeQuestionId: string | null

  drafts: Answer[]
  activeDraftIndex: number

  editorContent: JSONContent | null
  isDirty: boolean
  templateApplySignal: number
  contentLoadSignal: number

  templates: Template[]

  prefetchCache: Map<string, PrefetchEntry>

  setQuestionsForSelection: (selectionId: string) => void
  setActiveQuestion: (id: string) => void
  setActiveDraftIndex: (index: number) => void
  setEditorContent: (content: JSONContent) => void
  markSaved: () => void
  addDraft: () => void
  applyTemplate: (template: Template) => void
  addQuestion: (body: string, charLimit?: number) => void
  deleteQuestion: (id: string) => void
  addTemplate: (title: string, category: string, type: SelectionType | undefined, contentText: string) => void
  updateTemplate: (id: string, title: string, category: string, type: SelectionType | undefined, contentText: string) => void
  deleteTemplate: (id: string) => void
  prefetchForSelection: (selectionId: string) => void
}

export const createEditorSlice: StateCreator<AppStore, [], [], EditorSlice> = (set, get) => ({
  questions: [],
  activeQuestionId: null,

  drafts: [],
  activeDraftIndex: 1,

  editorContent: null,
  isDirty: false,
  templateApplySignal: 0,
  contentLoadSignal: 0,

  templates: [],

  prefetchCache: new Map(),

  prefetchForSelection: (selectionId) => {
    const { prefetchCache, userId } = get()
    if (prefetchCache.has(selectionId) || !userId) return
    ;(async () => {
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('selection_id', selectionId)
        .eq('user_id', userId)
        .order('sort_order')
      const questions: Question[] = qData ?? []
      const answers: Record<string, Answer[]> = {}
      if (questions.length > 0) {
        const ids = questions.map((q) => q.id)
        const { data: aData } = await supabase
          .from('answers')
          .select('*')
          .in('question_id', ids)
          .eq('user_id', userId)
          .order('draft_index')
        const allAnswers: Answer[] = aData ?? []
        for (const q of questions) {
          answers[q.id] = allAnswers.filter((a) => a.question_id === q.id)
        }
      }
      // Map を直接変更するだけでリレンダリングを起こさない
      prefetchCache.set(selectionId, { questions, answers })
    })()
  },

  setQuestionsForSelection: (selectionId) => {
    const { isDirty, prefetchCache } = get()
    if (isDirty) get().markSaved()
    set({ questions: [], activeQuestionId: null, drafts: [], editorContent: null, isDirty: false })
    const { userId } = get()
    if (!userId) return

    const cached = prefetchCache.get(selectionId)
    if (cached) {
      set({ questions: cached.questions })
      return
    }

    ;(async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('selection_id', selectionId)
        .eq('user_id', userId)
        .order('sort_order')
      set({ questions: data ?? [] })
    })()
  },

  setActiveQuestion: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('es-manager:lastQuestionId', id)
    }
    const { isDirty, activeQuestionId, prefetchCache, activeSelectionId } = get()
    if (isDirty && activeQuestionId) get().markSaved()
    set({ activeQuestionId: id, drafts: [], activeDraftIndex: 1, editorContent: null, isDirty: false })
    const { userId } = get()
    if (!userId) return

    // キャッシュから answers を取得
    const cached = activeSelectionId ? prefetchCache.get(activeSelectionId) : undefined
    if (cached) {
      const drafts: Answer[] = cached.answers[id] ?? []
      const firstDraft = drafts[0] ?? null
      set((s) => ({
        drafts,
        activeDraftIndex: firstDraft?.draft_index ?? 1,
        editorContent: (firstDraft?.content_json as JSONContent | null) ?? null,
        isDirty: false,
        contentLoadSignal: s.contentLoadSignal + 1,
      }))
      return
    }

    ;(async () => {
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .eq('user_id', userId)
        .order('draft_index')
      const drafts: Answer[] = data ?? []
      const firstDraft = drafts[0] ?? null
      set((s) => ({
        drafts,
        activeDraftIndex: firstDraft?.draft_index ?? 1,
        editorContent: (firstDraft?.content_json as JSONContent | null) ?? null,
        isDirty: false,
        contentLoadSignal: s.contentLoadSignal + 1,
      }))
    })()
  },

  setActiveDraftIndex: (index) => {
    const { drafts } = get()
    const draft = drafts.find((d) => d.draft_index === index)
    set({
      activeDraftIndex: index,
      editorContent: (draft?.content_json as JSONContent | null) ?? null,
      isDirty: false,
    })
  },

  setEditorContent: (content) => {
    set({ editorContent: content, isDirty: true })
  },

  markSaved: () => {
    const { activeQuestionId, activeDraftIndex, editorContent, drafts, userId, activeSelectionId, prefetchCache } = get()
    if (!activeQuestionId || !editorContent || !userId) return

    const contentText = extractText(editorContent)
    const existingIndex = drafts.findIndex((d) => d.draft_index === activeDraftIndex)
    const now = new Date().toISOString()

    let updatedDrafts: Answer[]
    if (existingIndex >= 0) {
      updatedDrafts = [...drafts]
      updatedDrafts[existingIndex] = {
        ...updatedDrafts[existingIndex],
        content_json: editorContent,
        content_text: contentText,
        updated_at: now,
      }
      set({ drafts: updatedDrafts, isDirty: false })
    } else {
      const newDraft: Answer = {
        id: `tmp-${Date.now()}`,
        user_id: userId,
        question_id: activeQuestionId,
        draft_index: activeDraftIndex,
        content_json: editorContent,
        content_text: contentText,
        is_active: false,
        updated_at: now,
        created_at: now,
      }
      updatedDrafts = [...drafts, newDraft]
      set({ drafts: updatedDrafts, isDirty: false })
    }

    // キャッシュの answers も更新
    if (activeSelectionId) {
      const cached = prefetchCache.get(activeSelectionId)
      if (cached) {
        cached.answers[activeQuestionId] = updatedDrafts
      }
    }

    ;(async () => {
      await supabase.from('answers').upsert(
        {
          user_id: userId,
          question_id: activeQuestionId,
          draft_index: activeDraftIndex,
          content_json: editorContent,
          content_text: contentText,
          is_active: false,
          updated_at: now,
        },
        { onConflict: 'question_id,draft_index' }
      )
    })()
  },

  addDraft: () => {
    const { drafts, activeQuestionId } = get()
    if (!activeQuestionId) return
    const nextIndex = drafts.length > 0 ? Math.max(...drafts.map((d) => d.draft_index)) + 1 : 1
    const { userId } = get()
    const now = new Date().toISOString()
    const newDraft: Answer = {
      id: `tmp-${Date.now()}`,
      user_id: userId ?? 'unknown',
      question_id: activeQuestionId,
      draft_index: nextIndex,
      content_json: null,
      content_text: '',
      is_active: false,
      updated_at: now,
      created_at: now,
    }
    set({ drafts: [...drafts, newDraft], activeDraftIndex: nextIndex, editorContent: null })
  },

  applyTemplate: (template) => {
    set((state) => ({
      editorContent: template.content_json as JSONContent,
      isDirty: true,
      templateApplySignal: state.templateApplySignal + 1,
    }))
    // set() は同期的にストアを更新するため、直後に get() で最新状態を参照して即時保存できる
    get().markSaved()
  },

  addQuestion: (body, charLimit) => {
    const { activeSelectionId, questions, userId, prefetchCache } = get()
    if (!activeSelectionId || !userId) return
    const tmpId = `tmp-${Date.now()}`
    const newQuestion: Question = {
      id: tmpId,
      user_id: userId,
      selection_id: activeSelectionId,
      body,
      char_limit: charLimit,
      sort_order: questions.length,
      created_at: new Date().toISOString(),
    }
    set({ questions: [...questions, newQuestion] })
    // キャッシュにも楽観的追加
    const cached = prefetchCache.get(activeSelectionId)
    if (cached) cached.questions = [...cached.questions, newQuestion]
    ;(async () => {
      const { data, error } = await supabase
        .from('questions')
        .insert({ user_id: userId, selection_id: activeSelectionId, body, char_limit: charLimit ?? null, sort_order: questions.length })
        .select()
        .single()
      if (error) {
        set((s) => ({ questions: s.questions.filter((q) => q.id !== tmpId) }))
        // 失敗時はキャッシュからも除去
        const c = get().prefetchCache.get(activeSelectionId)
        if (c) c.questions = c.questions.filter((q) => q.id !== tmpId)
        return
      }
      set((s) => ({ questions: s.questions.map((q) => (q.id === tmpId ? data : q)) }))
      // tmpId を DB の実 ID に差し替え
      const c = get().prefetchCache.get(activeSelectionId)
      if (c) c.questions = c.questions.map((q) => (q.id === tmpId ? data : q))
    })()
  },

  deleteQuestion: (id) => {
    const { questions, activeQuestionId, activeSelectionId, prefetchCache } = get()
    set({
      questions: questions.filter((q) => q.id !== id),
      activeQuestionId: activeQuestionId === id ? null : activeQuestionId,
    })
    // キャッシュからも即時削除（answers エントリも含む）
    if (activeSelectionId) {
      const cached = prefetchCache.get(activeSelectionId)
      if (cached) {
        cached.questions = cached.questions.filter((q) => q.id !== id)
        delete cached.answers[id]
      }
    }
    ;(async () => {
      await supabase.from('questions').delete().eq('id', id)
    })()
  },

  addTemplate: (title, category, type, contentText) => {
    const { userId, templates } = get()
    if (!userId) return
    const tmpId = `tmp-${Date.now()}`
    const newTemplate: Template = {
      id: tmpId,
      user_id: userId,
      title,
      content_json: textToTiptap(contentText),
      content_text: contentText,
      category: category || undefined,
      type: type || undefined,
      created_at: new Date().toISOString(),
    }
    set({ templates: [...templates, newTemplate] })
    ;(async () => {
      const { data, error } = await supabase
        .from('templates')
        .insert({ user_id: userId, title, content_json: textToTiptap(contentText), content_text: contentText, category: category || null, type: type || null })
        .select()
        .single()
      if (error) {
        set((s) => ({ templates: s.templates.filter((t) => t.id !== tmpId) }))
        return
      }
      set((s) => ({ templates: s.templates.map((t) => (t.id === tmpId ? data : t)) }))
    })()
  },

  updateTemplate: (id, title, category, type, contentText) => {
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === id
          ? { ...t, title, category: category || undefined, type: type || undefined, content_json: textToTiptap(contentText), content_text: contentText }
          : t
      ),
    }))
    ;(async () => {
      await supabase
        .from('templates')
        .update({ title, category: category || null, type: type || null, content_json: textToTiptap(contentText), content_text: contentText })
        .eq('id', id)
    })()
  },

  deleteTemplate: (id) => {
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
    ;(async () => {
      await supabase.from('templates').delete().eq('id', id)
    })()
  },
})

function textToTiptap(text: string): JSONContent {
  const paragraphs = text.split('\n').map((line) => ({
    type: 'paragraph' as const,
    content: line ? [{ type: 'text' as const, text: line }] : [],
  }))
  return { type: 'doc', content: paragraphs }
}

function extractText(json: JSONContent): string {
  if (!json.content) return ''
  return json.content
    .map((node) => {
      if (node.type === 'text') return node.text ?? ''
      if (node.content) return extractText(node)
      return ''
    })
    .join('')
}

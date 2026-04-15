import type { StateCreator } from 'zustand'
import type { AppStore } from './index'
import type { JSONContent } from '@tiptap/react'
import type { Question, Answer, Template, SelectionType } from '@/types/app'
import { supabase } from '@/lib/supabase'

export interface EditorSlice {
  questions: Question[]
  activeQuestionId: string | null

  drafts: Answer[]
  activeDraftIndex: number

  editorContent: JSONContent | null
  isDirty: boolean
  templateApplySignal: number

  templates: Template[]

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
}

export const createEditorSlice: StateCreator<AppStore, [], [], EditorSlice> = (set, get) => ({
  questions: [],
  activeQuestionId: null,

  drafts: [],
  activeDraftIndex: 1,

  editorContent: null,
  isDirty: false,
  templateApplySignal: 0,

  templates: [],

  setQuestionsForSelection: (selectionId) => {
    set({ questions: [], activeQuestionId: null, drafts: [], editorContent: null, isDirty: false })
    const { userId } = get()
    if (!userId) return
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
    set({ activeQuestionId: id, drafts: [], activeDraftIndex: 1, editorContent: null, isDirty: false })
    const { userId } = get()
    if (!userId) return
    ;(async () => {
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .eq('user_id', userId)
        .order('draft_index')
      const drafts: Answer[] = data ?? []
      const firstDraft = drafts[0] ?? null
      set({
        drafts,
        activeDraftIndex: firstDraft?.draft_index ?? 1,
        editorContent: (firstDraft?.content_json as JSONContent | null) ?? null,
        isDirty: false,
      })
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
    const { activeQuestionId, activeDraftIndex, editorContent, drafts, userId } = get()
    if (!activeQuestionId || !editorContent || !userId) return

    const contentText = extractText(editorContent)
    const existingIndex = drafts.findIndex((d) => d.draft_index === activeDraftIndex)
    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      const updated = [...drafts]
      updated[existingIndex] = {
        ...updated[existingIndex],
        content_json: editorContent,
        content_text: contentText,
        updated_at: now,
      }
      set({ drafts: updated, isDirty: false })
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
      set({ drafts: [...drafts, newDraft], isDirty: false })
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
  },

  addQuestion: (body, charLimit) => {
    const { questions, userId } = get()
    const selectionId = questions[0]?.selection_id
    if (!selectionId || !userId) return
    const tmpId = `tmp-${Date.now()}`
    const newQuestion: Question = {
      id: tmpId,
      user_id: userId,
      selection_id: selectionId,
      body,
      char_limit: charLimit,
      sort_order: questions.length,
      created_at: new Date().toISOString(),
    }
    set({ questions: [...questions, newQuestion] })
    ;(async () => {
      const { data, error } = await supabase
        .from('questions')
        .insert({ user_id: userId, selection_id: selectionId, body, char_limit: charLimit ?? null, sort_order: questions.length })
        .select()
        .single()
      if (error) {
        set((s) => ({ questions: s.questions.filter((q) => q.id !== tmpId) }))
        return
      }
      set((s) => ({ questions: s.questions.map((q) => (q.id === tmpId ? data : q)) }))
    })()
  },

  deleteQuestion: (id) => {
    const { questions, activeQuestionId } = get()
    set({
      questions: questions.filter((q) => q.id !== id),
      activeQuestionId: activeQuestionId === id ? null : activeQuestionId,
    })
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

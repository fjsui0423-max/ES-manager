import type { StateCreator } from 'zustand'
import type { JSONContent } from '@tiptap/react'
import type { Question, Answer, Template, SelectionType } from '@/types/app'
import { MOCK_QUESTIONS, MOCK_ANSWERS, MOCK_TEMPLATES } from '@/lib/mockData'

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

export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set, get) => ({
  questions: [],
  activeQuestionId: null,

  drafts: [],
  activeDraftIndex: 1,

  editorContent: null,
  isDirty: false,
  templateApplySignal: 0,

  templates: [...MOCK_TEMPLATES],

  setQuestionsForSelection: (selectionId) => {
    const questions = MOCK_QUESTIONS.filter((q) => q.selection_id === selectionId)
    set({ questions, activeQuestionId: null, drafts: [], editorContent: null })
  },

  setActiveQuestion: (id) => {
    const drafts = MOCK_ANSWERS.filter((a) => a.question_id === id)
      .sort((a, b) => a.draft_index - b.draft_index)
    const firstDraft = drafts[0] ?? null
    set({
      activeQuestionId: id,
      drafts,
      activeDraftIndex: 1,
      editorContent: firstDraft?.content_json as JSONContent | null,
      isDirty: false,
    })
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
    const { activeQuestionId, activeDraftIndex, editorContent, drafts } = get()
    if (!activeQuestionId || !editorContent) return

    const contentText = extractText(editorContent)
    const existingIndex = drafts.findIndex((d) => d.draft_index === activeDraftIndex)

    if (existingIndex >= 0) {
      const updated = [...drafts]
      updated[existingIndex] = {
        ...updated[existingIndex],
        content_json: editorContent,
        content_text: contentText,
        updated_at: new Date().toISOString(),
      }
      set({ drafts: updated, isDirty: false })
    } else {
      const newDraft: Answer = {
        id: `ans-${Date.now()}`,
        user_id: 'user-1',
        question_id: activeQuestionId,
        draft_index: activeDraftIndex,
        content_json: editorContent,
        content_text: contentText,
        is_active: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      set({ drafts: [...drafts, newDraft], isDirty: false })
    }
  },

  addDraft: () => {
    const { drafts, activeQuestionId } = get()
    if (!activeQuestionId) return
    const nextIndex = drafts.length > 0 ? Math.max(...drafts.map((d) => d.draft_index)) + 1 : 1
    const newDraft: Answer = {
      id: `ans-${Date.now()}`,
      user_id: 'user-1',
      question_id: activeQuestionId,
      draft_index: nextIndex,
      content_json: null,
      content_text: '',
      is_active: false,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
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
    const { questions, activeQuestionId } = get()
    const selectionId = questions[0]?.selection_id
    if (!selectionId) return
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      user_id: 'user-1',
      selection_id: selectionId,
      body,
      char_limit: charLimit,
      sort_order: questions.length,
      created_at: new Date().toISOString(),
    }
    set({ questions: [...questions, newQuestion] })
    MOCK_QUESTIONS.push(newQuestion)
  },

  deleteQuestion: (id) => {
    const { questions, activeQuestionId } = get()
    set({
      questions: questions.filter((q) => q.id !== id),
      activeQuestionId: activeQuestionId === id ? null : activeQuestionId,
    })
  },

  addTemplate: (title, category, type, contentText) => {
    const { templates } = get()
    const newTemplate: Template = {
      id: `tmpl-${Date.now()}`,
      user_id: 'user-1',
      title,
      content_json: textToTiptap(contentText),
      content_text: contentText,
      category: category || undefined,
      type: type || undefined,
      created_at: new Date().toISOString(),
    }
    set({ templates: [...templates, newTemplate] })
  },

  updateTemplate: (id, title, category, type, contentText) => {
    const { templates } = get()
    set({
      templates: templates.map((t) =>
        t.id === id
          ? { ...t, title, category: category || undefined, type: type || undefined, content_json: textToTiptap(contentText), content_text: contentText }
          : t
      ),
    })
  },

  deleteTemplate: (id) => {
    const { templates } = get()
    set({ templates: templates.filter((t) => t.id !== id) })
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

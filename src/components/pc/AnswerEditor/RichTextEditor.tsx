'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, UnderlineIcon, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/store'
import type { JSONContent } from '@tiptap/react'

/** ストアの editorContent から文字数を計算する（タブ切替時に即座に正確な値を返すため Tiptap の characterCount は使わない） */
function countContent(json: JSONContent | null): number {
  if (!json?.content) return 0
  return json.content.reduce((sum, node) => {
    if (node.type === 'text') return sum + (node.text?.length ?? 0)
    if (node.content) return sum + countContent(node as JSONContent)
    return sum
  }, 0)
}

const DEBOUNCE_MS = 1500

interface RichTextEditorProps {
  charLimit?: number
}

export function RichTextEditor({ charLimit }: RichTextEditorProps) {
  const editorContent = useStore((s) => s.editorContent)
  const setEditorContent = useStore((s) => s.setEditorContent)
  const markSaved = useStore((s) => s.markSaved)
  const isDirty = useStore((s) => s.isDirty)
  const activeQuestionId = useStore((s) => s.activeQuestionId)
  const activeDraftIndex = useStore((s) => s.activeDraftIndex)
  const templateApplySignal = useStore((s) => s.templateApplySignal)
  const contentLoadSignal = useStore((s) => s.contentLoadSignal)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'ここに回答を入力してください...' }),
    ],
    content: editorContent ?? '',
    onUpdate: ({ editor }) => {
      if (isInternalUpdate.current) return
      const json = editor.getJSON() as JSONContent
      setEditorContent(json)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => markSaved(), DEBOUNCE_MS)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full px-4 py-3',
      },
    },
    immediatelyRender: false,
  })

  // Effect A: 設問・ドラフト切替時、またはサーバーからの内容ロード完了時にエディタ内容を同期する
  useEffect(() => {
    if (!editor) return
    isInternalUpdate.current = true
    if (editorContent) {
      editor.commands.setContent(editorContent)
    } else {
      editor.commands.clearContent()
    }
    Promise.resolve().then(() => { isInternalUpdate.current = false })
  }, [activeQuestionId, activeDraftIndex, contentLoadSignal, editor]) // eslint-disable-line react-hooks/exhaustive-deps

  // Effect B: テンプレート適用時（Tiptap エディタの表示を更新する）
  // 保存は applyTemplate() 内で get().markSaved() により同期的に完了済み
  useEffect(() => {
    if (!editor || templateApplySignal === 0) return // 初回マウントはスキップ
    isInternalUpdate.current = true
    if (editorContent) {
      editor.commands.setContent(editorContent)
    } else {
      editor.commands.clearContent()
    }
    Promise.resolve().then(() => {
      isInternalUpdate.current = false
    })
  }, [templateApplySignal]) // eslint-disable-line react-hooks/exhaustive-deps

  // アンマウント時に保存
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
        markSaved()
      }
    }
  }, [])

  const charCount = countContent(editorContent)
  const pct = charLimit ? charCount / charLimit : null

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border shrink-0 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="太字"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="斜体"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="下線"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="箇条書き"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="番号付きリスト"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="元に戻す"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="やり直す"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="ml-auto flex items-center gap-2">
          {isDirty && (
            <span className="text-[10px] text-muted-foreground">編集中...</span>
          )}
          {!isDirty && activeQuestionId && (
            <span className="text-[10px] text-muted-foreground">保存済み</span>
          )}
          {charLimit && (
            <span className={`text-xs font-mono tabular-nums ${
              pct !== null && pct >= 1 ? 'text-red-500 font-semibold' :
              pct !== null && pct >= 0.8 ? 'text-yellow-500' :
              'text-muted-foreground'
            }`}>
              {charCount} / {charLimit}
            </span>
          )}
        </div>
      </div>

      {/* エディタ本体 */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

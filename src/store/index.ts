import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createTreeSlice, type TreeSlice } from './treeSlice'
import { createEditorSlice, type EditorSlice } from './editorSlice'
import { createUISlice, type UISlice } from './uiSlice'

export type AppStore = TreeSlice & EditorSlice & UISlice

export const useStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createTreeSlice(...args),
      ...createEditorSlice(...args),
      ...createUISlice(...args),
    }),
    { name: 'ESManager' }
  )
)

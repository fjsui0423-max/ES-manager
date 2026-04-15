import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createTreeSlice, type TreeSlice } from './treeSlice'
import { createEditorSlice, type EditorSlice } from './editorSlice'
import { createUISlice, type UISlice } from './uiSlice'
import { createAuthSlice, type AuthSlice } from './authSlice'

export type AppStore = TreeSlice & EditorSlice & UISlice & AuthSlice

export const useStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createTreeSlice(...args),
      ...createEditorSlice(...args),
      ...createUISlice(...args),
      ...createAuthSlice(...args),
    }),
    { name: 'ESManager' }
  )
)

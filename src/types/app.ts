export type SelectionType = 'internship' | 'main' | 'other'

export type SelectionStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'passed_doc'
  | 'interview'
  | 'offered'
  | 'rejected'
  | 'declined'

export interface Industry {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Company {
  id: string
  user_id: string
  industry_id: string
  name: string
  website_url?: string
  logo_url?: string
  sort_order: number
  created_at: string
}

export interface Selection {
  id: string
  user_id: string
  company_id: string
  type: SelectionType
  label?: string
  status: SelectionStatus
  deadline?: string
  sort_order: number
  created_at: string
}

export interface Question {
  id: string
  user_id: string
  selection_id: string
  body: string
  char_limit?: number
  deadline?: string
  sort_order: number
  created_at: string
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  draft_index: number
  content_json: object | null
  content_text: string
  is_active: boolean
  updated_at: string
  created_at: string
}

export interface Template {
  id: string
  user_id: string
  title: string
  content_json: object | null
  content_text: string
  category?: string
  type?: SelectionType
  created_at: string
}

export const STATUS_LABELS: Record<SelectionStatus, string> = {
  not_started: '未着手',
  in_progress: '進行中',
  submitted: '提出済',
  passed_doc: '書類通過',
  interview: '面接中',
  offered: '内定',
  rejected: '不合格',
  declined: '辞退',
}

export const TYPE_LABELS: Record<SelectionType, string> = {
  internship: 'インターン',
  main: '本選考',
  other: 'その他',
}

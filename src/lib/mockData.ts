import type { Industry, Company, Selection, Question, Answer, Template } from '@/types/app'

export const MOCK_INDUSTRIES: Industry[] = [
  { id: 'ind-1', user_id: 'user-1', name: 'IT・通信', sort_order: 0, created_at: '' },
  { id: 'ind-2', user_id: 'user-1', name: '金融・保険', sort_order: 1, created_at: '' },
  { id: 'ind-3', user_id: 'user-1', name: 'コンサルティング', sort_order: 2, created_at: '' },
]

export const MOCK_COMPANIES: Company[] = [
  { id: 'co-1', user_id: 'user-1', industry_id: 'ind-1', name: '株式会社サンプルテック', sort_order: 0, created_at: '' },
  { id: 'co-2', user_id: 'user-1', industry_id: 'ind-1', name: 'テスト情報システム', sort_order: 1, created_at: '' },
  { id: 'co-3', user_id: 'user-1', industry_id: 'ind-2', name: 'モック銀行', sort_order: 0, created_at: '' },
]

export const MOCK_SELECTIONS: Selection[] = [
  { id: 'sel-1', user_id: 'user-1', company_id: 'co-1', type: 'main', label: '25卒 本選考', status: 'in_progress', deadline: '2026-05-31T23:59', sort_order: 0, created_at: '' },
  { id: 'sel-2', user_id: 'user-1', company_id: 'co-1', type: 'internship', label: '夏インターン', status: 'submitted', deadline: '2026-04-20T23:59', sort_order: 1, created_at: '' },
  { id: 'sel-3', user_id: 'user-1', company_id: 'co-2', type: 'main', label: '25卒 本選考', status: 'not_started', sort_order: 0, created_at: '' },
  { id: 'sel-4', user_id: 'user-1', company_id: 'co-3', type: 'main', label: '25卒 本選考', status: 'not_started', deadline: '2026-04-17T23:59', sort_order: 0, created_at: '' },
]

export const MOCK_QUESTIONS: Question[] = [
  { id: 'q-1', user_id: 'user-1', selection_id: 'sel-1', body: '学生時代に最も力を入れたことを教えてください（400字以内）', char_limit: 400, sort_order: 0, created_at: '' },
  { id: 'q-2', user_id: 'user-1', selection_id: 'sel-1', body: '自己PRをしてください（300字以内）', char_limit: 300, sort_order: 1, created_at: '' },
  { id: 'q-3', user_id: 'user-1', selection_id: 'sel-1', body: '志望動機を教えてください（500字以内）', char_limit: 500, sort_order: 2, created_at: '' },
  { id: 'q-4', user_id: 'user-1', selection_id: 'sel-2', body: 'インターンを志望する理由を教えてください（200字以内）', char_limit: 200, sort_order: 0, created_at: '' },
]

export const MOCK_ANSWERS: Answer[] = [
  {
    id: 'ans-1', user_id: 'user-1', question_id: 'q-1', draft_index: 1,
    content_json: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '大学のプログラミングサークルでリーダーを務め、チームで開発したアプリが学内コンテストで優勝しました。' }] }]
    },
    content_text: '大学のプログラミングサークルでリーダーを務め、チームで開発したアプリが学内コンテストで優勝しました。',
    is_active: true,
    updated_at: '', created_at: '',
  },
  {
    id: 'ans-2', user_id: 'user-1', question_id: 'q-1', draft_index: 2,
    content_json: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ゼミ活動でデータ分析のプロジェクトリーダーを担当し、研究発表会で最優秀賞を受賞しました。' }] }]
    },
    content_text: 'ゼミ活動でデータ分析のプロジェクトリーダーを担当し、研究発表会で最優秀賞を受賞しました。',
    is_active: false,
    updated_at: '', created_at: '',
  },
]

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tmpl-1', user_id: 'user-1', title: '自己PR テンプレート', category: '自己PR',
    content_json: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '私の強みは〇〇です。この強みは、〇〇という経験を通じて身につけました。具体的には〇〇を行い、〇〇という成果を出しました。この経験で得た〇〇を、貴社の〇〇業務に活かしたいと考えています。' }] }]
    },
    content_text: '私の強みは〇〇です。この強みは、〇〇という経験を通じて身につけました。具体的には〇〇を行い、〇〇という成果を出しました。この経験で得た〇〇を、貴社の〇〇業務に活かしたいと考えています。',
    created_at: '',
  },
  {
    id: 'tmpl-2', user_id: 'user-1', title: 'ガクチカ テンプレート', category: 'ガクチカ',
    content_json: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '学生時代に最も力を入れたことは〇〇です。【背景】〇〇という課題がありました。【行動】私は〇〇と考え、〇〇という行動を取りました。【結果】その結果、〇〇という成果を達成しました。この経験から〇〇を学びました。' }] }]
    },
    content_text: '学生時代に最も力を入れたことは〇〇です。【背景】〇〇という課題がありました。【行動】私は〇〇と考え、〇〇という行動を取りました。【結果】その結果、〇〇という成果を達成しました。この経験から〇〇を学びました。',
    created_at: '',
  },
  {
    id: 'tmpl-3', user_id: 'user-1', title: '志望動機 テンプレート', category: '志望動機',
    content_json: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '私が貴社を志望する理由は〇〇です。貴社の〇〇という事業に強い関心を持ち、〇〇という強みを活かして貢献したいと考えています。また、〇〇という経験から、〇〇の重要性を実感しており、貴社でこそ〇〇を実現できると確信しています。' }] }]
    },
    content_text: '私が貴社を志望する理由は〇〇です。貴社の〇〇という事業に強い関心を持ち、〇〇という強みを活かして貢献したいと考えています。また、〇〇という経験から、〇〇の重要性を実感しており、貴社でこそ〇〇を実現できると確信しています。',
    created_at: '',
  },
]

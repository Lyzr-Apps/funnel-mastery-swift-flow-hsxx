export type Screen = 'dashboard' | 'generator' | 'content-bank' | 'calendar' | 'email' | 'analytics' | 'settings'

export interface AdCopy { platform: string; headline: string; body: string; cta: string }
export interface Hook { type: string; text: string }
export interface ScriptItem { format: string; script: string }
export interface EmailItem { order: number; subject_line: string; subject_line_variant: string; preview_text: string; body: string; cta: string; delay_days: number }
export interface EmailSequence { sequence_type: string; emails: EmailItem[] }
export interface SocialPost { platform: string; content_type: string; caption: string; hashtags: string[]; cta: string; best_posting_time: string }
export interface ContentData {
  campaign_summary?: string
  ad_copies?: AdCopy[]
  hooks?: Hook[]
  scripts?: ScriptItem[]
  email_sequences?: EmailSequence[]
  social_posts?: SocialPost[]
}

export interface ContentBankItem {
  id: string; type: 'ad' | 'email' | 'social' | 'script' | 'hook'
  content: string; title: string; platform?: string; status: 'draft' | 'approved' | 'published'
  imageUrl?: string; raw?: any
}

export interface CalendarEvent { id: string; date: string; platform: string; content: string; status: 'queued' | 'scheduled' | 'published' }

export interface KpiItem { metric: string; value: string; trend: string; insight: string }
export interface AbTestResult { test_name: string; variant_a: string; variant_b: string; winner: string; confidence: string }
export interface OptSuggestion { area: string; suggestion: string; expected_impact: string; priority: string }
export interface TrafficItem { source: string; clicks: string; conversions: string; epc: string }

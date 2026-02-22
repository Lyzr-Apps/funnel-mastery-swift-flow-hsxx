'use client'

import { useState, useCallback } from 'react'
import { callAIAgent, type AIAgentResponse } from '@/lib/aiAgent'
import {
  FiHome, FiEdit3, FiArchive, FiCalendar, FiMail, FiBarChart2,
  FiImage, FiSend, FiZap, FiTrendingUp, FiTrendingDown, FiUsers,
  FiDollarSign, FiTarget, FiCheck, FiX, FiLoader, FiChevronRight,
  FiSearch, FiEye, FiTrash2,
  FiExternalLink, FiCopy
} from 'react-icons/fi'
import {
  BsFacebook, BsInstagram, BsPinterest, BsLinkedin, BsTiktok, BsTwitterX
} from 'react-icons/bs'

// ─── Agent IDs ────────────────────────────────────────────
const AGENT_IDS = {
  CONTENT_ORCHESTRATOR: '699a247e738daf1ab82e84fe',
  IMAGE_CREATOR: '699a24ad8a81cf15f59e03b0',
  DISTRIBUTION: '699a24ca520a48afa0342d47',
  EMAIL_AUTOMATION: '699a24cb8a81cf15f59e03b4',
  ANALYTICS: '699a24ae4274f089c16d43f7',
} as const

// ─── Types ────────────────────────────────────────────────
type Screen = 'dashboard' | 'generator' | 'content-bank' | 'calendar' | 'email' | 'analytics'

interface AdCopy { platform: string; headline: string; body: string; cta: string }
interface Hook { type: string; text: string }
interface Script { format: string; script: string }
interface EmailItem { order: number; subject_line: string; subject_line_variant: string; preview_text: string; body: string; cta: string; delay_days: number }
interface EmailSequence { sequence_type: string; emails: EmailItem[] }
interface SocialPost { platform: string; content_type: string; caption: string; hashtags: string[]; cta: string; best_posting_time: string }
interface ContentData {
  campaign_summary?: string
  ad_copies?: AdCopy[]
  hooks?: Hook[]
  scripts?: Script[]
  email_sequences?: EmailSequence[]
  social_posts?: SocialPost[]
}

interface ContentBankItem {
  id: string; type: 'ad' | 'email' | 'social' | 'script' | 'hook'
  content: string; title: string; platform?: string; status: 'draft' | 'approved' | 'published'
  imageUrl?: string; raw?: any
}

interface CalendarEvent { id: string; date: string; platform: string; content: string; status: 'queued' | 'scheduled' | 'published' }

interface KpiItem { metric: string; value: string; trend: string; insight: string }
interface AbTestResult { test_name: string; variant_a: string; variant_b: string; winner: string; confidence: string }
interface OptSuggestion { area: string; suggestion: string; expected_impact: string; priority: string }
interface TrafficItem { source: string; clicks: string; conversions: string; epc: string }

// ─── Platform helpers ─────────────────────────────────────
const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: BsFacebook, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: BsInstagram, color: '#E4405F' },
  { id: 'pinterest', label: 'Pinterest', icon: BsPinterest, color: '#BD081C' },
  { id: 'linkedin', label: 'LinkedIn', icon: BsLinkedin, color: '#0A66C2' },
  { id: 'tiktok', label: 'TikTok', icon: BsTiktok, color: '#000000' },
  { id: 'x', label: 'X', icon: BsTwitterX, color: '#000000' },
]

const PRODUCTS = [
  'Coloring Book Journey',
  'Adoptee Checklist',
  'Guide',
  'Journal',
  'Tedswoodworking+ Affiliate',
]

const SEQUENCE_TYPES = ['welcome', 'pitch', 'follow-up', 'abandoned_funnel', 'upsell', 'bonus_delivery', 'newsletter']

function getPlatformIcon(p: string) {
  const pl = p.toLowerCase()
  if (pl.includes('facebook')) return <BsFacebook className="text-[#1877F2]" />
  if (pl.includes('instagram')) return <BsInstagram className="text-[#E4405F]" />
  if (pl.includes('pinterest')) return <BsPinterest className="text-[#BD081C]" />
  if (pl.includes('linkedin')) return <BsLinkedin className="text-[#0A66C2]" />
  if (pl.includes('tiktok')) return <BsTiktok />
  if (pl.includes('x') || pl.includes('twitter')) return <BsTwitterX />
  return <FiExternalLink />
}

// ─── Safe parsing helper ──────────────────────────────────
function safeParseResult(result: AIAgentResponse): Record<string, any> {
  try {
    if (!result?.response?.result) return {}
    const r = result.response.result
    if (typeof r === 'string') {
      try { return JSON.parse(r) } catch { return { text: r } }
    }
    return r
  } catch { return {} }
}

function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : []
}

// ─── Reusable components ──────────────────────────────────
function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[0.875rem] border border-white/[0.18] bg-[hsl(30,40%,96%)]/75 backdrop-blur-[16px] shadow-md ${className}`}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-[hsl(30,30%,90%)] text-[hsl(20,25%,45%)]',
    approved: 'bg-green-100 text-green-700',
    published: 'bg-[hsl(24,95%,53%)]/10 text-[hsl(24,95%,53%)]',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    queued: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function PrimaryButton({ children, onClick, disabled, loading, className = '' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.875rem] font-semibold text-sm
        bg-[hsl(24,95%,53%)] text-white hover:bg-[hsl(24,95%,48%)] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${className}`}
    >
      {loading && <FiLoader className="animate-spin" size={16} />}
      {children}
    </button>
  )
}

function SecondaryButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-[0.875rem] text-sm font-medium
        border border-[hsl(30,35%,88%)] text-[hsl(20,40%,15%)] bg-[hsl(30,35%,92%)]
        hover:bg-[hsl(30,35%,88%)] transition-all ${className}`}
    >
      {children}
    </button>
  )
}

function InlineMessage({ type, message }: { type: 'success' | 'error' | 'info' | 'loading'; message: string }) {
  const styles: Record<string, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    loading: 'bg-[hsl(24,95%,53%)]/5 text-[hsl(24,95%,53%)] border-[hsl(24,95%,53%)]/20',
  }
  const icons: Record<string, React.ReactNode> = {
    success: <FiCheck size={16} />,
    error: <FiX size={16} />,
    info: <FiEye size={16} />,
    loading: <FiLoader size={16} className="animate-spin" />,
  }
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-[0.875rem] border text-sm ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <GlassCard className="p-4 animate-pulse">
      <div className="h-4 bg-[hsl(30,30%,90%)] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[hsl(30,30%,90%)] rounded w-full mb-2" />
      <div className="h-3 bg-[hsl(30,30%,90%)] rounded w-5/6" />
    </GlassCard>
  )
}

function EmptyState({ icon, title, description, action, onAction }: {
  icon: React.ReactNode; title: string; description: string; action?: string; onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[hsl(30,30%,90%)] flex items-center justify-center mb-4 text-[hsl(20,25%,45%)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[hsl(20,40%,10%)] mb-1">{title}</h3>
      <p className="text-sm text-[hsl(20,25%,45%)] max-w-sm mb-4">{description}</p>
      {action && onAction && <PrimaryButton onClick={onAction}>{action}</PrimaryButton>}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────
function Sidebar({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  const items: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
    { id: 'generator', label: 'Content Generator', icon: <FiEdit3 size={18} /> },
    { id: 'content-bank', label: 'Content Bank', icon: <FiArchive size={18} /> },
    { id: 'calendar', label: 'Content Calendar', icon: <FiCalendar size={18} /> },
    { id: 'email', label: 'Email Automation', icon: <FiMail size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 size={18} /> },
  ]
  return (
    <aside className="w-60 min-h-screen bg-[hsl(30,38%,95%)] border-r border-[hsl(30,35%,88%)] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-[hsl(30,35%,88%)]">
        <h1 className="text-xl font-bold tracking-[-0.01em] text-[hsl(20,40%,10%)] font-serif">FunnelForge</h1>
        <p className="text-xs text-[hsl(20,25%,45%)] mt-0.5">Sales Funnel Automation</p>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.875rem] text-sm font-medium transition-all
              ${active === item.id
                ? 'bg-[hsl(24,95%,53%)] text-white shadow-md'
                : 'text-[hsl(20,40%,10%)] hover:bg-[hsl(30,35%,90%)]'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[hsl(30,35%,88%)]">
        <p className="text-[10px] text-[hsl(20,25%,45%)]">Powered by AI Agents</p>
      </div>
    </aside>
  )
}

// ─── Dashboard Screen ─────────────────────────────────────
function DashboardScreen({ onNavigate, contentBank, calendarItems }: {
  onNavigate: (s: Screen) => void; contentBank: ContentBankItem[]; calendarItems: CalendarEvent[]
}) {
  const kpis = [
    { label: 'Total Leads', value: '1,284', trend: '+12%', up: true, icon: <FiUsers size={18} /> },
    { label: 'Conversion Rate', value: '3.8%', trend: '+0.5%', up: true, icon: <FiTarget size={18} /> },
    { label: 'EPC', value: '$2.47', trend: '+$0.12', up: true, icon: <FiDollarSign size={18} /> },
    { label: 'Revenue', value: '$8,942', trend: '+18%', up: true, icon: <FiDollarSign size={18} /> },
    { label: 'Active Sequences', value: '4', trend: 'stable', up: true, icon: <FiMail size={18} /> },
    { label: 'Scheduled Posts', value: String(calendarItems.length || 12), trend: '+3', up: true, icon: <FiCalendar size={18} /> },
  ]

  const recentActivity = [
    { text: 'Campaign content generated for Coloring Book Journey', time: '2 min ago' },
    { text: '3 posts scheduled for Facebook & Instagram', time: '15 min ago' },
    { text: 'Welcome email sequence activated', time: '1 hr ago' },
    { text: 'New lead captured from Pinterest ad', time: '2 hrs ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em] font-serif">Dashboard</h2>
          <p className="text-sm text-[hsl(20,25%,45%)]">Campaign overview and quick actions</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <GlassCard key={kpi.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[hsl(20,25%,45%)]">{kpi.icon}</span>
              <span className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em]">{kpi.value}</p>
            <p className="text-xs text-[hsl(20,25%,45%)] mt-1">{kpi.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <PrimaryButton onClick={() => onNavigate('generator')} className="w-full justify-center">
              <FiZap size={16} /> Generate Campaign Content
            </PrimaryButton>
            <SecondaryButton onClick={() => onNavigate('calendar')} className="w-full justify-center">
              <FiCalendar size={16} /> View Calendar
            </SecondaryButton>
            <SecondaryButton onClick={() => onNavigate('analytics')} className="w-full justify-center">
              <FiBarChart2 size={16} /> Check Analytics
            </SecondaryButton>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-[hsl(24,95%,53%)] shrink-0" />
                <div>
                  <p className="text-sm text-[hsl(20,40%,10%)] leading-snug">{a.text}</p>
                  <p className="text-xs text-[hsl(20,25%,45%)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Content Bank Summary */}
      {contentBank.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[hsl(20,40%,10%)]">Content Bank</h3>
            <SecondaryButton onClick={() => onNavigate('content-bank')}>
              View All <FiChevronRight size={14} />
            </SecondaryButton>
          </div>
          <p className="text-sm text-[hsl(20,25%,45%)]">{contentBank.length} content pieces generated</p>
        </GlassCard>
      )}
    </div>
  )
}

// ─── Content Generator Screen ─────────────────────────────
function GeneratorScreen({ onGenerated }: { onGenerated: (data: ContentData) => void }) {
  const [product, setProduct] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [brief, setBrief] = useState('')
  const [contentTypes, setContentTypes] = useState<string[]>(['ads', 'emails', 'social', 'scripts', 'hooks'])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const toggleContentType = (t: string) => {
    setContentTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const handleGenerate = useCallback(async () => {
    if (!product) { setStatusMsg({ type: 'error', message: 'Please select a product' }); return }
    if (platforms.length === 0) { setStatusMsg({ type: 'error', message: 'Please select at least one platform' }); return }

    setLoading(true)
    setStatusMsg(null)
    setProgress('Analyzing campaign brief...')

    const message = `Generate a complete campaign content suite for the following:
Product: ${product}
Target Platforms: ${platforms.join(', ')}
Campaign Brief: ${brief || 'Create engaging, value-driven content that connects emotionally with the target audience.'}
Content Types Needed: ${contentTypes.join(', ')}
Generate platform-specific ad copy, hooks, email sequences, social posts, and scripts. Maintain an empathetic, value-driven brand voice.`

    try {
      setProgress('Dispatching to sub-agents...')
      setTimeout(() => { if (loading) setProgress('Generating ad copy and hooks...') }, 3000)
      setTimeout(() => { if (loading) setProgress('Creating email sequences...') }, 8000)
      setTimeout(() => { if (loading) setProgress('Producing social posts...') }, 14000)

      const result = await callAIAgent(message, AGENT_IDS.CONTENT_ORCHESTRATOR)

      if (result.success) {
        const data = safeParseResult(result)
        onGenerated(data as ContentData)
        setStatusMsg({ type: 'success', message: 'Campaign content generated successfully!' })
        setProgress('')
      } else {
        setStatusMsg({ type: 'error', message: result.error || 'Failed to generate content' })
        setProgress('')
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err?.message || 'Generation failed' })
      setProgress('')
    } finally {
      setLoading(false)
    }
  }, [product, platforms, brief, contentTypes, loading, onGenerated])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em] font-serif">Content Generator</h2>
        <p className="text-sm text-[hsl(20,25%,45%)]">Configure and generate AI-powered campaign content</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Panel - Config */}
        <div className="col-span-3 space-y-5">
          <GlassCard className="p-5 space-y-4">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-1.5">Product / Offer</label>
              <select
                value={product}
                onChange={e => setProduct(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(30,35%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(24,95%,53%)] focus:border-transparent outline-none"
              >
                <option value="">Select a product...</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-1.5">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const Icon = p.icon
                  const selected = platforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${selected
                          ? 'bg-[hsl(24,95%,53%)] text-white border-[hsl(24,95%,53%)]'
                          : 'bg-white text-[hsl(20,40%,15%)] border-[hsl(30,35%,88%)] hover:border-[hsl(24,95%,53%)]'
                        }`}
                    >
                      <Icon size={13} /> {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Brief */}
            <div>
              <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-1.5">Campaign Brief</label>
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={4}
                placeholder="Describe your target audience, goals, tone preferences..."
                className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(30,35%,88%)] bg-white text-sm resize-none focus:ring-2 focus:ring-[hsl(24,95%,53%)] focus:border-transparent outline-none"
              />
            </div>

            {/* Content Types */}
            <div>
              <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-1.5">Content Types</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ads', label: 'Ads' },
                  { id: 'emails', label: 'Emails' },
                  { id: 'social', label: 'Social Posts' },
                  { id: 'scripts', label: 'Scripts' },
                  { id: 'hooks', label: 'Hooks/Angles' },
                ].map(ct => (
                  <label key={ct.id} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentTypes.includes(ct.id)}
                      onChange={() => toggleContentType(ct.id)}
                      className="rounded border-[hsl(30,35%,88%)] text-[hsl(24,95%,53%)] focus:ring-[hsl(24,95%,53%)]"
                    />
                    <span className="text-sm text-[hsl(20,40%,10%)]">{ct.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <PrimaryButton onClick={handleGenerate} loading={loading} disabled={loading} className="w-full justify-center">
              <FiZap size={16} /> Generate Campaign Content
            </PrimaryButton>
          </GlassCard>
        </div>

        {/* Right Panel - Progress */}
        <div className="col-span-2 space-y-4">
          {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

          {loading && (
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-4">Generation Progress</h3>
              <div className="space-y-3">
                {['Analyzing campaign brief', 'Generating ad copy & hooks', 'Creating email sequences', 'Producing social posts', 'Aggregating results'].map((step, i) => {
                  const stepStatus = progress.toLowerCase().includes(step.split(' ')[0].toLowerCase()) ? 'active'
                    : progress && ['Aggregating', 'Producing', 'Creating', 'Generating', 'Dispatching'].findIndex(s => progress.includes(s)) > ['Analyzing', 'Generating', 'Creating', 'Producing', 'Aggregating'].indexOf(step.split(' ')[0]) ? 'done' : 'pending'
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        stepStatus === 'active' ? 'bg-[hsl(24,95%,53%)] text-white' :
                        stepStatus === 'done' ? 'bg-green-500 text-white' : 'bg-[hsl(30,30%,90%)] text-[hsl(20,25%,45%)]'
                      }`}>
                        {stepStatus === 'active' ? <FiLoader size={12} className="animate-spin" /> :
                         stepStatus === 'done' ? <FiCheck size={12} /> :
                         <span className="text-[10px]">{i + 1}</span>}
                      </div>
                      <span className={`text-sm ${stepStatus === 'active' ? 'text-[hsl(24,95%,53%)] font-medium' : 'text-[hsl(20,25%,45%)]'}`}>{step}</span>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          )}

          {!loading && !statusMsg && (
            <GlassCard className="p-5">
              <div className="text-center py-8">
                <FiEdit3 size={32} className="mx-auto text-[hsl(20,25%,45%)] mb-3" />
                <p className="text-sm text-[hsl(20,25%,45%)]">Configure your campaign and click generate to create content</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Content Bank Screen ──────────────────────────────────
function ContentBankScreen({ contentBank, setContentBank }: {
  contentBank: ContentBankItem[]; setContentBank: React.Dispatch<React.SetStateAction<ContentBankItem[]>>
}) {
  const [activeTab, setActiveTab] = useState<'ad' | 'email' | 'social' | 'script' | 'hook'>('ad')
  const [search, setSearch] = useState('')
  const [imageLoading, setImageLoading] = useState<string | null>(null)
  const [imageMsg, setImageMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const tabs: { id: 'ad' | 'email' | 'social' | 'script' | 'hook'; label: string }[] = [
    { id: 'ad', label: 'Ads' },
    { id: 'email', label: 'Emails' },
    { id: 'social', label: 'Social Posts' },
    { id: 'script', label: 'Scripts' },
    { id: 'hook', label: 'Hooks' },
  ]

  const filtered = contentBank.filter(item =>
    item.type === activeTab &&
    (search === '' || item.content.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase()))
  )

  const handleApprove = (id: string) => {
    setContentBank(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item))
  }

  const handleDelete = (id: string) => {
    setContentBank(prev => prev.filter(item => item.id !== id))
  }

  const handleGenerateImage = useCallback(async (item: ContentBankItem) => {
    setImageLoading(item.id)
    setImageMsg(null)
    try {
      const message = `Generate a compelling visual for this ${item.type} content:
Title: ${item.title}
Content: ${item.content.substring(0, 500)}
Platform: ${item.platform || 'general'}
Create an attention-grabbing, professional image that complements this marketing content.`

      const result = await callAIAgent(message, AGENT_IDS.IMAGE_CREATOR)
      if (result.success) {
        const images = result.module_outputs?.artifact_files
        if (Array.isArray(images) && images.length > 0) {
          const url = images[0].file_url
          setContentBank(prev => prev.map(ci => ci.id === item.id ? { ...ci, imageUrl: url } : ci))
          setImageMsg({ type: 'success', message: 'Image generated!' })
        } else {
          setImageMsg({ type: 'success', message: 'Image prompt created (check agent for visual)' })
        }
      } else {
        setImageMsg({ type: 'error', message: result.error || 'Image generation failed' })
      }
    } catch (err: any) {
      setImageMsg({ type: 'error', message: err?.message || 'Image generation failed' })
    } finally {
      setImageLoading(null)
    }
  }, [setContentBank])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em] font-serif">Content Bank</h2>
          <p className="text-sm text-[hsl(20,25%,45%)]">Review, edit, and manage generated content</p>
        </div>
      </div>

      {imageMsg && <InlineMessage type={imageMsg.type} message={imageMsg.message} />}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[hsl(30,35%,88%)]">
        {tabs.map(tab => {
          const count = contentBank.filter(i => i.type === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-[hsl(24,95%,53%)] text-[hsl(24,95%,53%)]'
                  : 'border-transparent text-[hsl(20,25%,45%)] hover:text-[hsl(20,40%,10%)]'
                }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold
                  ${activeTab === tab.id ? 'bg-[hsl(24,95%,53%)] text-white' : 'bg-[hsl(30,30%,90%)] text-[hsl(20,25%,45%)]'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(20,25%,45%)]" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search content..."
          className="w-full pl-10 pr-4 py-2.5 rounded-[0.875rem] border border-[hsl(30,35%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(24,95%,53%)] outline-none"
        />
      </div>

      {/* Content Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiArchive size={28} />}
          title="No content yet"
          description={`Generate campaign content to see ${activeTab}s here`}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(item => (
            <GlassCard key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.platform && getPlatformIcon(item.platform)}
                  <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] truncate max-w-[200px]">{item.title}</h4>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-[hsl(20,25%,45%)] leading-relaxed mb-3 line-clamp-3">{item.content}</p>
              {item.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-[hsl(30,35%,88%)]">
                  <img src={item.imageUrl} alt="" className="w-full h-32 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateImage(item)}
                  disabled={imageLoading === item.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(30,35%,92%)] text-[hsl(20,40%,15%)] hover:bg-[hsl(30,35%,88%)] transition-colors disabled:opacity-50"
                >
                  {imageLoading === item.id ? <FiLoader size={12} className="animate-spin" /> : <FiImage size={12} />}
                  Generate Image
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <FiCheck size={12} /> Approve
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 size={12} />
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(item.content) }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(30,35%,92%)] text-[hsl(20,40%,15%)] hover:bg-[hsl(30,35%,88%)] transition-colors"
                >
                  <FiCopy size={12} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Calendar Screen ──────────────────────────────────────
function CalendarScreen({ contentBank, calendarItems, setCalendarItems }: {
  contentBank: ContentBankItem[]; calendarItems: CalendarEvent[]; setCalendarItems: React.Dispatch<React.SetStateAction<CalendarEvent[]>>
}) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [postContent, setPostContent] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const approvedContent = contentBank.filter(c => c.status === 'approved')

  const handleDistribute = useCallback(async (instant = false) => {
    if (!postContent && approvedContent.length === 0) {
      setStatusMsg({ type: 'error', message: 'No content to distribute. Add post content or approve content in the Content Bank.' })
      return
    }
    setLoading(true)
    setStatusMsg(null)

    const message = `${instant ? 'INSTANT PUBLISH (Rocket Post)' : 'Schedule'} the following content:
Content: ${postContent || approvedContent[0]?.content || 'Campaign content ready for distribution'}
Platform: ${selectedPlatform || 'X (Twitter)'}
Scheduled Time: ${scheduleTime || new Date().toISOString()}
Add link tracking and optimize for the selected platform.`

    try {
      const result = await callAIAgent(message, AGENT_IDS.DISTRIBUTION)
      if (result.success) {
        const data = safeParseResult(result)
        const posts = safeArray<any>(data.scheduled_posts)
        const newEvents: CalendarEvent[] = posts.map((sp: any, i: number) => ({
          id: `cal-${Date.now()}-${i}`,
          date: sp.scheduled_time || scheduleTime || new Date().toISOString(),
          platform: sp.platform || selectedPlatform || 'X',
          content: sp.content_preview || postContent.substring(0, 100),
          status: instant ? 'published' as const : 'scheduled' as const,
        }))
        if (newEvents.length > 0) {
          setCalendarItems(prev => [...prev, ...newEvents])
        } else {
          setCalendarItems(prev => [...prev, {
            id: `cal-${Date.now()}`,
            date: scheduleTime || new Date().toISOString(),
            platform: selectedPlatform || 'X',
            content: postContent.substring(0, 100) || 'Scheduled post',
            status: instant ? 'published' : 'scheduled',
          }])
        }
        setStatusMsg({ type: 'success', message: data.message || (instant ? 'Content published!' : 'Content scheduled!') })
        setPostContent('')
      } else {
        setStatusMsg({ type: 'error', message: result.error || 'Distribution failed' })
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err?.message || 'Distribution failed' })
    } finally {
      setLoading(false)
    }
  }, [postContent, selectedPlatform, scheduleTime, approvedContent, setCalendarItems])

  // Generate week dates
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + i)
    return d
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em] font-serif">Content Calendar</h2>
          <p className="text-sm text-[hsl(20,25%,45%)]">Schedule and distribute content across platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={() => setView('week')} className={view === 'week' ? '!bg-[hsl(24,95%,53%)] !text-white !border-[hsl(24,95%,53%)]' : ''}>Week</SecondaryButton>
          <SecondaryButton onClick={() => setView('month')} className={view === 'month' ? '!bg-[hsl(24,95%,53%)] !text-white !border-[hsl(24,95%,53%)]' : ''}>Month</SecondaryButton>
        </div>
      </div>

      {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

      <div className="grid grid-cols-4 gap-6">
        {/* Calendar grid */}
        <div className="col-span-3">
          <GlassCard className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-[hsl(20,25%,45%)] py-2">{day}</div>
              ))}
              {weekDays.map((date, i) => {
                const dateStr = date.toISOString().split('T')[0]
                const dayEvents = calendarItems.filter(e => e.date.startsWith(dateStr))
                const isToday = dateStr === today.toISOString().split('T')[0]
                return (
                  <div key={i} className={`min-h-[100px] rounded-lg border p-2 ${isToday ? 'border-[hsl(24,95%,53%)] bg-[hsl(24,95%,53%)]/5' : 'border-[hsl(30,35%,88%)]'}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-[hsl(24,95%,53%)]' : 'text-[hsl(20,25%,45%)]'}`}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(ev => (
                        <div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(24,95%,53%)]/10 text-[hsl(24,95%,53%)] truncate flex items-center gap-1">
                          {getPlatformIcon(ev.platform)}
                          <span className="truncate">{ev.content.substring(0, 20)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar - Schedule Form */}
        <div className="space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[hsl(20,40%,10%)]">Schedule Post</h3>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Platform</label>
              <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]">
                <option value="">Select...</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Post Content</label>
              <textarea value={postContent} onChange={e => setPostContent(e.target.value)} rows={3}
                placeholder="Enter post content..."
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs resize-none outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Schedule Time</label>
              <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]" />
            </div>
            <PrimaryButton onClick={() => handleDistribute(false)} loading={loading} disabled={loading} className="w-full justify-center text-xs">
              <FiSend size={13} /> Schedule & Distribute
            </PrimaryButton>
            <button
              onClick={() => handleDistribute(true)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[0.875rem] text-xs font-semibold
                bg-[hsl(12,80%,50%)] text-white hover:bg-[hsl(12,80%,45%)] transition-all disabled:opacity-50 shadow-md"
            >
              <FiZap size={13} /> Rocket Post
            </button>
          </GlassCard>

          {/* Queue */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-3">Approved Queue ({approvedContent.length})</h3>
            {approvedContent.length === 0 ? (
              <p className="text-xs text-[hsl(20,25%,45%)]">Approve content in the Content Bank to queue it</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {approvedContent.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[hsl(30,35%,88%)]">
                    {item.platform && getPlatformIcon(item.platform)}
                    <span className="text-[11px] text-[hsl(20,40%,10%)] truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

// ─── Email Automation Screen ──────────────────────────────
function EmailScreen() {
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sequenceType, setSequenceType] = useState('welcome')
  const [activeSequences, setActiveSequences] = useState<Record<string, boolean>>({})
  const [lastResult, setLastResult] = useState<any>(null)

  const sequences = [
    { type: 'welcome', label: 'Welcome Sequence', desc: 'Introduce brand & deliver value', emails: 5, subscribers: 342 },
    { type: 'pitch', label: 'Product Pitch', desc: 'Build desire and close the sale', emails: 6, subscribers: 198 },
    { type: 'follow-up', label: 'Follow-Up', desc: 'Post-purchase engagement', emails: 4, subscribers: 156 },
    { type: 'abandoned_funnel', label: 'Abandoned Funnel', desc: 'Recover lost leads', emails: 3, subscribers: 89 },
    { type: 'upsell', label: 'Upsell', desc: 'Cross-sells and upgrades', emails: 4, subscribers: 124 },
    { type: 'bonus_delivery', label: 'Bonus Delivery', desc: 'Deliver and highlight bonuses', emails: 3, subscribers: 267 },
    { type: 'newsletter', label: 'Newsletter', desc: 'Regular value-driven updates', emails: 1, subscribers: 1024 },
  ]

  const handleActivate = useCallback(async () => {
    if (!recipientEmail) { setStatusMsg({ type: 'error', message: 'Please enter a recipient email' }); return }
    setLoading(true)
    setStatusMsg(null)

    const message = `Activate a ${sequenceType} email sequence:
Recipient Email: ${recipientEmail}
Subject: ${subject || `Your ${sequenceType} sequence has started`}
Email Body: ${emailBody || `This is an automated ${sequenceType} email from our nurture sequence.`}
Sequence Type: ${sequenceType}
Send the first email in this sequence via Gmail and set up the automation flow.`

    try {
      const result = await callAIAgent(message, AGENT_IDS.EMAIL_AUTOMATION)
      if (result.success) {
        const data = safeParseResult(result)
        setLastResult(data)
        setActiveSequences(prev => ({ ...prev, [sequenceType]: true }))
        setStatusMsg({ type: 'success', message: data.message || `${sequenceType} sequence activated!` })
      } else {
        setStatusMsg({ type: 'error', message: result.error || 'Activation failed' })
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err?.message || 'Activation failed' })
    } finally {
      setLoading(false)
    }
  }, [recipientEmail, subject, emailBody, sequenceType])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em] font-serif">Email Automation</h2>
        <p className="text-sm text-[hsl(20,25%,45%)]">Configure and manage email nurture sequences</p>
      </div>

      {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

      <div className="grid grid-cols-5 gap-6">
        {/* Sequence Cards */}
        <div className="col-span-3 space-y-3">
          {sequences.map(seq => (
            <GlassCard key={seq.type} className={`p-4 transition-all ${sequenceType === seq.type ? 'ring-2 ring-[hsl(24,95%,53%)]' : ''}`}
              onClick={() => setSequenceType(seq.type)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeSequences[seq.type] ? 'bg-green-100 text-green-600' : 'bg-[hsl(30,30%,90%)] text-[hsl(20,25%,45%)]'
                  }`}>
                    <FiMail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)]">{seq.label}</h4>
                    <p className="text-xs text-[hsl(20,25%,45%)]">{seq.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[hsl(20,25%,45%)]">{seq.emails} emails</p>
                    <p className="text-xs text-[hsl(20,25%,45%)]">{seq.subscribers} subscribers</p>
                  </div>
                  <StatusBadge status={activeSequences[seq.type] ? 'active' : 'paused'} />
                </div>
              </div>
              {/* Mini timeline */}
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: seq.emails }, (_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold
                      ${activeSequences[seq.type] ? 'bg-[hsl(24,95%,53%)] text-white' : 'bg-[hsl(30,30%,90%)] text-[hsl(20,25%,45%)]'}`}>
                      {i + 1}
                    </div>
                    {i < seq.emails - 1 && <div className={`w-4 h-0.5 ${activeSequences[seq.type] ? 'bg-[hsl(24,95%,53%)]' : 'bg-[hsl(30,30%,90%)]'}`} />}
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Activation Form */}
        <div className="col-span-2 space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[hsl(20,40%,10%)]">Activate Sequence</h3>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Sequence Type</label>
              <select value={sequenceType} onChange={e => setSequenceType(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]">
                {SEQUENCE_TYPES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Recipient Email</label>
              <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                placeholder="lead@example.com"
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Subject Line</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Welcome to your journey..."
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Email Body</label>
              <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4}
                placeholder="Enter the email content..."
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(30,35%,88%)] bg-white text-xs resize-none outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]" />
            </div>
            <PrimaryButton onClick={handleActivate} loading={loading} disabled={loading} className="w-full justify-center text-xs">
              <FiSend size={13} /> Activate Sequence
            </PrimaryButton>
          </GlassCard>

          {/* Result Summary */}
          {lastResult && (
            <GlassCard className="p-4">
              <h3 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-2">Last Activation</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(20,25%,45%)]">Status</span>
                  <StatusBadge status={lastResult.status || 'active'} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(20,25%,45%)]">Sequence</span>
                  <span className="text-[hsl(20,40%,10%)] font-medium">{lastResult.sequence_type || sequenceType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(20,25%,45%)]">Emails Queued</span>
                  <span className="text-[hsl(20,40%,10%)] font-medium">{lastResult.emails_queued || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(20,25%,45%)]">Next Email</span>
                  <span className="text-[hsl(20,40%,10%)] font-medium">{lastResult.next_email_time || 'Pending'}</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Performance Mini Cards */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-3">Email Performance</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Open Rate', value: '42.3%' },
                { label: 'Click Rate', value: '8.7%' },
                { label: 'Unsub Rate', value: '0.4%' },
              ].map(m => (
                <div key={m.label} className="text-center p-2 rounded-lg bg-white border border-[hsl(30,35%,88%)]">
                  <p className="text-sm font-bold text-[hsl(20,40%,10%)]">{m.value}</p>
                  <p className="text-[10px] text-[hsl(20,25%,45%)]">{m.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

// ─── Analytics Screen ─────────────────────────────────────
function AnalyticsScreen() {
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [metricsInput, setMetricsInput] = useState('')
  const [analyticsData, setAnalyticsData] = useState<{
    performance_summary?: string
    kpi_analysis?: KpiItem[]
    ab_test_results?: AbTestResult[]
    optimization_suggestions?: OptSuggestion[]
    traffic_breakdown?: TrafficItem[]
  } | null>(null)

  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    setStatusMsg(null)

    const message = `Analyze the following funnel performance data and provide optimization suggestions:

${metricsInput || `Campaign: Digital Products Funnel
Period: Last 30 days
Metrics:
- Total Clicks: 12,450
- EPC: $2.47
- Conversions: 478
- Conversion Rate: 3.84%
- Revenue: $8,942
- Refund Rate: 2.1%
- Active email sequences: 4
- Top traffic source: Facebook (45%), Pinterest (22%), Instagram (18%), X (10%), LinkedIn (5%)

A/B Tests Running:
- Landing page headline test (Variant A: "Transform Your Life" vs Variant B: "Start Your Journey")
- Ad image test (Photo vs Illustration)
- Email subject line test (Question vs Statement)

Please analyze performance, evaluate A/B tests, and provide optimization suggestions.`}`

    try {
      const result = await callAIAgent(message, AGENT_IDS.ANALYTICS)
      if (result.success) {
        const data = safeParseResult(result)
        setAnalyticsData(data)
        setStatusMsg({ type: 'success', message: 'Analysis complete!' })
      } else {
        setStatusMsg({ type: 'error', message: result.error || 'Analysis failed' })
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err?.message || 'Analysis failed' })
    } finally {
      setLoading(false)
    }
  }, [metricsInput])

  const kpis = safeArray<KpiItem>(analyticsData?.kpi_analysis)
  const abTests = safeArray<AbTestResult>(analyticsData?.ab_test_results)
  const suggestions = safeArray<OptSuggestion>(analyticsData?.optimization_suggestions)
  const traffic = safeArray<TrafficItem>(analyticsData?.traffic_breakdown)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em] font-serif">Analytics Dashboard</h2>
          <p className="text-sm text-[hsl(20,25%,45%)]">Performance tracking, A/B testing, and AI optimization</p>
        </div>
        <PrimaryButton onClick={handleAnalyze} loading={loading} disabled={loading}>
          <FiBarChart2 size={16} /> Analyze Performance
        </PrimaryButton>
      </div>

      {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

      {/* Input area */}
      <GlassCard className="p-4">
        <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-1.5">Campaign Metrics (optional - defaults provided)</label>
        <textarea
          value={metricsInput}
          onChange={e => setMetricsInput(e.target.value)}
          rows={3}
          placeholder="Paste your campaign metrics here, or leave blank to use sample data..."
          className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(30,35%,88%)] bg-white text-sm resize-none focus:ring-2 focus:ring-[hsl(24,95%,53%)] outline-none"
        />
      </GlassCard>

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {analyticsData && !loading && (
        <>
          {/* Performance Summary */}
          {analyticsData.performance_summary && (
            <GlassCard className="p-5">
              <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-2">Performance Summary</h3>
              <p className="text-sm text-[hsl(20,25%,45%)] leading-relaxed">{analyticsData.performance_summary}</p>
            </GlassCard>
          )}

          {/* KPI Cards */}
          {kpis.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-3">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                {kpis.map((kpi, i) => (
                  <GlassCard key={i} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[hsl(20,25%,45%)]">{kpi.metric}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        kpi.trend?.toLowerCase().includes('up') || kpi.trend?.includes('+') ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {kpi.trend?.toLowerCase().includes('up') || kpi.trend?.includes('+') ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[hsl(20,40%,10%)]">{kpi.value}</p>
                    <p className="text-xs text-[hsl(20,25%,45%)] mt-1">{kpi.insight}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Traffic Breakdown */}
          {traffic.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-4">Traffic Source Breakdown</h3>
              <div className="space-y-3">
                {traffic.map((t, i) => {
                  const maxClicks = Math.max(...traffic.map(tr => parseInt(tr.clicks?.replace(/,/g, '') || '0') || 1))
                  const pct = (parseInt(t.clicks?.replace(/,/g, '') || '0') / maxClicks) * 100
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(t.source)}
                          <span className="text-sm font-medium text-[hsl(20,40%,10%)]">{t.source}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[hsl(20,25%,45%)]">
                          <span>{t.clicks} clicks</span>
                          <span>{t.conversions} conv.</span>
                          <span className="font-semibold text-[hsl(24,95%,53%)]">${t.epc} EPC</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[hsl(30,30%,90%)]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[hsl(24,95%,53%)] to-[hsl(12,80%,50%)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          )}

          {/* A/B Tests + Suggestions */}
          <div className="grid grid-cols-2 gap-6">
            {/* A/B Tests */}
            {abTests.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-3">A/B Test Results</h3>
                <div className="space-y-3">
                  {abTests.map((test, i) => (
                    <GlassCard key={i} className="p-4">
                      <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-2">{test.test_name}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className={`p-2 rounded-lg text-xs border ${test.winner?.toLowerCase().includes('a') ? 'border-green-300 bg-green-50' : 'border-[hsl(30,35%,88%)]'}`}>
                          <p className="font-medium text-[hsl(20,40%,10%)]">Variant A</p>
                          <p className="text-[hsl(20,25%,45%)] mt-0.5">{test.variant_a}</p>
                          {test.winner?.toLowerCase().includes('a') && (
                            <span className="inline-flex items-center gap-1 mt-1 text-green-600 font-semibold"><FiCheck size={10} /> Winner</span>
                          )}
                        </div>
                        <div className={`p-2 rounded-lg text-xs border ${test.winner?.toLowerCase().includes('b') ? 'border-green-300 bg-green-50' : 'border-[hsl(30,35%,88%)]'}`}>
                          <p className="font-medium text-[hsl(20,40%,10%)]">Variant B</p>
                          <p className="text-[hsl(20,25%,45%)] mt-0.5">{test.variant_b}</p>
                          {test.winner?.toLowerCase().includes('b') && (
                            <span className="inline-flex items-center gap-1 mt-1 text-green-600 font-semibold"><FiCheck size={10} /> Winner</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[hsl(20,25%,45%)]">Confidence: {test.confidence}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-[hsl(20,40%,10%)] mb-3">AI Optimization Suggestions</h3>
                <div className="space-y-3">
                  {suggestions.map((s, i) => {
                    const priorityColors: Record<string, string> = {
                      high: 'bg-red-100 text-red-700',
                      medium: 'bg-yellow-100 text-yellow-700',
                      low: 'bg-green-100 text-green-700',
                    }
                    return (
                      <GlassCard key={i} className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-[hsl(24,95%,53%)]">{s.area}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[s.priority?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                            {s.priority}
                          </span>
                        </div>
                        <p className="text-sm text-[hsl(20,40%,10%)] mb-1">{s.suggestion}</p>
                        <p className="text-xs text-[hsl(20,25%,45%)]">Expected impact: {s.expected_impact}</p>
                      </GlassCard>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Default state */}
      {!analyticsData && !loading && (
        <EmptyState
          icon={<FiBarChart2 size={28} />}
          title="No analysis yet"
          description="Click 'Analyze Performance' to get AI-powered insights and optimization suggestions"
          action="Analyze Performance"
          onAction={handleAnalyze}
        />
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────
export default function FunnelForgePage() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const [contentBank, setContentBank] = useState<ContentBankItem[]>([])
  const [calendarItems, setCalendarItems] = useState<CalendarEvent[]>([])

  const handleContentGenerated = useCallback((data: ContentData) => {
    const items: ContentBankItem[] = []
    let counter = Date.now()

    // Ad Copies
    safeArray<AdCopy>(data.ad_copies).forEach(ad => {
      items.push({
        id: `cb-${counter++}`,
        type: 'ad',
        title: ad.headline || 'Ad Copy',
        content: ad.body || '',
        platform: ad.platform,
        status: 'draft',
        raw: ad,
      })
    })

    // Hooks
    safeArray<Hook>(data.hooks).forEach(hook => {
      items.push({
        id: `cb-${counter++}`,
        type: 'hook',
        title: `${hook.type || 'Hook'}`,
        content: hook.text || '',
        status: 'draft',
        raw: hook,
      })
    })

    // Scripts
    safeArray<Script>(data.scripts).forEach(script => {
      items.push({
        id: `cb-${counter++}`,
        type: 'script',
        title: `${script.format || 'Script'}`,
        content: script.script || '',
        status: 'draft',
        raw: script,
      })
    })

    // Email Sequences
    safeArray<EmailSequence>(data.email_sequences).forEach(seq => {
      safeArray<EmailItem>(seq.emails).forEach(email => {
        items.push({
          id: `cb-${counter++}`,
          type: 'email',
          title: email.subject_line || `${seq.sequence_type} Email #${email.order}`,
          content: email.body || '',
          status: 'draft',
          raw: { ...email, sequence_type: seq.sequence_type },
        })
      })
    })

    // Social Posts
    safeArray<SocialPost>(data.social_posts).forEach(post => {
      items.push({
        id: `cb-${counter++}`,
        type: 'social',
        title: `${post.platform || 'Social'} — ${post.content_type || 'Post'}`,
        content: post.caption || '',
        platform: post.platform,
        status: 'draft',
        raw: post,
      })
    })

    setContentBank(prev => [...prev, ...items])
    setActiveScreen('content-bank')
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(30,50%,97%) 0%, hsl(20,45%,95%) 35%, hsl(40,40%,96%) 70%, hsl(15,35%,97%) 100%)' }}>
      <Sidebar active={activeScreen} onNavigate={setActiveScreen} />

      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 px-8 py-4 border-b border-[hsl(30,35%,88%)] bg-[hsl(30,40%,98%)]/80 backdrop-blur-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[hsl(20,40%,10%)] tracking-[-0.01em]">
                {activeScreen === 'dashboard' && 'Campaign Hub'}
                {activeScreen === 'generator' && 'Content Generator'}
                {activeScreen === 'content-bank' && 'Content Bank'}
                {activeScreen === 'calendar' && 'Content Calendar'}
                {activeScreen === 'email' && 'Email Automation'}
                {activeScreen === 'analytics' && 'Analytics'}
              </h2>
              <StatusBadge status="active" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(20,25%,45%)]">{contentBank.length} content pieces</span>
            </div>
          </div>
        </header>

        {/* Screen Content */}
        <div className="px-8 py-6">
          {activeScreen === 'dashboard' && (
            <DashboardScreen onNavigate={setActiveScreen} contentBank={contentBank} calendarItems={calendarItems} />
          )}
          {activeScreen === 'generator' && (
            <GeneratorScreen onGenerated={handleContentGenerated} />
          )}
          {activeScreen === 'content-bank' && (
            <ContentBankScreen contentBank={contentBank} setContentBank={setContentBank} />
          )}
          {activeScreen === 'calendar' && (
            <CalendarScreen contentBank={contentBank} calendarItems={calendarItems} setCalendarItems={setCalendarItems} />
          )}
          {activeScreen === 'email' && <EmailScreen />}
          {activeScreen === 'analytics' && <AnalyticsScreen />}
        </div>
      </main>
    </div>
  )
}

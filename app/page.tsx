'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import {
  FiHome, FiEdit3, FiArchive, FiCalendar, FiMail,
  FiBarChart2, FiImage, FiSend, FiZap, FiTrendingUp,
  FiUsers, FiDollarSign, FiTarget, FiCheck, FiX,
  FiLoader, FiChevronRight, FiSearch, FiTrash2,
  FiExternalLink, FiCopy, FiSettings
} from 'react-icons/fi'
import {
  BsFacebook, BsInstagram, BsPinterest,
  BsLinkedin, BsTiktok, BsTwitterX
} from 'react-icons/bs'

/* ── Agent IDs ── */
const AGENTS = {
  CONTENT: '699a247e738daf1ab82e84fe',
  IMAGE: '699a24ad8a81cf15f59e03b0',
  DIST: '699a24ca520a48afa0342d47',
  EMAIL: '699a24cb8a81cf15f59e03b4',
  ANALYTICS: '699a24ae4274f089c16d43f7',
}

/* ── Types ── */
type Screen = 'dashboard' | 'generator' | 'content-bank' | 'calendar' | 'email' | 'analytics' | 'settings'

interface BankItem {
  id: string
  type: 'ad' | 'email' | 'social' | 'script' | 'hook'
  content: string
  title: string
  platform?: string
  status: 'draft' | 'approved' | 'published'
  imageUrl?: string
}

interface CalEntry {
  id: string
  date: string
  platform: string
  content: string
  status: 'queued' | 'scheduled' | 'published'
}

/* ── Constants ── */
const CARD = 'rounded-2xl border border-white/20 bg-[hsl(250,25%,96%)]/75 backdrop-blur-xl shadow-md'

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', Icon: BsFacebook, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', Icon: BsInstagram, color: '#E4405F' },
  { id: 'pinterest', label: 'Pinterest', Icon: BsPinterest, color: '#BD081C' },
  { id: 'linkedin', label: 'LinkedIn', Icon: BsLinkedin, color: '#0A66C2' },
  { id: 'tiktok', label: 'TikTok', Icon: BsTiktok, color: '#000' },
  { id: 'x', label: 'X', Icon: BsTwitterX, color: '#000' },
]

const PRODUCTS = [
  'Coloring Book Journey',
  'Adoptee Checklist',
  'Guide',
  'Journal',
  'Tedswoodworking+ Affiliate',
]

const SEQ_TYPES = ['welcome', 'pitch', 'follow-up', 'abandoned_funnel', 'upsell', 'bonus_delivery', 'newsletter']

/* ── Helpers ── */
function safeArray(val: unknown): any[] {
  return Array.isArray(val) ? val : []
}

function parseResult(r: any): Record<string, any> {
  try {
    if (!r?.response?.result) return {}
    const d = r.response.result
    if (typeof d === 'string') {
      try { return JSON.parse(d) } catch { return { text: d } }
    }
    return d
  } catch {
    return {}
  }
}

function PlatformIcon({ name }: { name: string }) {
  const n = name.toLowerCase()
  if (n.includes('facebook')) return <BsFacebook className="text-[#1877F2]" />
  if (n.includes('instagram')) return <BsInstagram className="text-[#E4405F]" />
  if (n.includes('pinterest')) return <BsPinterest className="text-[#BD081C]" />
  if (n.includes('linkedin')) return <BsLinkedin className="text-[#0A66C2]" />
  if (n.includes('tiktok')) return <BsTiktok />
  if (n.includes('x') || n.includes('twitter')) return <BsTwitterX />
  return <FiExternalLink />
}

/* ── Navigation Items ── */
const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
  { id: 'generator', label: 'Content Generator', icon: <FiEdit3 size={18} /> },
  { id: 'content-bank', label: 'Content Bank', icon: <FiArchive size={18} /> },
  { id: 'calendar', label: 'Content Calendar', icon: <FiCalendar size={18} /> },
  { id: 'email', label: 'Email Automation', icon: <FiMail size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
]

/* ━━━━━━━━━━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━━━━━━━━━━ */
export default function Page() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [bank, setBank] = useState<BankItem[]>([])
  const [calendar, setCalendar] = useState<CalEntry[]>([])
  const [appName, setAppName] = useState('FunnelForge')
  const [appTag, setAppTag] = useState('Sales Funnel Automation')

  const handleGenDone = useCallback((d: any) => {
    const items: BankItem[] = []
    let counter = Date.now()

    safeArray(d.ad_copies).forEach((a: any) => {
      items.push({ id: `cb-${counter++}`, type: 'ad', title: a.headline || 'Ad', content: a.body || '', platform: a.platform, status: 'draft' })
    })
    safeArray(d.hooks).forEach((h: any) => {
      items.push({ id: `cb-${counter++}`, type: 'hook', title: h.type || 'Hook', content: h.text || '', status: 'draft' })
    })
    safeArray(d.scripts).forEach((s: any) => {
      items.push({ id: `cb-${counter++}`, type: 'script', title: s.format || 'Script', content: s.script || '', status: 'draft' })
    })
    safeArray(d.email_sequences).forEach((seq: any) => {
      safeArray(seq.emails).forEach((em: any) => {
        items.push({ id: `cb-${counter++}`, type: 'email', title: em.subject_line || 'Email', content: em.body || '', status: 'draft' })
      })
    })
    safeArray(d.social_posts).forEach((p: any) => {
      items.push({ id: `cb-${counter++}`, type: 'social', title: `${p.platform || 'Social'} - ${p.content_type || 'Post'}`, content: p.caption || '', platform: p.platform, status: 'draft' })
    })

    setBank(prev => [...prev, ...items])
    setScreen('content-bank')
  }, [])

  const currentLabel = NAV_ITEMS.find(n => n.id === screen)?.label || ''

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(250,30%,97%), hsl(260,25%,95%), hsl(240,20%,96%), hsl(270,20%,97%))' }}>
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-[hsl(250,22%,95%)] border-r border-[hsl(250,20%,88%)] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-[hsl(250,20%,88%)]">
          <h1 className="text-xl font-bold text-[hsl(250,30%,12%)] font-serif">{appName}</h1>
          <p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{appTag}</p>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                screen === item.id
                  ? 'bg-[hsl(262,83%,58%)] text-white shadow-md'
                  : 'text-[hsl(250,30%,12%)] hover:bg-[hsl(250,20%,90%)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[hsl(250,20%,88%)]">
          <p className="text-[10px] text-[hsl(250,15%,50%)]">Powered by AI Agents</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 px-8 py-4 border-b border-[hsl(250,20%,88%)] bg-[hsl(250,25%,98%)]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[hsl(250,30%,12%)]">{currentLabel}</h2>
            <span className="text-xs text-[hsl(250,15%,50%)]">{bank.length} content pieces</span>
          </div>
        </header>
        <div className="px-8 py-6">
          {screen === 'dashboard' && <DashScreen go={setScreen} bank={bank} cal={calendar} />}
          {screen === 'generator' && <GenScreen onDone={handleGenDone} />}
          {screen === 'content-bank' && <BankScreen bank={bank} setBank={setBank} />}
          {screen === 'calendar' && <CalScreen bank={bank} cal={calendar} setCal={setCalendar} />}
          {screen === 'email' && <EmailScreen />}
          {screen === 'analytics' && <AnalyticsScreen />}
          {screen === 'settings' && <SettingsScreen name={appName} tag={appTag} setName={setAppName} setTag={setAppTag} />}
        </div>
      </main>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ DASHBOARD ━━━━━━━━━━━━━━━━━━━━ */
function DashScreen({ go, bank, cal }: { go: (s: Screen) => void; bank: BankItem[]; cal: CalEntry[] }) {
  const kpis = [
    { label: 'Total Leads', value: '1,284', trend: '+12%', icon: <FiUsers size={18} /> },
    { label: 'Conversion Rate', value: '3.8%', trend: '+0.5%', icon: <FiTarget size={18} /> },
    { label: 'EPC', value: '$2.47', trend: '+$0.12', icon: <FiDollarSign size={18} /> },
    { label: 'Revenue', value: '$8,942', trend: '+18%', icon: <FiDollarSign size={18} /> },
    { label: 'Active Sequences', value: '4', trend: 'stable', icon: <FiMail size={18} /> },
    { label: 'Scheduled Posts', value: String(cal.length || 12), trend: '+3', icon: <FiCalendar size={18} /> },
  ]

  const activities = [
    { text: 'Campaign content generated for Coloring Book Journey', time: '2 min ago' },
    { text: '3 posts scheduled for Facebook & Instagram', time: '15 min ago' },
    { text: 'Welcome email sequence activated', time: '1 hr ago' },
    { text: 'New lead captured from Pinterest ad', time: '2 hrs ago' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Dashboard</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Campaign overview and quick actions</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={CARD + ' p-4'}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[hsl(250,15%,50%)]">{k.icon}</span>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <FiTrendingUp size={12} />{k.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-[hsl(250,30%,12%)]">{k.value}</p>
            <p className="text-xs text-[hsl(250,15%,50%)] mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={CARD + ' p-5'}>
          <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button type="button" onClick={() => go('generator')} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] shadow-md">
              <FiZap size={16} />Generate Campaign Content
            </button>
            <button type="button" onClick={() => go('calendar')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium border border-[hsl(250,20%,88%)] bg-[hsl(250,20%,92%)]">
              <FiCalendar size={16} />View Calendar
            </button>
            <button type="button" onClick={() => go('analytics')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium border border-[hsl(250,20%,88%)] bg-[hsl(250,20%,92%)]">
              <FiBarChart2 size={16} />Check Analytics
            </button>
          </div>
        </div>

        <div className={CARD + ' p-5'}>
          <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-[hsl(262,83%,58%)] shrink-0" />
                <div>
                  <p className="text-sm text-[hsl(250,30%,12%)]">{a.text}</p>
                  <p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bank.length > 0 && (
        <div className={CARD + ' p-5'}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Content Bank</h3>
            <button type="button" onClick={() => go('content-bank')} className="flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-medium border border-[hsl(250,20%,88%)] bg-[hsl(250,20%,92%)]">
              View All <FiChevronRight size={14} />
            </button>
          </div>
          <p className="text-sm text-[hsl(250,15%,50%)]">{bank.length} content pieces generated</p>
        </div>
      )}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ GENERATOR ━━━━━━━━━━━━━━━━━━━━ */
function GenScreen({ onDone }: { onDone: (d: any) => void }) {
  const [product, setProduct] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const generate = useCallback(async () => {
    if (!product) { setMsg({ type: 'error', text: 'Please select a product' }); return }
    if (!selectedPlatforms.length) { setMsg({ type: 'error', text: 'Please select at least one platform' }); return }
    setLoading(true)
    setMsg(null)
    try {
      const r = await callAIAgent(
        `Generate campaign content for:\nProduct: ${product}\nPlatforms: ${selectedPlatforms.join(', ')}\nBrief: ${brief || 'Create engaging content.'}\nGenerate ad copy, hooks, email sequences, social posts, scripts.`,
        AGENTS.CONTENT
      )
      if (r.success) {
        onDone(parseResult(r))
        setMsg({ type: 'success', text: 'Content generated!' })
      } else {
        setMsg({ type: 'error', text: r.error || 'Failed' })
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }, [product, selectedPlatforms, brief, onDone])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Content Generator</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Configure and generate AI-powered campaign content</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <div className={CARD + ' p-5 space-y-4'}>
            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Product / Offer</label>
              <select value={product} onChange={e => setProduct(e.target.value)} className="w-full px-3 py-2.5 rounded-2xl border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]">
                <option value="">Select a product...</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const selected = selectedPlatforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-[hsl(262,83%,58%)] text-white border-[hsl(262,83%,58%)]'
                          : 'bg-white text-[hsl(250,25%,18%)] border-[hsl(250,20%,88%)] hover:border-[hsl(262,83%,58%)]'
                      }`}
                    >
                      <p.Icon size={13} />{p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Brief</label>
              <textarea value={brief} onChange={e => setBrief(e.target.value)} rows={4} placeholder="Describe your target audience, goals..." className="w-full px-3 py-2.5 rounded-2xl border border-[hsl(250,20%,88%)] bg-white text-sm resize-none outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
            </div>

            <button type="button" onClick={generate} disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] shadow-md disabled:opacity-50">
              {loading && <FiLoader className="animate-spin" size={16} />}
              <FiZap size={16} />Generate Campaign Content
            </button>
          </div>
        </div>

        <div className="col-span-2">
          {msg && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {msg.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}
              <span>{msg.text}</span>
            </div>
          )}
          {!msg && !loading && (
            <div className={CARD + ' p-5'}>
              <div className="text-center py-8">
                <FiEdit3 size={32} className="mx-auto text-[hsl(250,15%,50%)] mb-3" />
                <p className="text-sm text-[hsl(250,15%,50%)]">Configure your campaign and click generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ CONTENT BANK ━━━━━━━━━━━━━━━━━━━━ */
function BankScreen({ bank, setBank }: { bank: BankItem[]; setBank: React.Dispatch<React.SetStateAction<BankItem[]>> }) {
  const [tab, setTab] = useState<BankItem['type']>('ad')
  const [search, setSearch] = useState('')
  const [imgLoading, setImgLoading] = useState<string | null>(null)

  const tabs: { id: BankItem['type']; label: string }[] = [
    { id: 'ad', label: 'Ads' },
    { id: 'email', label: 'Emails' },
    { id: 'social', label: 'Social Posts' },
    { id: 'script', label: 'Scripts' },
    { id: 'hook', label: 'Hooks' },
  ]

  const filtered = bank.filter(i =>
    i.type === tab &&
    (!search || i.content.toLowerCase().includes(search.toLowerCase()) || i.title.toLowerCase().includes(search.toLowerCase()))
  )

  const generateImage = useCallback(async (item: BankItem) => {
    setImgLoading(item.id)
    try {
      const r = await callAIAgent(`Generate visual for: ${item.title}\n${item.content.substring(0, 300)}`, AGENTS.IMAGE)
      if (r.success) {
        const imgs = r.module_outputs?.artifact_files
        if (Array.isArray(imgs) && imgs.length > 0) {
          setBank(prev => prev.map(ci => ci.id === item.id ? { ...ci, imageUrl: imgs[0].file_url } : ci))
        }
      }
    } catch { /* ignore */ } finally {
      setImgLoading(null)
    }
  }, [setBank])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Content Bank</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Review, edit, and manage generated content</p>
      </div>

      <div className="flex items-center gap-1 border-b border-[hsl(250,20%,88%)]">
        {tabs.map(t => {
          const count = bank.filter(i => i.type === t.id).length
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${tab === t.id ? 'border-[hsl(262,83%,58%)] text-[hsl(262,83%,58%)]' : 'border-transparent text-[hsl(250,15%,50%)] hover:text-[hsl(250,30%,12%)]'}`}>
              {t.label}
              {count > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center ${tab === t.id ? 'bg-[hsl(262,83%,58%)] text-white' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(250,15%,50%)]" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiArchive size={28} className="mx-auto text-[hsl(250,15%,50%)] mb-3" />
          <p className="text-lg font-semibold text-[hsl(250,30%,12%)]">No content yet</p>
          <p className="text-sm text-[hsl(250,15%,50%)]">Generate campaign content to see {tab}s here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.id} className={CARD + ' p-4'}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.platform && <PlatformIcon name={item.platform} />}
                  <h4 className="text-sm font-semibold text-[hsl(250,30%,12%)] truncate max-w-[200px]">{item.title}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'published' ? 'bg-purple-100 text-purple-700' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-[hsl(250,15%,50%)] leading-relaxed mb-3 line-clamp-3">{item.content}</p>
              {item.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-[hsl(250,20%,88%)]">
                  <img src={item.imageUrl} alt="" className="w-full h-32 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => generateImage(item)} disabled={imgLoading === item.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)] disabled:opacity-50">
                  {imgLoading === item.id ? <FiLoader size={12} className="animate-spin" /> : <FiImage size={12} />}Image
                </button>
                <button type="button" onClick={() => setBank(p => p.map(i => i.id === item.id ? { ...i, status: 'approved' } : i))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
                  <FiCheck size={12} />Approve
                </button>
                <button type="button" onClick={() => setBank(p => p.filter(i => i.id !== item.id))} className="px-2 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                  <FiTrash2 size={12} />
                </button>
                <button type="button" onClick={() => navigator.clipboard.writeText(item.content)} className="px-2 py-1.5 text-xs rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)]">
                  <FiCopy size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ CALENDAR ━━━━━━━━━━━━━━━━━━━━ */
function CalScreen({ bank, cal, setCal }: { bank: BankItem[]; cal: CalEntry[]; setCal: React.Dispatch<React.SetStateAction<CalEntry[]>> }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)
  const [postText, setPostText] = useState('')
  const [platform, setPlatform] = useState('')
  const [time, setTime] = useState('')

  const approved = bank.filter(c => c.status === 'approved')

  const distribute = useCallback(async (instant: boolean) => {
    if (!postText && !approved.length) { setMsg({ type: 'error', text: 'No content to distribute.' }); return }
    setLoading(true)
    setMsg(null)
    try {
      const r = await callAIAgent(
        `${instant ? 'INSTANT PUBLISH' : 'Schedule'} content:\nContent: ${postText || approved[0]?.content || 'Content'}\nPlatform: ${platform || 'X'}\nTime: ${time || new Date().toISOString()}`,
        AGENTS.DIST
      )
      if (r.success) {
        setCal(p => [...p, { id: `cal-${Date.now()}`, date: time || new Date().toISOString(), platform: platform || 'X', content: postText.substring(0, 100) || 'Post', status: instant ? 'published' : 'scheduled' }])
        setMsg({ type: 'success', text: instant ? 'Published!' : 'Scheduled!' })
        setPostText('')
      } else {
        setMsg({ type: 'error', text: r.error || 'Failed' })
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }, [postText, platform, time, approved, setCal])

  const today = new Date()
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + i)
    return d
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Content Calendar</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Schedule and distribute content</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}{msg.text}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className={CARD + ' p-4'}>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-[hsl(250,15%,50%)] py-2">{d}</div>
              ))}
              {week.map((date, i) => {
                const ds = date.toISOString().split('T')[0]
                const evs = cal.filter(e => e.date.startsWith(ds))
                const isToday = ds === today.toISOString().split('T')[0]
                return (
                  <div key={i} className={`min-h-[100px] rounded-lg border p-2 ${isToday ? 'border-[hsl(262,83%,58%)] bg-[hsl(262,83%,58%)]/5' : 'border-[hsl(250,20%,88%)]'}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-[hsl(262,83%,58%)]' : 'text-[hsl(250,15%,50%)]'}`}>{date.getDate()}</span>
                    <div className="mt-1 space-y-1">
                      {evs.map(ev => (
                        <div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)] truncate flex items-center gap-1">
                          <PlatformIcon name={ev.platform} />
                          <span className="truncate">{ev.content.substring(0, 20)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={CARD + ' p-4 space-y-3'}>
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Schedule Post</h3>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none">
              <option value="">Platform...</option>
              {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <textarea value={postText} onChange={e => setPostText(e.target.value)} rows={3} placeholder="Post content..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none" />
            <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none" />
            <button type="button" onClick={() => distribute(false)} disabled={loading} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-[hsl(262,83%,58%)] text-white disabled:opacity-50 shadow-md">
              {loading && <FiLoader size={12} className="animate-spin" />}<FiSend size={13} />Schedule
            </button>
            <button type="button" onClick={() => distribute(true)} disabled={loading} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-[hsl(174,72%,40%)] text-white disabled:opacity-50 shadow-md">
              <FiZap size={13} />Rocket Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ EMAIL ━━━━━━━━━━━━━━━━━━━━ */
function EmailScreen() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [seqType, setSeqType] = useState('welcome')
  const [activeSeqs, setActiveSeqs] = useState<Record<string, boolean>>({})
  const [lastResult, setLastResult] = useState<any>(null)

  const seqData = [
    { type: 'welcome', label: 'Welcome Sequence', desc: 'Introduce brand', emails: 5, subs: 342 },
    { type: 'pitch', label: 'Product Pitch', desc: 'Close the sale', emails: 6, subs: 198 },
    { type: 'follow-up', label: 'Follow-Up', desc: 'Post-purchase', emails: 4, subs: 156 },
    { type: 'abandoned_funnel', label: 'Abandoned Funnel', desc: 'Recover leads', emails: 3, subs: 89 },
    { type: 'upsell', label: 'Upsell', desc: 'Upgrades', emails: 4, subs: 124 },
    { type: 'bonus_delivery', label: 'Bonus Delivery', desc: 'Deliver bonuses', emails: 3, subs: 267 },
    { type: 'newsletter', label: 'Newsletter', desc: 'Regular updates', emails: 1, subs: 1024 },
  ]

  const activate = useCallback(async () => {
    if (!email) { setMsg({ type: 'error', text: 'Enter recipient email' }); return }
    setLoading(true)
    setMsg(null)
    try {
      const r = await callAIAgent(
        `Activate ${seqType} email sequence:\nRecipient: ${email}\nSubject: ${subject || `Your ${seqType} sequence`}\nBody: ${body || `Automated ${seqType} email.`}\nSend via Gmail.`,
        AGENTS.EMAIL
      )
      if (r.success) {
        const d = parseResult(r)
        setLastResult(d)
        setActiveSeqs(p => ({ ...p, [seqType]: true }))
        setMsg({ type: 'success', text: d.message || `${seqType} activated!` })
      } else {
        setMsg({ type: 'error', text: r.error || 'Failed' })
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }, [email, subject, body, seqType])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Email Automation</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Configure and manage nurture sequences</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}{msg.text}
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-3">
          {seqData.map(s => (
            <div key={s.type} className={CARD + ` p-4 cursor-pointer transition-all ${seqType === s.type ? 'ring-2 ring-[hsl(262,83%,58%)]' : ''}`} onClick={() => setSeqType(s.type)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSeqs[s.type] ? 'bg-green-100 text-green-600' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                    <FiMail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[hsl(250,30%,12%)]">{s.label}</h4>
                    <p className="text-xs text-[hsl(250,15%,50%)]">{s.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-[hsl(250,15%,50%)]">
                    <p>{s.emails} emails</p>
                    <p>{s.subs} subs</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeSeqs[s.type] ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {activeSeqs[s.type] ? 'active' : 'paused'}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: s.emails }, (_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${activeSeqs[s.type] ? 'bg-[hsl(262,83%,58%)] text-white' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                      {i + 1}
                    </div>
                    {i < s.emails - 1 && <div className={`w-4 h-0.5 ${activeSeqs[s.type] ? 'bg-[hsl(262,83%,58%)]' : 'bg-[hsl(250,18%,90%)]'}`} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2 space-y-4">
          <div className={CARD + ' p-4 space-y-3'}>
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Activate Sequence</h3>
            <select value={seqType} onChange={e => setSeqType(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none">
              {SEQ_TYPES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="lead@example.com" className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none" />
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none" />
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="Email body..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none" />
            <button type="button" onClick={activate} disabled={loading} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-[hsl(262,83%,58%)] text-white disabled:opacity-50 shadow-md">
              {loading && <FiLoader size={12} className="animate-spin" />}<FiSend size={13} />Activate
            </button>
          </div>

          {lastResult && (
            <div className={CARD + ' p-4'}>
              <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-2">Last Activation</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  ['Status', lastResult.status || 'active'],
                  ['Sequence', lastResult.sequence_type || seqType],
                  ['Queued', lastResult.emails_queued || 0],
                  ['Next', lastResult.next_email_time || 'Pending'],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between">
                    <span className="text-[hsl(250,15%,50%)]">{k}</span>
                    <span className="font-medium text-[hsl(250,30%,12%)]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={CARD + ' p-4'}>
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-2">
              {[['Open', '42.3%'], ['Click', '8.7%'], ['Unsub', '0.4%']].map(([l, v]) => (
                <div key={l} className="text-center p-2 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
                  <p className="text-sm font-bold text-[hsl(250,30%,12%)]">{v}</p>
                  <p className="text-[10px] text-[hsl(250,15%,50%)]">{l} Rate</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ ANALYTICS ━━━━━━━━━━━━━━━━━━━━ */
function AnalyticsScreen() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)
  const [input, setInput] = useState('')
  const [data, setData] = useState<any>(null)

  const analyze = useCallback(async () => {
    setLoading(true)
    setMsg(null)
    try {
      const r = await callAIAgent(
        `Analyze funnel performance:\n${input || 'Campaign: Digital Products\nClicks: 12,450\nEPC: $2.47\nConversions: 478\nRevenue: $8,942\nProvide KPI analysis, A/B test results, traffic breakdown, optimization suggestions.'}`,
        AGENTS.ANALYTICS
      )
      if (r.success) {
        setData(parseResult(r))
        setMsg({ type: 'success', text: 'Analysis complete!' })
      } else {
        setMsg({ type: 'error', text: r.error || 'Failed' })
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }, [input])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Analytics Dashboard</h2>
          <p className="text-sm text-[hsl(250,15%,50%)]">Performance tracking and AI optimization</p>
        </div>
        <button type="button" onClick={analyze} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] disabled:opacity-50 shadow-md">
          {loading && <FiLoader className="animate-spin" size={16} />}<FiBarChart2 size={16} />Analyze
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}{msg.text}
        </div>
      )}

      <div className={CARD + ' p-4'}>
        <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Metrics (optional)</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="Paste metrics or leave blank for sample data..." className="w-full px-3 py-2.5 rounded-2xl border border-[hsl(250,20%,88%)] bg-white text-sm resize-none outline-none" />
      </div>

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={CARD + ' p-4 animate-pulse'}>
              <div className="h-4 bg-[hsl(250,18%,90%)] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[hsl(250,18%,90%)] rounded w-full mb-2" />
              <div className="h-3 bg-[hsl(250,18%,90%)] rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {data && !loading && (
        <>
          {data.performance_summary && (
            <div className={CARD + ' p-5'}>
              <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-2">Performance Summary</h3>
              <p className="text-sm text-[hsl(250,15%,50%)] leading-relaxed">{data.performance_summary}</p>
            </div>
          )}

          {safeArray(data.kpi_analysis).length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                {safeArray(data.kpi_analysis).map((k: any, i: number) => (
                  <div key={i} className={CARD + ' p-4'}>
                    <span className="text-xs text-[hsl(250,15%,50%)]">{k.metric}</span>
                    <p className="text-xl font-bold text-[hsl(250,30%,12%)]">{k.value}</p>
                    <p className="text-xs text-[hsl(250,15%,50%)]">{k.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {safeArray(data.optimization_suggestions).length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">Optimization Suggestions</h3>
              <div className="space-y-3">
                {safeArray(data.optimization_suggestions).map((s: any, i: number) => (
                  <div key={i} className={CARD + ' p-4'}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-[hsl(262,83%,58%)]">{s.area}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">{s.priority}</span>
                    </div>
                    <p className="text-sm text-[hsl(250,30%,12%)]">{s.suggestion}</p>
                    <p className="text-xs text-[hsl(250,15%,50%)]">Impact: {s.expected_impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && (
        <div className="text-center py-16">
          <FiBarChart2 size={28} className="mx-auto text-[hsl(250,15%,50%)] mb-3" />
          <p className="text-lg font-semibold text-[hsl(250,30%,12%)]">No analysis yet</p>
          <p className="text-sm text-[hsl(250,15%,50%)]">Click Analyze to get AI-powered insights</p>
          <button type="button" onClick={analyze} className="mt-4 px-5 py-2.5 rounded-2xl font-semibold text-sm bg-[hsl(262,83%,58%)] text-white shadow-md">
            Analyze Performance
          </button>
        </div>
      )}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━ SETTINGS ━━━━━━━━━━━━━━━━━━━━ */
function SettingsScreen({ name, tag, setName, setTag }: { name: string; tag: string; setName: (v: string) => void; setTag: (v: string) => void }) {
  const [localName, setLocalName] = useState(name)
  const [localTag, setLocalTag] = useState(tag)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setName(localName.trim() || 'FunnelForge')
    setTag(localTag.trim() || 'Sales Funnel Automation')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Settings</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Customize your app</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm bg-green-50 text-green-700 border-green-200">
          <FiCheck size={16} />Settings saved!
        </div>
      )}

      <div className={CARD + ' p-6 space-y-5'}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center">
            <FiSettings size={20} className="text-[hsl(262,83%,58%)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Branding</h3>
            <p className="text-xs text-[hsl(250,15%,50%)]">Change how your app appears</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">App Name</label>
          <input type="text" value={localName} onChange={e => setLocalName(e.target.value)} className="w-full px-3 py-2.5 rounded-2xl border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Tagline</label>
          <input type="text" value={localTag} onChange={e => setLocalTag(e.target.value)} className="w-full px-3 py-2.5 rounded-2xl border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Preview</label>
          <div className="inline-flex flex-col gap-0.5 px-5 py-4 rounded-2xl bg-[hsl(250,22%,95%)] border border-[hsl(250,20%,88%)]">
            <span className="text-lg font-bold text-[hsl(250,30%,12%)] font-serif">{localName || 'FunnelForge'}</span>
            <span className="text-xs text-[hsl(250,15%,50%)]">{localTag || 'Sales Funnel Automation'}</span>
          </div>
        </div>

        <button type="button" onClick={save} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm bg-[hsl(262,83%,58%)] text-white shadow-md">
          <FiCheck size={16} />Save Changes
        </button>
      </div>

      <div className={CARD + ' p-6 space-y-4'}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center">
            <FiArchive size={20} className="text-[hsl(262,83%,58%)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Products</h3>
          </div>
        </div>
        <div className="space-y-2">
          {PRODUCTS.map(p => (
            <div key={p} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
              <span className="text-sm text-[hsl(250,30%,12%)]">{p}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">active</span>
            </div>
          ))}
        </div>
      </div>

      <div className={CARD + ' p-6 space-y-4'}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center">
            <FiExternalLink size={20} className="text-[hsl(262,83%,58%)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Connected Platforms</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
              <p.Icon size={18} style={{ color: p.color }} />
              <span className="flex-1 text-sm font-medium text-[hsl(250,30%,12%)]">{p.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.id === 'x' ? 'bg-green-100 text-green-700' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                {p.id === 'x' ? 'active' : 'draft'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[hsl(250,15%,50%)]">Twitter/X and Gmail connected via Composio.</p>
      </div>
    </div>
  )
}

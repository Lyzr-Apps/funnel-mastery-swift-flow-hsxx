'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import {
  FiHome, FiEdit3, FiArchive, FiCalendar, FiMail, FiBarChart2,
  FiImage, FiSend, FiZap, FiTrendingUp, FiTrendingDown, FiUsers,
  FiDollarSign, FiTarget, FiCheck, FiX, FiLoader, FiChevronRight,
  FiSearch, FiEye, FiTrash2, FiExternalLink, FiCopy, FiSettings
} from 'react-icons/fi'
import {
  BsFacebook, BsInstagram, BsPinterest, BsLinkedin, BsTiktok, BsTwitterX
} from 'react-icons/bs'

/* ── Constants ─────────────────────────────────────────── */

const AGENT = {
  CONTENT_ORCHESTRATOR: '699a247e738daf1ab82e84fe',
  IMAGE_CREATOR: '699a24ad8a81cf15f59e03b0',
  DISTRIBUTION: '699a24ca520a48afa0342d47',
  EMAIL_AUTOMATION: '699a24cb8a81cf15f59e03b4',
  ANALYTICS: '699a24ae4274f089c16d43f7',
} as const

type Screen = 'dashboard' | 'generator' | 'content-bank' | 'calendar' | 'email' | 'analytics' | 'settings'

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: BsFacebook, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: BsInstagram, color: '#E4405F' },
  { id: 'pinterest', label: 'Pinterest', icon: BsPinterest, color: '#BD081C' },
  { id: 'linkedin', label: 'LinkedIn', icon: BsLinkedin, color: '#0A66C2' },
  { id: 'tiktok', label: 'TikTok', icon: BsTiktok, color: '#000000' },
  { id: 'x', label: 'X', icon: BsTwitterX, color: '#000000' },
]

const PRODUCTS = ['Coloring Book Journey', 'Adoptee Checklist', 'Guide', 'Journal', 'Tedswoodworking+ Affiliate']
const SEQ_TYPES = ['welcome', 'pitch', 'follow-up', 'abandoned_funnel', 'upsell', 'bonus_delivery', 'newsletter']

/* ── Types ─────────────────────────────────────────────── */

interface AdCopy { platform: string; headline: string; body: string; cta: string }
interface Hook { type: string; text: string }
interface ScriptData { format: string; script: string }
interface EmailItem { order: number; subject_line: string; subject_line_variant: string; preview_text: string; body: string; cta: string; delay_days: number }
interface EmailSequence { sequence_type: string; emails: EmailItem[] }
interface SocialPost { platform: string; content_type: string; caption: string; hashtags: string[]; cta: string; best_posting_time: string }
interface ContentData { campaign_summary?: string; ad_copies?: AdCopy[]; hooks?: Hook[]; scripts?: ScriptData[]; email_sequences?: EmailSequence[]; social_posts?: SocialPost[] }
interface BankItem { id: string; type: 'ad'|'email'|'social'|'script'|'hook'; content: string; title: string; platform?: string; status: 'draft'|'approved'|'published'; imageUrl?: string; raw?: any }
interface CalEvent { id: string; date: string; platform: string; content: string; status: 'queued'|'scheduled'|'published' }
interface KpiItem { metric: string; value: string; trend: string; insight: string }
interface AbTest { test_name: string; variant_a: string; variant_b: string; winner: string; confidence: string }
interface OptSugg { area: string; suggestion: string; expected_impact: string; priority: string }
interface TrafficItem { source: string; clicks: string; conversions: string; epc: string }

/* ── Helpers ───────────────────────────────────────────── */

function safe<T>(v: unknown): T[] { return Array.isArray(v) ? v : [] }

function parse(r: any): Record<string, any> {
  try {
    if (!r?.response?.result) return {}
    const d = r.response.result
    if (typeof d === 'string') { try { return JSON.parse(d) } catch { return { text: d } } }
    return d
  } catch { return {} }
}

function pIcon(p: string) {
  const l = p.toLowerCase()
  if (l.includes('facebook')) return <BsFacebook className="text-[#1877F2]" />
  if (l.includes('instagram')) return <BsInstagram className="text-[#E4405F]" />
  if (l.includes('pinterest')) return <BsPinterest className="text-[#BD081C]" />
  if (l.includes('linkedin')) return <BsLinkedin className="text-[#0A66C2]" />
  if (l.includes('tiktok')) return <BsTiktok />
  if (l.includes('x') || l.includes('twitter')) return <BsTwitterX />
  return <FiExternalLink />
}

/* ── UI Primitives ─────────────────────────────────────── */

function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={`rounded-[0.875rem] border border-white/[0.18] bg-[hsl(250,25%,96%)]/75 backdrop-blur-[16px] shadow-md ${className}`} style={{ cursor: onClick ? 'pointer' : undefined }}>{children}</div>
}

function Badge({ status }: { status: string }) {
  const c: Record<string, string> = { draft: 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]', approved: 'bg-green-100 text-green-700', published: 'bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)]', active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', queued: 'bg-blue-100 text-blue-700', scheduled: 'bg-purple-100 text-purple-700' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

function Btn({ children, onClick, disabled, loading, className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; className?: string }) {
  return <button onClick={onClick} disabled={disabled || loading} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.875rem] font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${className}`}>{loading && <FiLoader className="animate-spin" size={16} />}{children}</button>
}

function Btn2({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2 rounded-[0.875rem] text-sm font-medium border border-[hsl(250,20%,88%)] text-[hsl(250,25%,18%)] bg-[hsl(250,20%,92%)] hover:bg-[hsl(250,20%,88%)] transition-all ${className}`}>{children}</button>
}

function Msg({ type, message }: { type: 'success'|'error'|'info'|'loading'; message: string }) {
  const s: Record<string, string> = { success: 'bg-green-50 text-green-700 border-green-200', error: 'bg-red-50 text-red-700 border-red-200', info: 'bg-blue-50 text-blue-700 border-blue-200', loading: 'bg-[hsl(262,83%,58%)]/5 text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%)]/20' }
  const ic: Record<string, React.ReactNode> = { success: <FiCheck size={16} />, error: <FiX size={16} />, info: <FiEye size={16} />, loading: <FiLoader size={16} className="animate-spin" /> }
  return <div className={`flex items-center gap-2 px-4 py-2.5 rounded-[0.875rem] border text-sm ${s[type]}`}>{ic[type]}<span>{message}</span></div>
}

function Skel() { return <Card className="p-4 animate-pulse"><div className="h-4 bg-[hsl(250,18%,90%)] rounded w-3/4 mb-3" /><div className="h-3 bg-[hsl(250,18%,90%)] rounded w-full mb-2" /><div className="h-3 bg-[hsl(250,18%,90%)] rounded w-5/6" /></Card> }

function Empty({ icon, title, desc, action, onAction }: { icon: React.ReactNode; title: string; desc: string; action?: string; onAction?: () => void }) {
  return <div className="flex flex-col items-center justify-center py-16 text-center"><div className="w-16 h-16 rounded-full bg-[hsl(250,18%,90%)] flex items-center justify-center mb-4 text-[hsl(250,15%,50%)]">{icon}</div><h3 className="text-lg font-semibold text-[hsl(250,30%,12%)] mb-1">{title}</h3><p className="text-sm text-[hsl(250,15%,50%)] max-w-sm mb-4">{desc}</p>{action && onAction && <Btn onClick={onAction}>{action}</Btn>}</div>
}

/* ── Sidebar ───────────────────────────────────────────── */

function Sidebar({ active, go, name, tag }: { active: Screen; go: (s: Screen) => void; name: string; tag: string }) {
  const items: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
    { id: 'generator', label: 'Content Generator', icon: <FiEdit3 size={18} /> },
    { id: 'content-bank', label: 'Content Bank', icon: <FiArchive size={18} /> },
    { id: 'calendar', label: 'Content Calendar', icon: <FiCalendar size={18} /> },
    { id: 'email', label: 'Email Automation', icon: <FiMail size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
  ]
  return (
    <aside className="w-60 min-h-screen bg-[hsl(250,22%,95%)] border-r border-[hsl(250,20%,88%)] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-[hsl(250,20%,88%)]">
        <h1 className="text-xl font-bold tracking-[-0.01em] text-[hsl(250,30%,12%)] font-serif">{name}</h1>
        <p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{tag}</p>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {items.map(it => (
          <button key={it.id} onClick={() => go(it.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.875rem] text-sm font-medium transition-all ${active === it.id ? 'bg-[hsl(262,83%,58%)] text-white shadow-md' : 'text-[hsl(250,30%,12%)] hover:bg-[hsl(250,20%,90%)]'}`}>
            {it.icon}{it.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[hsl(250,20%,88%)]"><p className="text-[10px] text-[hsl(250,15%,50%)]">Powered by AI Agents</p></div>
    </aside>
  )
}

/* ── Dashboard ─────────────────────────────────────────── */

function Dashboard({ go, bank, cal }: { go: (s: Screen) => void; bank: BankItem[]; cal: CalEvent[] }) {
  const kpis = [
    { label: 'Total Leads', value: '1,284', trend: '+12%', icon: <FiUsers size={18} /> },
    { label: 'Conversion Rate', value: '3.8%', trend: '+0.5%', icon: <FiTarget size={18} /> },
    { label: 'EPC', value: '$2.47', trend: '+$0.12', icon: <FiDollarSign size={18} /> },
    { label: 'Revenue', value: '$8,942', trend: '+18%', icon: <FiDollarSign size={18} /> },
    { label: 'Active Sequences', value: '4', trend: 'stable', icon: <FiMail size={18} /> },
    { label: 'Scheduled Posts', value: String(cal.length || 12), trend: '+3', icon: <FiCalendar size={18} /> },
  ]
  const activity = [
    { text: 'Campaign content generated for Coloring Book Journey', time: '2 min ago' },
    { text: '3 posts scheduled for Facebook & Instagram', time: '15 min ago' },
    { text: 'Welcome email sequence activated', time: '1 hr ago' },
    { text: 'New lead captured from Pinterest ad', time: '2 hrs ago' },
  ]
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Dashboard</h2><p className="text-sm text-[hsl(250,15%,50%)]">Campaign overview and quick actions</p></div>
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-[hsl(250,15%,50%)]">{k.icon}</span><span className="flex items-center gap-1 text-xs font-medium text-green-600"><FiTrendingUp size={12} />{k.trend}</span></div>
            <p className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em]">{k.value}</p><p className="text-xs text-[hsl(250,15%,50%)] mt-1">{k.label}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5"><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Quick Actions</h3><div className="space-y-3"><Btn onClick={() => go('generator')} className="w-full justify-center"><FiZap size={16} /> Generate Campaign Content</Btn><Btn2 onClick={() => go('calendar')} className="w-full justify-center"><FiCalendar size={16} /> View Calendar</Btn2><Btn2 onClick={() => go('analytics')} className="w-full justify-center"><FiBarChart2 size={16} /> Check Analytics</Btn2></div></Card>
        <Card className="p-5"><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Recent Activity</h3><div className="space-y-3">{activity.map((a, i) => (<div key={i} className="flex items-start gap-3"><div className="w-2 h-2 mt-1.5 rounded-full bg-[hsl(262,83%,58%)] shrink-0" /><div><p className="text-sm text-[hsl(250,30%,12%)] leading-snug">{a.text}</p><p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{a.time}</p></div></div>))}</div></Card>
      </div>
      {bank.length > 0 && <Card className="p-5"><div className="flex items-center justify-between mb-3"><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Content Bank</h3><Btn2 onClick={() => go('content-bank')}>View All <FiChevronRight size={14} /></Btn2></div><p className="text-sm text-[hsl(250,15%,50%)]">{bank.length} content pieces generated</p></Card>}
    </div>
  )
}

/* ── Generator ─────────────────────────────────────────── */

function Generator({ onDone }: { onDone: (d: ContentData) => void }) {
  const [product, setProduct] = useState('')
  const [plats, setPlats] = useState<string[]>([])
  const [brief, setBrief] = useState('')
  const [types, setTypes] = useState(['ads', 'emails', 'social', 'scripts', 'hooks'])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [msg, setMsg] = useState<{ type: 'success'|'error'|'info'; message: string } | null>(null)

  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]

  const run = useCallback(async () => {
    if (!product) { setMsg({ type: 'error', message: 'Please select a product' }); return }
    if (plats.length === 0) { setMsg({ type: 'error', message: 'Please select at least one platform' }); return }
    setLoading(true); setMsg(null); setProgress('Analyzing campaign brief...')
    try {
      const result = await callAIAgent(`Generate a complete campaign content suite for:\nProduct: ${product}\nPlatforms: ${plats.join(', ')}\nBrief: ${brief || 'Create engaging, value-driven content.'}\nContent Types: ${types.join(', ')}\nGenerate platform-specific ad copy, hooks, email sequences, social posts, and scripts.`, AGENT.CONTENT_ORCHESTRATOR)
      if (result.success) { onDone(parse(result) as ContentData); setMsg({ type: 'success', message: 'Campaign content generated!' }) }
      else { setMsg({ type: 'error', message: result.error || 'Failed to generate content' }) }
    } catch (err: any) { setMsg({ type: 'error', message: err?.message || 'Generation failed' }) }
    finally { setLoading(false); setProgress('') }
  }, [product, plats, brief, types, onDone])

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Content Generator</h2><p className="text-sm text-[hsl(250,15%,50%)]">Configure and generate AI-powered campaign content</p></div>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          <Card className="p-5 space-y-4">
            <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Product / Offer</label><select value={product} onChange={e => setProduct(e.target.value)} className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"><option value="">Select a product...</option>{PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Target Platforms</label><div className="flex flex-wrap gap-2">{PLATFORMS.map(p => { const I = p.icon; const sel = plats.includes(p.id); return <button key={p.id} onClick={() => setPlats(prev => toggle(prev, p.id))} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${sel ? 'bg-[hsl(262,83%,58%)] text-white border-[hsl(262,83%,58%)]' : 'bg-white text-[hsl(250,25%,18%)] border-[hsl(250,20%,88%)] hover:border-[hsl(262,83%,58%)]'}`}><I size={13} /> {p.label}</button> })}</div></div>
            <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Brief</label><textarea value={brief} onChange={e => setBrief(e.target.value)} rows={4} placeholder="Describe your target audience, goals, tone preferences..." className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm resize-none focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none" /></div>
            <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Content Types</label><div className="flex flex-wrap gap-2">{[{id:'ads',label:'Ads'},{id:'emails',label:'Emails'},{id:'social',label:'Social Posts'},{id:'scripts',label:'Scripts'},{id:'hooks',label:'Hooks/Angles'}].map(ct => <label key={ct.id} className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={types.includes(ct.id)} onChange={() => setTypes(prev => toggle(prev, ct.id))} className="rounded border-[hsl(250,20%,88%)] text-[hsl(262,83%,58%)] focus:ring-[hsl(262,83%,58%)]" /><span className="text-sm text-[hsl(250,30%,12%)]">{ct.label}</span></label>)}</div></div>
            <Btn onClick={run} loading={loading} disabled={loading} className="w-full justify-center"><FiZap size={16} /> Generate Campaign Content</Btn>
          </Card>
        </div>
        <div className="col-span-2 space-y-4">
          {msg && <Msg type={msg.type} message={msg.message} />}
          {loading && <Card className="p-5"><h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-4">Generation Progress</h3><div className="space-y-3">{['Analyzing campaign brief','Generating ad copy & hooks','Creating email sequences','Producing social posts','Aggregating results'].map((step, i) => <div key={i} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]"><span className="text-[10px]">{i+1}</span></div><span className="text-sm text-[hsl(250,15%,50%)]">{step}</span></div>)}</div></Card>}
          {!loading && !msg && <Card className="p-5"><div className="text-center py-8"><FiEdit3 size={32} className="mx-auto text-[hsl(250,15%,50%)] mb-3" /><p className="text-sm text-[hsl(250,15%,50%)]">Configure your campaign and click generate to create content</p></div></Card>}
        </div>
      </div>
    </div>
  )
}

/* ── Content Bank ──────────────────────────────────────── */

function ContentBank({ bank, setBank }: { bank: BankItem[]; setBank: React.Dispatch<React.SetStateAction<BankItem[]>> }) {
  const [tab, setTab] = useState<'ad'|'email'|'social'|'script'|'hook'>('ad')
  const [search, setSearch] = useState('')
  const [imgLoad, setImgLoad] = useState<string|null>(null)
  const [imgMsg, setImgMsg] = useState<{type:'success'|'error';message:string}|null>(null)

  const tabs: {id:'ad'|'email'|'social'|'script'|'hook';label:string}[] = [{id:'ad',label:'Ads'},{id:'email',label:'Emails'},{id:'social',label:'Social Posts'},{id:'script',label:'Scripts'},{id:'hook',label:'Hooks'}]
  const filtered = bank.filter(i => i.type === tab && (search === '' || i.content.toLowerCase().includes(search.toLowerCase()) || i.title.toLowerCase().includes(search.toLowerCase())))

  const genImg = useCallback(async (item: BankItem) => {
    setImgLoad(item.id); setImgMsg(null)
    try {
      const r = await callAIAgent(`Generate a compelling visual for this ${item.type} content:\nTitle: ${item.title}\nContent: ${item.content.substring(0,500)}\nPlatform: ${item.platform||'general'}`, AGENT.IMAGE_CREATOR)
      if (r.success) {
        const imgs = r.module_outputs?.artifact_files
        if (Array.isArray(imgs) && imgs.length > 0) { setBank(prev => prev.map(ci => ci.id === item.id ? {...ci, imageUrl: imgs[0].file_url} : ci)); setImgMsg({type:'success',message:'Image generated!'}) }
        else { setImgMsg({type:'success',message:'Image prompt created'}) }
      } else { setImgMsg({type:'error',message:r.error||'Image generation failed'}) }
    } catch (e: any) { setImgMsg({type:'error',message:e?.message||'Image generation failed'}) }
    finally { setImgLoad(null) }
  }, [setBank])

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Content Bank</h2><p className="text-sm text-[hsl(250,15%,50%)]">Review, edit, and manage generated content</p></div>
      {imgMsg && <Msg type={imgMsg.type} message={imgMsg.message} />}
      <div className="flex items-center gap-1 border-b border-[hsl(250,20%,88%)]">
        {tabs.map(t => { const cnt = bank.filter(i => i.type === t.id).length; return <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${tab === t.id ? 'border-[hsl(262,83%,58%)] text-[hsl(262,83%,58%)]' : 'border-transparent text-[hsl(250,15%,50%)] hover:text-[hsl(250,30%,12%)]'}`}>{t.label}{cnt > 0 && <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold ${tab === t.id ? 'bg-[hsl(262,83%,58%)] text-white' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>{cnt}</span>}</button> })}
      </div>
      <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(250,15%,50%)]" size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." className="w-full pl-10 pr-4 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] outline-none" /></div>
      {filtered.length === 0 ? <Empty icon={<FiArchive size={28}/>} title="No content yet" desc={`Generate campaign content to see ${tab}s here`} /> : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2">{item.platform && pIcon(item.platform)}<h4 className="text-sm font-semibold text-[hsl(250,30%,12%)] truncate max-w-[200px]">{item.title}</h4></div><Badge status={item.status} /></div>
              <p className="text-xs text-[hsl(250,15%,50%)] leading-relaxed mb-3 line-clamp-3">{item.content}</p>
              {item.imageUrl && <div className="mb-3 rounded-lg overflow-hidden border border-[hsl(250,20%,88%)]"><img src={item.imageUrl} alt="" className="w-full h-32 object-cover" /></div>}
              <div className="flex items-center gap-2">
                <button onClick={() => genImg(item)} disabled={imgLoad === item.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)] transition-colors disabled:opacity-50">{imgLoad === item.id ? <FiLoader size={12} className="animate-spin"/> : <FiImage size={12}/>} Generate Image</button>
                <button onClick={() => setBank(prev => prev.map(i => i.id === item.id ? {...i,status:'approved'} : i))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"><FiCheck size={12}/> Approve</button>
                <button onClick={() => setBank(prev => prev.filter(i => i.id !== item.id))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><FiTrash2 size={12}/></button>
                <button onClick={() => navigator.clipboard.writeText(item.content)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)] transition-colors"><FiCopy size={12}/></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Calendar ──────────────────────────────────────────── */

function CalendarScreen({ bank, cal, setCal }: { bank: BankItem[]; cal: CalEvent[]; setCal: React.Dispatch<React.SetStateAction<CalEvent[]>> }) {
  const [view, setView] = useState<'week'|'month'>('week')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{type:'success'|'error';message:string}|null>(null)
  const [post, setPost] = useState('')
  const [plat, setPlat] = useState('')
  const [time, setTime] = useState('')
  const approved = bank.filter(c => c.status === 'approved')

  const distribute = useCallback(async (instant = false) => {
    if (!post && approved.length === 0) { setMsg({type:'error',message:'No content to distribute.'}); return }
    setLoading(true); setMsg(null)
    try {
      const r = await callAIAgent(`${instant ? 'INSTANT PUBLISH' : 'Schedule'} content:\nContent: ${post || approved[0]?.content || 'Campaign content'}\nPlatform: ${plat || 'X (Twitter)'}\nTime: ${time || new Date().toISOString()}`, AGENT.DISTRIBUTION)
      if (r.success) {
        const d = parse(r)
        const posts = safe<any>(d.scheduled_posts)
        const evts: CalEvent[] = posts.length > 0 ? posts.map((sp: any, i: number) => ({id:`cal-${Date.now()}-${i}`,date:sp.scheduled_time||time||new Date().toISOString(),platform:sp.platform||plat||'X',content:sp.content_preview||post.substring(0,100),status:(instant?'published':'scheduled') as CalEvent['status']})) : [{id:`cal-${Date.now()}`,date:time||new Date().toISOString(),platform:plat||'X',content:post.substring(0,100)||'Scheduled post',status:(instant?'published':'scheduled') as CalEvent['status']}]
        setCal(prev => [...prev,...evts])
        setMsg({type:'success',message:d.message||(instant?'Published!':'Scheduled!')})
        setPost('')
      } else { setMsg({type:'error',message:r.error||'Distribution failed'}) }
    } catch(e:any) { setMsg({type:'error',message:e?.message||'Distribution failed'}) }
    finally { setLoading(false) }
  }, [post, plat, time, approved, setCal])

  const today = new Date()
  const week = Array.from({length:7},(_,i) => { const d = new Date(today); d.setDate(today.getDate()-today.getDay()+i); return d })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Content Calendar</h2><p className="text-sm text-[hsl(250,15%,50%)]">Schedule and distribute content across platforms</p></div><div className="flex items-center gap-2"><Btn2 onClick={() => setView('week')} className={view==='week'?'!bg-[hsl(262,83%,58%)] !text-white !border-[hsl(262,83%,58%)]':''}>Week</Btn2><Btn2 onClick={() => setView('month')} className={view==='month'?'!bg-[hsl(262,83%,58%)] !text-white !border-[hsl(262,83%,58%)]':''}>Month</Btn2></div></div>
      {msg && <Msg type={msg.type} message={msg.message} />}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3"><Card className="p-4"><div className="grid grid-cols-7 gap-2">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs font-medium text-[hsl(250,15%,50%)] py-2">{d}</div>)}{week.map((date,i) => { const ds = date.toISOString().split('T')[0]; const evs = cal.filter(e => e.date.startsWith(ds)); const isT = ds === today.toISOString().split('T')[0]; return <div key={i} className={`min-h-[100px] rounded-lg border p-2 ${isT?'border-[hsl(262,83%,58%)] bg-[hsl(262,83%,58%)]/5':'border-[hsl(250,20%,88%)]'}`}><span className={`text-xs font-medium ${isT?'text-[hsl(262,83%,58%)]':'text-[hsl(250,15%,50%)]'}`}>{date.getDate()}</span><div className="mt-1 space-y-1">{evs.map(ev => <div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)] truncate flex items-center gap-1">{pIcon(ev.platform)}<span className="truncate">{ev.content.substring(0,20)}</span></div>)}</div></div> })}</div></Card></div>
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Schedule Post</h3>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Platform</label><select value={plat} onChange={e => setPlat(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"><option value="">Select...</option>{PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Post Content</label><textarea value={post} onChange={e => setPost(e.target.value)} rows={3} placeholder="Enter post content..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" /></div>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Schedule Time</label><input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" /></div>
            <Btn onClick={() => distribute(false)} loading={loading} disabled={loading} className="w-full justify-center text-xs"><FiSend size={13}/> Schedule & Distribute</Btn>
            <button onClick={() => distribute(true)} disabled={loading} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[0.875rem] text-xs font-semibold bg-[hsl(174,72%,40%)] text-white hover:bg-[hsl(174,72%,35%)] transition-all disabled:opacity-50 shadow-md"><FiZap size={13}/> Rocket Post</button>
          </Card>
          <Card className="p-4"><h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-3">Approved Queue ({approved.length})</h3>{approved.length === 0 ? <p className="text-xs text-[hsl(250,15%,50%)]">Approve content in the Content Bank to queue it</p> : <div className="space-y-2 max-h-60 overflow-y-auto">{approved.slice(0,5).map(item => <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[hsl(250,20%,88%)]">{item.platform && pIcon(item.platform)}<span className="text-[11px] text-[hsl(250,30%,12%)] truncate">{item.title}</span></div>)}</div>}</Card>
        </div>
      </div>
    </div>
  )
}

/* ── Email Automation ──────────────────────────────────── */

function EmailScreen() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{type:'success'|'error'|'info';message:string}|null>(null)
  const [email, setEmail] = useState('')
  const [subj, setSubj] = useState('')
  const [body, setBody] = useState('')
  const [seqType, setSeqType] = useState('welcome')
  const [activeSeqs, setActiveSeqs] = useState<Record<string,boolean>>({})
  const [last, setLast] = useState<any>(null)

  const seqs = [
    {type:'welcome',label:'Welcome Sequence',desc:'Introduce brand & deliver value',emails:5,subs:342},
    {type:'pitch',label:'Product Pitch',desc:'Build desire and close the sale',emails:6,subs:198},
    {type:'follow-up',label:'Follow-Up',desc:'Post-purchase engagement',emails:4,subs:156},
    {type:'abandoned_funnel',label:'Abandoned Funnel',desc:'Recover lost leads',emails:3,subs:89},
    {type:'upsell',label:'Upsell',desc:'Cross-sells and upgrades',emails:4,subs:124},
    {type:'bonus_delivery',label:'Bonus Delivery',desc:'Deliver and highlight bonuses',emails:3,subs:267},
    {type:'newsletter',label:'Newsletter',desc:'Regular value-driven updates',emails:1,subs:1024},
  ]

  const activate = useCallback(async () => {
    if (!email) { setMsg({type:'error',message:'Please enter a recipient email'}); return }
    setLoading(true); setMsg(null)
    try {
      const r = await callAIAgent(`Activate a ${seqType} email sequence:\nRecipient: ${email}\nSubject: ${subj || `Your ${seqType} sequence has started`}\nBody: ${body || `Automated ${seqType} email.`}\nSequence Type: ${seqType}\nSend first email via Gmail.`, AGENT.EMAIL_AUTOMATION)
      if (r.success) { const d = parse(r); setLast(d); setActiveSeqs(prev => ({...prev,[seqType]:true})); setMsg({type:'success',message:d.message||`${seqType} sequence activated!`}) }
      else { setMsg({type:'error',message:r.error||'Activation failed'}) }
    } catch(e:any) { setMsg({type:'error',message:e?.message||'Activation failed'}) }
    finally { setLoading(false) }
  }, [email, subj, body, seqType])

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Email Automation</h2><p className="text-sm text-[hsl(250,15%,50%)]">Configure and manage email nurture sequences</p></div>
      {msg && <Msg type={msg.type} message={msg.message} />}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-3">
          {seqs.map(seq => (
            <Card key={seq.type} className={`p-4 transition-all ${seqType===seq.type?'ring-2 ring-[hsl(262,83%,58%)]':''}`} onClick={() => setSeqType(seq.type)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSeqs[seq.type]?'bg-green-100 text-green-600':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}><FiMail size={18}/></div><div><h4 className="text-sm font-semibold text-[hsl(250,30%,12%)]">{seq.label}</h4><p className="text-xs text-[hsl(250,15%,50%)]">{seq.desc}</p></div></div>
                <div className="flex items-center gap-4"><div className="text-right"><p className="text-xs text-[hsl(250,15%,50%)]">{seq.emails} emails</p><p className="text-xs text-[hsl(250,15%,50%)]">{seq.subs} subscribers</p></div><Badge status={activeSeqs[seq.type]?'active':'paused'}/></div>
              </div>
              <div className="mt-3 flex items-center gap-1">{Array.from({length:seq.emails},(_,i) => <div key={i} className="flex items-center"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${activeSeqs[seq.type]?'bg-[hsl(262,83%,58%)] text-white':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>{i+1}</div>{i<seq.emails-1 && <div className={`w-4 h-0.5 ${activeSeqs[seq.type]?'bg-[hsl(262,83%,58%)]':'bg-[hsl(250,18%,90%)]'}`}/>}</div>)}</div>
            </Card>
          ))}
        </div>
        <div className="col-span-2 space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Activate Sequence</h3>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Sequence Type</label><select value={seqType} onChange={e => setSeqType(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]">{SEQ_TYPES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Recipient Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="lead@example.com" className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Subject Line</label><input type="text" value={subj} onChange={e => setSubj(e.target.value)} placeholder="Welcome to your journey..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
            <div><label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Email Body</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Enter the email content..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
            <Btn onClick={activate} loading={loading} disabled={loading} className="w-full justify-center text-xs"><FiSend size={13}/> Activate Sequence</Btn>
          </Card>
          {last && <Card className="p-4"><h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-2">Last Activation</h3><div className="space-y-1.5"><div className="flex justify-between text-xs"><span className="text-[hsl(250,15%,50%)]">Status</span><Badge status={last.status||'active'}/></div><div className="flex justify-between text-xs"><span className="text-[hsl(250,15%,50%)]">Sequence</span><span className="text-[hsl(250,30%,12%)] font-medium">{last.sequence_type||seqType}</span></div><div className="flex justify-between text-xs"><span className="text-[hsl(250,15%,50%)]">Emails Queued</span><span className="text-[hsl(250,30%,12%)] font-medium">{last.emails_queued||0}</span></div><div className="flex justify-between text-xs"><span className="text-[hsl(250,15%,50%)]">Next Email</span><span className="text-[hsl(250,30%,12%)] font-medium">{last.next_email_time||'Pending'}</span></div></div></Card>}
          <Card className="p-4"><h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-3">Email Performance</h3><div className="grid grid-cols-3 gap-2">{[{l:'Open Rate',v:'42.3%'},{l:'Click Rate',v:'8.7%'},{l:'Unsub Rate',v:'0.4%'}].map(m => <div key={m.l} className="text-center p-2 rounded-lg bg-white border border-[hsl(250,20%,88%)]"><p className="text-sm font-bold text-[hsl(250,30%,12%)]">{m.v}</p><p className="text-[10px] text-[hsl(250,15%,50%)]">{m.l}</p></div>)}</div></Card>
        </div>
      </div>
    </div>
  )
}

/* ── Analytics ─────────────────────────────────────────── */

function AnalyticsScreen() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{type:'success'|'error';message:string}|null>(null)
  const [input, setInput] = useState('')
  const [data, setData] = useState<{performance_summary?:string;kpi_analysis?:KpiItem[];ab_test_results?:AbTest[];optimization_suggestions?:OptSugg[];traffic_breakdown?:TrafficItem[]}|null>(null)

  const analyze = useCallback(async () => {
    setLoading(true); setMsg(null)
    try {
      const r = await callAIAgent(`Analyze funnel performance:\n${input || 'Campaign: Digital Products Funnel\nPeriod: Last 30 days\nClicks: 12,450\nEPC: $2.47\nConversions: 478\nRate: 3.84%\nRevenue: $8,942\nRefund Rate: 2.1%\nTraffic: Facebook 45%, Pinterest 22%, Instagram 18%, X 10%, LinkedIn 5%\nA/B Tests: Headline (Transform vs Journey), Image (Photo vs Illustration), Subject (Question vs Statement)\nProvide KPI analysis, A/B test results, traffic breakdown, and optimization suggestions.'}`, AGENT.ANALYTICS)
      if (r.success) { setData(parse(r)); setMsg({type:'success',message:'Analysis complete!'}) }
      else { setMsg({type:'error',message:r.error||'Analysis failed'}) }
    } catch(e:any) { setMsg({type:'error',message:e?.message||'Analysis failed'}) }
    finally { setLoading(false) }
  }, [input])

  const kpis = safe<KpiItem>(data?.kpi_analysis)
  const tests = safe<AbTest>(data?.ab_test_results)
  const suggs = safe<OptSugg>(data?.optimization_suggestions)
  const traffic = safe<TrafficItem>(data?.traffic_breakdown)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Analytics Dashboard</h2><p className="text-sm text-[hsl(250,15%,50%)]">Performance tracking, A/B testing, and AI optimization</p></div><Btn onClick={analyze} loading={loading} disabled={loading}><FiBarChart2 size={16}/> Analyze Performance</Btn></div>
      {msg && <Msg type={msg.type} message={msg.message} />}
      <Card className="p-4"><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Metrics (optional)</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="Paste metrics here, or leave blank for sample data..." className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm resize-none focus:ring-2 focus:ring-[hsl(262,83%,58%)] outline-none"/></Card>
      {loading && <div className="grid grid-cols-3 gap-4">{Array.from({length:6},(_,i) => <Skel key={i}/>)}</div>}
      {data && !loading && <>
        {data.performance_summary && <Card className="p-5"><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-2">Performance Summary</h3><p className="text-sm text-[hsl(250,15%,50%)] leading-relaxed">{data.performance_summary}</p></Card>}
        {kpis.length > 0 && <div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">Key Metrics</h3><div className="grid grid-cols-3 gap-4">{kpis.map((k,i) => <Card key={i} className="p-4"><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-[hsl(250,15%,50%)]">{k.metric}</span><span className={`flex items-center gap-1 text-xs font-medium ${k.trend?.includes('+')||k.trend?.toLowerCase().includes('up')?'text-green-600':'text-red-500'}`}>{k.trend?.includes('+')||k.trend?.toLowerCase().includes('up')?<FiTrendingUp size={12}/>:<FiTrendingDown size={12}/>}{k.trend}</span></div><p className="text-xl font-bold text-[hsl(250,30%,12%)]">{k.value}</p><p className="text-xs text-[hsl(250,15%,50%)] mt-1">{k.insight}</p></Card>)}</div></div>}
        {traffic.length > 0 && <Card className="p-5"><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Traffic Source Breakdown</h3><div className="space-y-3">{traffic.map((t,i) => { const mx = Math.max(...traffic.map(tr => parseInt(tr.clicks?.replace(/,/g,'')||'0')||1)); const pct = (parseInt(t.clicks?.replace(/,/g,'')||'0')/mx)*100; return <div key={i}><div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2">{pIcon(t.source)}<span className="text-sm font-medium text-[hsl(250,30%,12%)]">{t.source}</span></div><div className="flex items-center gap-4 text-xs text-[hsl(250,15%,50%)]"><span>{t.clicks} clicks</span><span>{t.conversions} conv.</span><span className="font-semibold text-[hsl(262,83%,58%)]">${t.epc} EPC</span></div></div><div className="w-full h-2 rounded-full bg-[hsl(250,18%,90%)]"><div className="h-full rounded-full bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(174,72%,40%)]" style={{width:`${pct}%`}}/></div></div> })}</div></Card>}
        <div className="grid grid-cols-2 gap-6">
          {tests.length > 0 && <div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">A/B Test Results</h3><div className="space-y-3">{tests.map((t,i) => <Card key={i} className="p-4"><h4 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-2">{t.test_name}</h4><div className="grid grid-cols-2 gap-2 mb-2"><div className={`p-2 rounded-lg text-xs border ${t.winner?.toLowerCase().includes('a')?'border-green-300 bg-green-50':'border-[hsl(250,20%,88%)]'}`}><p className="font-medium text-[hsl(250,30%,12%)]">Variant A</p><p className="text-[hsl(250,15%,50%)] mt-0.5">{t.variant_a}</p>{t.winner?.toLowerCase().includes('a') && <span className="inline-flex items-center gap-1 mt-1 text-green-600 font-semibold"><FiCheck size={10}/> Winner</span>}</div><div className={`p-2 rounded-lg text-xs border ${t.winner?.toLowerCase().includes('b')?'border-green-300 bg-green-50':'border-[hsl(250,20%,88%)]'}`}><p className="font-medium text-[hsl(250,30%,12%)]">Variant B</p><p className="text-[hsl(250,15%,50%)] mt-0.5">{t.variant_b}</p>{t.winner?.toLowerCase().includes('b') && <span className="inline-flex items-center gap-1 mt-1 text-green-600 font-semibold"><FiCheck size={10}/> Winner</span>}</div></div><p className="text-[10px] text-[hsl(250,15%,50%)]">Confidence: {t.confidence}</p></Card>)}</div></div>}
          {suggs.length > 0 && <div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">AI Optimization Suggestions</h3><div className="space-y-3">{suggs.map((s,i) => { const pc: Record<string,string> = {high:'bg-red-100 text-red-700',medium:'bg-yellow-100 text-yellow-700',low:'bg-green-100 text-green-700'}; return <Card key={i} className="p-4"><div className="flex items-start justify-between mb-1"><span className="text-xs font-semibold text-[hsl(262,83%,58%)]">{s.area}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pc[s.priority?.toLowerCase()]||'bg-gray-100 text-gray-600'}`}>{s.priority}</span></div><p className="text-sm text-[hsl(250,30%,12%)] mb-1">{s.suggestion}</p><p className="text-xs text-[hsl(250,15%,50%)]">Expected impact: {s.expected_impact}</p></Card> })}</div></div>}
        </div>
      </>}
      {!data && !loading && <Empty icon={<FiBarChart2 size={28}/>} title="No analysis yet" desc="Click 'Analyze Performance' to get AI-powered insights" action="Analyze Performance" onAction={analyze}/>}
    </div>
  )
}

/* ── Settings ──────────────────────────────────────────── */

function SettingsScreen({ appName, appTag, setName, setTag }: { appName: string; appTag: string; setName: (n: string) => void; setTag: (t: string) => void }) {
  const [n, setN] = useState(appName)
  const [t, setT] = useState(appTag)
  const [saved, setSaved] = useState(false)
  const save = () => { setName(n.trim()||'FunnelForge'); setTag(t.trim()||'Sales Funnel Automation'); setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Settings</h2><p className="text-sm text-[hsl(250,15%,50%)]">Customize your app preferences</p></div>
      {saved && <Msg type="success" message="Settings saved successfully!" />}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center"><FiSettings size={20} className="text-[hsl(262,83%,58%)]"/></div><div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Branding</h3><p className="text-xs text-[hsl(250,15%,50%)]">Change how your app appears</p></div></div>
        <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">App Name</label><input type="text" value={n} onChange={e => setN(e.target.value)} placeholder="FunnelForge" className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"/><p className="text-xs text-[hsl(250,15%,50%)] mt-1">This name appears in the sidebar header</p></div>
        <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Tagline</label><input type="text" value={t} onChange={e => setT(e.target.value)} placeholder="Sales Funnel Automation" className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"/><p className="text-xs text-[hsl(250,15%,50%)] mt-1">Short description below the app name</p></div>
        <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Preview</label><div className="inline-flex flex-col gap-0.5 px-5 py-4 rounded-[0.875rem] bg-[hsl(250,22%,95%)] border border-[hsl(250,20%,88%)]"><span className="text-lg font-bold tracking-[-0.01em] text-[hsl(250,30%,12%)] font-serif">{n||'FunnelForge'}</span><span className="text-xs text-[hsl(250,15%,50%)]">{t||'Sales Funnel Automation'}</span></div></div>
        <Btn onClick={save} className="w-full justify-center"><FiCheck size={16}/> Save Changes</Btn>
      </Card>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center"><FiArchive size={20} className="text-[hsl(262,83%,58%)]"/></div><div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Products & Offers</h3><p className="text-xs text-[hsl(250,15%,50%)]">Your current products and affiliate offers</p></div></div>
        <div className="space-y-2">{PRODUCTS.map(p => <div key={p} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-[hsl(250,20%,88%)]"><span className="text-sm text-[hsl(250,30%,12%)]">{p}</span><Badge status="active"/></div>)}</div>
      </Card>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center"><FiExternalLink size={20} className="text-[hsl(262,83%,58%)]"/></div><div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Connected Platforms</h3><p className="text-xs text-[hsl(250,15%,50%)]">Active integrations</p></div></div>
        <div className="grid grid-cols-2 gap-3">{PLATFORMS.map(p => { const I = p.icon; return <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[hsl(250,20%,88%)]"><I size={18} style={{color:p.color}}/><div className="flex-1"><span className="text-sm font-medium text-[hsl(250,30%,12%)]">{p.label}</span></div><Badge status={p.id==='x'?'active':'draft'}/></div> })}</div>
        <p className="text-xs text-[hsl(250,15%,50%)]">Twitter/X and Gmail are connected via Composio. Other platforms require manual API setup.</p>
      </Card>
    </div>
  )
}

/* ── Main App ──────────────────────────────────────────── */

export default function FunnelForgePage() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [bank, setBank] = useState<BankItem[]>([])
  const [cal, setCal] = useState<CalEvent[]>([])
  const [appName, setAppName] = useState('FunnelForge')
  const [appTag, setAppTag] = useState('Sales Funnel Automation')

  const onGenerated = useCallback((data: ContentData) => {
    const items: BankItem[] = []
    let c = Date.now()
    safe<AdCopy>(data.ad_copies).forEach(ad => items.push({id:`cb-${c++}`,type:'ad',title:ad.headline||'Ad Copy',content:ad.body||'',platform:ad.platform,status:'draft',raw:ad}))
    safe<Hook>(data.hooks).forEach(h => items.push({id:`cb-${c++}`,type:'hook',title:h.type||'Hook',content:h.text||'',status:'draft',raw:h}))
    safe<ScriptData>(data.scripts).forEach(s => items.push({id:`cb-${c++}`,type:'script',title:s.format||'Script',content:s.script||'',status:'draft',raw:s}))
    safe<EmailSequence>(data.email_sequences).forEach(seq => safe<EmailItem>(seq.emails).forEach(em => items.push({id:`cb-${c++}`,type:'email',title:em.subject_line||`${seq.sequence_type} Email #${em.order}`,content:em.body||'',status:'draft',raw:{...em,sequence_type:seq.sequence_type}})))
    safe<SocialPost>(data.social_posts).forEach(p => items.push({id:`cb-${c++}`,type:'social',title:`${p.platform||'Social'} - ${p.content_type||'Post'}`,content:p.caption||'',platform:p.platform,status:'draft',raw:p}))
    setBank(prev => [...prev,...items])
    setScreen('content-bank')
  }, [])

  const titles: Record<Screen, string> = { dashboard:'Campaign Hub', generator:'Content Generator', 'content-bank':'Content Bank', calendar:'Content Calendar', email:'Email Automation', analytics:'Analytics', settings:'Settings' }

  return (
    <div className="flex min-h-screen" style={{background:'linear-gradient(135deg, hsl(250,30%,97%) 0%, hsl(260,25%,95%) 35%, hsl(240,20%,96%) 70%, hsl(270,20%,97%) 100%)'}}>
      <Sidebar active={screen} go={setScreen} name={appName} tag={appTag} />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 px-8 py-4 border-b border-[hsl(250,20%,88%)] bg-[hsl(250,25%,98%)]/80 backdrop-blur-[16px]">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><h2 className="text-lg font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em]">{titles[screen]}</h2><Badge status="active"/></div><span className="text-xs text-[hsl(250,15%,50%)]">{bank.length} content pieces</span></div>
        </header>
        <div className="px-8 py-6">
          {screen === 'dashboard' && <Dashboard go={setScreen} bank={bank} cal={cal} />}
          {screen === 'generator' && <Generator onDone={onGenerated} />}
          {screen === 'content-bank' && <ContentBank bank={bank} setBank={setBank} />}
          {screen === 'calendar' && <CalendarScreen bank={bank} cal={cal} setCal={setCal} />}
          {screen === 'email' && <EmailScreen />}
          {screen === 'analytics' && <AnalyticsScreen />}
          {screen === 'settings' && <SettingsScreen appName={appName} appTag={appTag} setName={setAppName} setTag={setAppTag} />}
        </div>
      </main>
    </div>
  )
}

'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { FiHome, FiEdit3, FiArchive, FiCalendar, FiMail, FiBarChart2, FiImage, FiSend, FiZap, FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiCheck, FiX, FiLoader, FiChevronRight, FiSearch, FiTrash2, FiExternalLink, FiCopy, FiSettings } from 'react-icons/fi'
import { BsFacebook, BsInstagram, BsPinterest, BsLinkedin, BsTiktok, BsTwitterX } from 'react-icons/bs'

const AG = { CO:'699a247e738daf1ab82e84fe', IMG:'699a24ad8a81cf15f59e03b0', DIST:'699a24ca520a48afa0342d47', EM:'699a24cb8a81cf15f59e03b4', AN:'699a24ae4274f089c16d43f7' }
type Scr = 'dashboard'|'generator'|'content-bank'|'calendar'|'email'|'analytics'|'settings'
interface BI { id:string; type:'ad'|'email'|'social'|'script'|'hook'; content:string; title:string; platform?:string; status:'draft'|'approved'|'published'; imageUrl?:string; raw?:any }
interface CE { id:string; date:string; platform:string; content:string; status:'queued'|'scheduled'|'published' }
const PLATS = [{id:'facebook',label:'Facebook',Ic:BsFacebook,c:'#1877F2'},{id:'instagram',label:'Instagram',Ic:BsInstagram,c:'#E4405F'},{id:'pinterest',label:'Pinterest',Ic:BsPinterest,c:'#BD081C'},{id:'linkedin',label:'LinkedIn',Ic:BsLinkedin,c:'#0A66C2'},{id:'tiktok',label:'TikTok',Ic:BsTiktok,c:'#000'},{id:'x',label:'X',Ic:BsTwitterX,c:'#000'}]
const PRODS = ['Coloring Book Journey','Adoptee Checklist','Guide','Journal','Tedswoodworking+ Affiliate']
const SEQS = ['welcome','pitch','follow-up','abandoned_funnel','upsell','bonus_delivery','newsletter']

function sa<T>(v:unknown):T[] { return Array.isArray(v)?v:[] }
function pr(r:any):Record<string,any> { try { if(!r?.response?.result) return {}; const d=r.response.result; if(typeof d==='string'){try{return JSON.parse(d)}catch{return{text:d}}} return d }catch{return{}} }
function pi(p:string) { const l=p.toLowerCase(); if(l.includes('facebook')) return <BsFacebook className="text-[#1877F2]"/>; if(l.includes('instagram')) return <BsInstagram className="text-[#E4405F]"/>; if(l.includes('pinterest')) return <BsPinterest className="text-[#BD081C]"/>; if(l.includes('linkedin')) return <BsLinkedin className="text-[#0A66C2]"/>; if(l.includes('tiktok')) return <BsTiktok/>; if(l.includes('x')||l.includes('twitter')) return <BsTwitterX/>; return <FiExternalLink/> }

const C='rounded-[14px] border border-white/[0.18] bg-[hsl(250,25%,96%)]/75 backdrop-blur-[16px] shadow-md'

export default function Page() {
  const [scr,setScr]=useState<Scr>('dashboard')
  const [bank,setBank]=useState<BI[]>([])
  const [cal,setCal]=useState<CE[]>([])
  const [appN,setAppN]=useState('FunnelForge')
  const [appT,setAppT]=useState('Sales Funnel Automation')

  const onGen=useCallback((d:any)=>{
    const items:BI[]=[]; let n=Date.now()
    sa<any>(d.ad_copies).forEach((a:any)=>items.push({id:`cb-${n++}`,type:'ad',title:a.headline||'Ad',content:a.body||'',platform:a.platform,status:'draft',raw:a}))
    sa<any>(d.hooks).forEach((h:any)=>items.push({id:`cb-${n++}`,type:'hook',title:h.type||'Hook',content:h.text||'',status:'draft',raw:h}))
    sa<any>(d.scripts).forEach((s:any)=>items.push({id:`cb-${n++}`,type:'script',title:s.format||'Script',content:s.script||'',status:'draft',raw:s}))
    sa<any>(d.email_sequences).forEach((seq:any)=>sa<any>(seq.emails).forEach((em:any)=>items.push({id:`cb-${n++}`,type:'email',title:em.subject_line||'Email',content:em.body||'',status:'draft',raw:em})))
    sa<any>(d.social_posts).forEach((p:any)=>items.push({id:`cb-${n++}`,type:'social',title:`${p.platform||'Social'} - ${p.content_type||'Post'}`,content:p.caption||'',platform:p.platform,status:'draft',raw:p}))
    setBank(prev=>[...prev,...items]); setScr('content-bank')
  },[])

  const nav:[Scr,string,React.ReactNode][]=[['dashboard','Dashboard',<FiHome key="h" size={18}/>],['generator','Content Generator',<FiEdit3 key="e" size={18}/>],['content-bank','Content Bank',<FiArchive key="a" size={18}/>],['calendar','Content Calendar',<FiCalendar key="c" size={18}/>],['email','Email Automation',<FiMail key="m" size={18}/>],['analytics','Analytics',<FiBarChart2 key="b" size={18}/>],['settings','Settings',<FiSettings key="s" size={18}/>]]

  return (
    <div className="flex min-h-screen" style={{background:'linear-gradient(135deg,hsl(250,30%,97%),hsl(260,25%,95%),hsl(240,20%,96%),hsl(270,20%,97%))'}}>
      <aside className="w-60 min-h-screen bg-[hsl(250,22%,95%)] border-r border-[hsl(250,20%,88%)] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-[hsl(250,20%,88%)]">
          <h1 className="text-xl font-bold text-[hsl(250,30%,12%)] font-serif">{appN}</h1>
          <p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{appT}</p>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {nav.map(([id,label,icon])=><button key={id} onClick={()=>setScr(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-sm font-medium transition-all ${scr===id?'bg-[hsl(262,83%,58%)] text-white shadow-md':'text-[hsl(250,30%,12%)] hover:bg-[hsl(250,20%,90%)]'}`}>{icon}{label}</button>)}
        </nav>
        <div className="px-4 py-4 border-t border-[hsl(250,20%,88%)]"><p className="text-[10px] text-[hsl(250,15%,50%)]">Powered by AI Agents</p></div>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 px-8 py-4 border-b border-[hsl(250,20%,88%)] bg-[hsl(250,25%,98%)]/80 backdrop-blur-[16px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[hsl(250,30%,12%)]">{nav.find(n=>n[0]===scr)?.[1]}</h2>
            <span className="text-xs text-[hsl(250,15%,50%)]">{bank.length} content pieces</span>
          </div>
        </header>
        <div className="px-8 py-6">
          {scr==='dashboard'&&<DashView go={setScr} bank={bank} cal={cal}/>}
          {scr==='generator'&&<GenView onDone={onGen}/>}
          {scr==='content-bank'&&<BankView bank={bank} setBank={setBank}/>}
          {scr==='calendar'&&<CalView bank={bank} cal={cal} setCal={setCal}/>}
          {scr==='email'&&<EmailView/>}
          {scr==='analytics'&&<AnaView/>}
          {scr==='settings'&&<SetView n={appN} t={appT} sn={setAppN} st={setAppT}/>}
        </div>
      </main>
    </div>
  )
}

function DashView({go,bank,cal}:{go:(s:Scr)=>void;bank:BI[];cal:CE[]}) {
  const kpis=[{l:'Total Leads',v:'1,284',t:'+12%',i:<FiUsers size={18}/>},{l:'Conversion Rate',v:'3.8%',t:'+0.5%',i:<FiTarget size={18}/>},{l:'EPC',v:'$2.47',t:'+$0.12',i:<FiDollarSign size={18}/>},{l:'Revenue',v:'$8,942',t:'+18%',i:<FiDollarSign size={18}/>},{l:'Active Sequences',v:'4',t:'stable',i:<FiMail size={18}/>},{l:'Scheduled Posts',v:String(cal.length||12),t:'+3',i:<FiCalendar size={18}/>}]
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Dashboard</h2><p className="text-sm text-[hsl(250,15%,50%)]">Campaign overview and quick actions</p></div>
      <div className="grid grid-cols-3 gap-4">{kpis.map(k=><div key={k.l} className={C+' p-4'}><div className="flex items-center justify-between mb-2"><span className="text-[hsl(250,15%,50%)]">{k.i}</span><span className="text-xs font-medium text-green-600 flex items-center gap-1"><FiTrendingUp size={12}/>{k.t}</span></div><p className="text-2xl font-bold text-[hsl(250,30%,12%)]">{k.v}</p><p className="text-xs text-[hsl(250,15%,50%)] mt-1">{k.l}</p></div>)}</div>
      <div className="grid grid-cols-2 gap-6">
        <div className={C+' p-5'}><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Quick Actions</h3><div className="space-y-3"><button onClick={()=>go('generator')} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] shadow-md"><FiZap size={16}/>Generate Campaign Content</button><button onClick={()=>go('calendar')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium border border-[hsl(250,20%,88%)] bg-[hsl(250,20%,92%)]"><FiCalendar size={16}/>View Calendar</button><button onClick={()=>go('analytics')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium border border-[hsl(250,20%,88%)] bg-[hsl(250,20%,92%)]"><FiBarChart2 size={16}/>Check Analytics</button></div></div>
        <div className={C+' p-5'}><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Recent Activity</h3><div className="space-y-3">{['Campaign content generated for Coloring Book Journey|2 min ago','3 posts scheduled for Facebook & Instagram|15 min ago','Welcome email sequence activated|1 hr ago','New lead captured from Pinterest ad|2 hrs ago'].map((a,i)=>{const[txt,tm]=a.split('|');return<div key={i} className="flex items-start gap-3"><div className="w-2 h-2 mt-1.5 rounded-full bg-[hsl(262,83%,58%)] shrink-0"/><div><p className="text-sm text-[hsl(250,30%,12%)]">{txt}</p><p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{tm}</p></div></div>})}</div></div>
      </div>
      {bank.length>0&&<div className={C+' p-5'}><div className="flex items-center justify-between mb-3"><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Content Bank</h3><button onClick={()=>go('content-bank')} className="flex items-center gap-1 px-4 py-2 rounded-[14px] text-sm font-medium border border-[hsl(250,20%,88%)] bg-[hsl(250,20%,92%)]">View All<FiChevronRight size={14}/></button></div><p className="text-sm text-[hsl(250,15%,50%)]">{bank.length} content pieces generated</p></div>}
    </div>
  )
}

function GenView({onDone}:{onDone:(d:any)=>void}) {
  const [prod,setProd]=useState(''); const [plts,setPlts]=useState<string[]>([]); const [brief,setBrief]=useState(''); const [ld,setLd]=useState(false); const [msg,setMsg]=useState<{t:string;m:string}|null>(null)
  const run=useCallback(async()=>{
    if(!prod){setMsg({t:'error',m:'Please select a product'});return}
    if(!plts.length){setMsg({t:'error',m:'Please select at least one platform'});return}
    setLd(true);setMsg(null)
    try{const r=await callAIAgent(`Generate campaign content for:\nProduct: ${prod}\nPlatforms: ${plts.join(', ')}\nBrief: ${brief||'Create engaging content.'}\nGenerate ad copy, hooks, email sequences, social posts, scripts.`,AG.CO);if(r.success){onDone(pr(r));setMsg({t:'success',m:'Content generated!'})}else{setMsg({t:'error',m:r.error||'Failed'})}}catch(e:any){setMsg({t:'error',m:e?.message||'Failed'})}finally{setLd(false)}
  },[prod,plts,brief,onDone])
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Content Generator</h2><p className="text-sm text-[hsl(250,15%,50%)]">Configure and generate AI-powered campaign content</p></div>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3"><div className={C+' p-5 space-y-4'}>
          <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Product / Offer</label><select value={prod} onChange={e=>setProd(e.target.value)} className="w-full px-3 py-2.5 rounded-[14px] border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"><option value="">Select a product...</option>{PRODS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Target Platforms</label><div className="flex flex-wrap gap-2">{PLATS.map(p=>{const sel=plts.includes(p.id);return<button key={p.id} onClick={()=>setPlts(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${sel?'bg-[hsl(262,83%,58%)] text-white border-[hsl(262,83%,58%)]':'bg-white text-[hsl(250,25%,18%)] border-[hsl(250,20%,88%)] hover:border-[hsl(262,83%,58%)]'}`}><p.Ic size={13}/>{p.label}</button>})}</div></div>
          <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Brief</label><textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={4} placeholder="Describe your target audience, goals..." className="w-full px-3 py-2.5 rounded-[14px] border border-[hsl(250,20%,88%)] bg-white text-sm resize-none outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
          <button onClick={run} disabled={ld} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] shadow-md disabled:opacity-50">{ld&&<FiLoader className="animate-spin" size={16}/>}<FiZap size={16}/>Generate Campaign Content</button>
        </div></div>
        <div className="col-span-2">{msg&&<div className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-sm ${msg.t==='success'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{msg.t==='success'?<FiCheck size={16}/>:<FiX size={16}/>}<span>{msg.m}</span></div>}{!msg&&!ld&&<div className={C+' p-5'}><div className="text-center py-8"><FiEdit3 size={32} className="mx-auto text-[hsl(250,15%,50%)] mb-3"/><p className="text-sm text-[hsl(250,15%,50%)]">Configure your campaign and click generate</p></div></div>}</div>
      </div>
    </div>
  )
}

function BankView({bank,setBank}:{bank:BI[];setBank:React.Dispatch<React.SetStateAction<BI[]>>}) {
  const [tab,setTab]=useState<BI['type']>('ad'); const [search,setSearch]=useState(''); const [imgLd,setImgLd]=useState<string|null>(null)
  const tabs:[BI['type'],string][]=[['ad','Ads'],['email','Emails'],['social','Social Posts'],['script','Scripts'],['hook','Hooks']]
  const filt=bank.filter(i=>i.type===tab&&(!search||i.content.toLowerCase().includes(search.toLowerCase())||i.title.toLowerCase().includes(search.toLowerCase())))
  const genImg=useCallback(async(item:BI)=>{
    setImgLd(item.id);try{const r=await callAIAgent(`Generate visual for: ${item.title}\n${item.content.substring(0,300)}`,AG.IMG);if(r.success){const imgs=r.module_outputs?.artifact_files;if(Array.isArray(imgs)&&imgs.length>0)setBank(prev=>prev.map(ci=>ci.id===item.id?{...ci,imageUrl:imgs[0].file_url}:ci))}}catch{}finally{setImgLd(null)}
  },[setBank])
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Content Bank</h2><p className="text-sm text-[hsl(250,15%,50%)]">Review, edit, and manage generated content</p></div>
      <div className="flex items-center gap-1 border-b border-[hsl(250,20%,88%)]">{tabs.map(([id,lb])=>{const cnt=bank.filter(i=>i.type===id).length;return<button key={id} onClick={()=>setTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${tab===id?'border-[hsl(262,83%,58%)] text-[hsl(262,83%,58%)]':'border-transparent text-[hsl(250,15%,50%)] hover:text-[hsl(250,30%,12%)]'}`}>{lb}{cnt>0&&<span className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center ${tab===id?'bg-[hsl(262,83%,58%)] text-white':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>{cnt}</span>}</button>})}</div>
      <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(250,15%,50%)]" size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search content..." className="w-full pl-10 pr-4 py-2.5 rounded-[14px] border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
      {filt.length===0?<div className="text-center py-16"><FiArchive size={28} className="mx-auto text-[hsl(250,15%,50%)] mb-3"/><p className="text-lg font-semibold text-[hsl(250,30%,12%)]">No content yet</p><p className="text-sm text-[hsl(250,15%,50%)]">Generate campaign content to see {tab}s here</p></div>:(
        <div className="grid grid-cols-2 gap-4">{filt.map(item=><div key={item.id} className={C+' p-4'}>
          <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2">{item.platform&&pi(item.platform)}<h4 className="text-sm font-semibold text-[hsl(250,30%,12%)] truncate max-w-[200px]">{item.title}</h4></div><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status==='approved'?'bg-green-100 text-green-700':item.status==='published'?'bg-purple-100 text-purple-700':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>{item.status}</span></div>
          <p className="text-xs text-[hsl(250,15%,50%)] leading-relaxed mb-3 line-clamp-3">{item.content}</p>
          {item.imageUrl&&<div className="mb-3 rounded-lg overflow-hidden border border-[hsl(250,20%,88%)]"><img src={item.imageUrl} alt="" className="w-full h-32 object-cover"/></div>}
          <div className="flex items-center gap-2">
            <button onClick={()=>genImg(item)} disabled={imgLd===item.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)] disabled:opacity-50">{imgLd===item.id?<FiLoader size={12} className="animate-spin"/>:<FiImage size={12}/>}Image</button>
            <button onClick={()=>setBank(p=>p.map(i=>i.id===item.id?{...i,status:'approved'}:i))} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100"><FiCheck size={12}/>Approve</button>
            <button onClick={()=>setBank(p=>p.filter(i=>i.id!==item.id))} className="px-2 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FiTrash2 size={12}/></button>
            <button onClick={()=>navigator.clipboard.writeText(item.content)} className="px-2 py-1.5 text-xs rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)]"><FiCopy size={12}/></button>
          </div>
        </div>)}</div>
      )}
    </div>
  )
}

function CalView({bank,cal,setCal}:{bank:BI[];cal:CE[];setCal:React.Dispatch<React.SetStateAction<CE[]>>}) {
  const [ld,setLd]=useState(false); const [msg,setMsg]=useState<{t:string;m:string}|null>(null); const [post,setPost]=useState(''); const [plt,setPlt]=useState(''); const [tm,setTm]=useState('')
  const approved=bank.filter(c=>c.status==='approved')
  const dist=useCallback(async(instant=false)=>{
    if(!post&&!approved.length){setMsg({t:'error',m:'No content to distribute.'});return}
    setLd(true);setMsg(null);try{const r=await callAIAgent(`${instant?'INSTANT PUBLISH':'Schedule'} content:\nContent: ${post||approved[0]?.content||'Content'}\nPlatform: ${plt||'X'}\nTime: ${tm||new Date().toISOString()}`,AG.DIST);if(r.success){setCal(p=>[...p,{id:`cal-${Date.now()}`,date:tm||new Date().toISOString(),platform:plt||'X',content:post.substring(0,100)||'Post',status:instant?'published':'scheduled'}]);setMsg({t:'success',m:instant?'Published!':'Scheduled!'});setPost('')}else setMsg({t:'error',m:r.error||'Failed'})}catch(e:any){setMsg({t:'error',m:e?.message||'Failed'})}finally{setLd(false)}
  },[post,plt,tm,approved,setCal])
  const today=new Date(); const week=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay()+i);return d})
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Content Calendar</h2><p className="text-sm text-[hsl(250,15%,50%)]">Schedule and distribute content</p></div>
      {msg&&<div className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-sm ${msg.t==='success'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{msg.t==='success'?<FiCheck size={16}/>:<FiX size={16}/>}{msg.m}</div>}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3"><div className={C+' p-4'}><div className="grid grid-cols-7 gap-2">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="text-center text-xs font-medium text-[hsl(250,15%,50%)] py-2">{d}</div>)}{week.map((date,i)=>{const ds=date.toISOString().split('T')[0];const evs=cal.filter(e=>e.date.startsWith(ds));const isT=ds===today.toISOString().split('T')[0];return<div key={i} className={`min-h-[100px] rounded-lg border p-2 ${isT?'border-[hsl(262,83%,58%)] bg-[hsl(262,83%,58%)]/5':'border-[hsl(250,20%,88%)]'}`}><span className={`text-xs font-medium ${isT?'text-[hsl(262,83%,58%)]':'text-[hsl(250,15%,50%)]'}`}>{date.getDate()}</span><div className="mt-1 space-y-1">{evs.map(ev=><div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)] truncate flex items-center gap-1">{pi(ev.platform)}<span className="truncate">{ev.content.substring(0,20)}</span></div>)}</div></div>})}</div></div></div>
        <div className="space-y-4"><div className={C+' p-4 space-y-3'}>
          <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Schedule Post</h3>
          <select value={plt} onChange={e=>setPlt(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none"><option value="">Platform...</option>{PLATS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select>
          <textarea value={post} onChange={e=>setPost(e.target.value)} rows={3} placeholder="Post content..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none"/>
          <input type="datetime-local" value={tm} onChange={e=>setTm(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none"/>
          <button onClick={()=>dist(false)} disabled={ld} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[14px] text-xs font-semibold bg-[hsl(262,83%,58%)] text-white disabled:opacity-50 shadow-md">{ld&&<FiLoader size={12} className="animate-spin"/>}<FiSend size={13}/>Schedule</button>
          <button onClick={()=>dist(true)} disabled={ld} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[14px] text-xs font-semibold bg-[hsl(174,72%,40%)] text-white disabled:opacity-50 shadow-md"><FiZap size={13}/>Rocket Post</button>
        </div></div>
      </div>
    </div>
  )
}

function EmailView() {
  const [ld,setLd]=useState(false); const [msg,setMsg]=useState<{t:string;m:string}|null>(null); const [em,setEm]=useState(''); const [subj,setSubj]=useState(''); const [body,setBody]=useState(''); const [seq,setSeq]=useState('welcome'); const [active,setActive]=useState<Record<string,boolean>>({}); const [last,setLast]=useState<any>(null)
  const seqData=[{type:'welcome',label:'Welcome Sequence',desc:'Introduce brand',n:5,s:342},{type:'pitch',label:'Product Pitch',desc:'Close the sale',n:6,s:198},{type:'follow-up',label:'Follow-Up',desc:'Post-purchase',n:4,s:156},{type:'abandoned_funnel',label:'Abandoned Funnel',desc:'Recover leads',n:3,s:89},{type:'upsell',label:'Upsell',desc:'Upgrades',n:4,s:124},{type:'bonus_delivery',label:'Bonus Delivery',desc:'Deliver bonuses',n:3,s:267},{type:'newsletter',label:'Newsletter',desc:'Regular updates',n:1,s:1024}]
  const go=useCallback(async()=>{
    if(!em){setMsg({t:'error',m:'Enter recipient email'});return}
    setLd(true);setMsg(null);try{const r=await callAIAgent(`Activate ${seq} email sequence:\nRecipient: ${em}\nSubject: ${subj||`Your ${seq} sequence`}\nBody: ${body||`Automated ${seq} email.`}\nSend via Gmail.`,AG.EM);if(r.success){const d=pr(r);setLast(d);setActive(p=>({...p,[seq]:true}));setMsg({t:'success',m:d.message||`${seq} activated!`})}else setMsg({t:'error',m:r.error||'Failed'})}catch(e:any){setMsg({t:'error',m:e?.message||'Failed'})}finally{setLd(false)}
  },[em,subj,body,seq])
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Email Automation</h2><p className="text-sm text-[hsl(250,15%,50%)]">Configure and manage nurture sequences</p></div>
      {msg&&<div className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-sm ${msg.t==='success'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{msg.t==='success'?<FiCheck size={16}/>:<FiX size={16}/>}{msg.m}</div>}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-3">{seqData.map(s=><div key={s.type} className={C+` p-4 cursor-pointer transition-all ${seq===s.type?'ring-2 ring-[hsl(262,83%,58%)]':''}`} onClick={()=>setSeq(s.type)}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active[s.type]?'bg-green-100 text-green-600':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}><FiMail size={18}/></div><div><h4 className="text-sm font-semibold text-[hsl(250,30%,12%)]">{s.label}</h4><p className="text-xs text-[hsl(250,15%,50%)]">{s.desc}</p></div></div><div className="flex items-center gap-3"><div className="text-right text-xs text-[hsl(250,15%,50%)]"><p>{s.n} emails</p><p>{s.s} subs</p></div><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active[s.type]?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{active[s.type]?'active':'paused'}</span></div></div><div className="mt-3 flex items-center gap-1">{Array.from({length:s.n},(_,i)=><div key={i} className="flex items-center"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${active[s.type]?'bg-[hsl(262,83%,58%)] text-white':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>{i+1}</div>{i<s.n-1&&<div className={`w-4 h-0.5 ${active[s.type]?'bg-[hsl(262,83%,58%)]':'bg-[hsl(250,18%,90%)]'}`}/>}</div>)}</div></div>)}</div>
        <div className="col-span-2 space-y-4"><div className={C+' p-4 space-y-3'}>
          <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Activate Sequence</h3>
          <select value={seq} onChange={e=>setSeq(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none">{SEQS.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select>
          <input type="email" value={em} onChange={e=>setEm(e.target.value)} placeholder="lead@example.com" className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none"/>
          <input type="text" value={subj} onChange={e=>setSubj(e.target.value)} placeholder="Subject line..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none"/>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Email body..." className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none"/>
          <button onClick={go} disabled={ld} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[14px] text-xs font-semibold bg-[hsl(262,83%,58%)] text-white disabled:opacity-50 shadow-md">{ld&&<FiLoader size={12} className="animate-spin"/>}<FiSend size={13}/>Activate</button>
        </div>
        {last&&<div className={C+' p-4'}><h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-2">Last Activation</h3><div className="space-y-1.5 text-xs">{[['Status',last.status||'active'],['Sequence',last.sequence_type||seq],['Queued',last.emails_queued||0],['Next',last.next_email_time||'Pending']].map(([k,v])=><div key={String(k)} className="flex justify-between"><span className="text-[hsl(250,15%,50%)]">{k}</span><span className="font-medium text-[hsl(250,30%,12%)]">{String(v)}</span></div>)}</div></div>}
        <div className={C+' p-4'}><h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-3">Performance</h3><div className="grid grid-cols-3 gap-2">{[['Open','42.3%'],['Click','8.7%'],['Unsub','0.4%']].map(([l,v])=><div key={l} className="text-center p-2 rounded-lg bg-white border border-[hsl(250,20%,88%)]"><p className="text-sm font-bold text-[hsl(250,30%,12%)]">{v}</p><p className="text-[10px] text-[hsl(250,15%,50%)]">{l} Rate</p></div>)}</div></div>
        </div>
      </div>
    </div>
  )
}

function AnaView() {
  const [ld,setLd]=useState(false); const [msg,setMsg]=useState<{t:string;m:string}|null>(null); const [inp,setInp]=useState(''); const [data,setData]=useState<any>(null)
  const run=useCallback(async()=>{
    setLd(true);setMsg(null);try{const r=await callAIAgent(`Analyze funnel performance:\n${inp||'Campaign: Digital Products\nClicks: 12,450\nEPC: $2.47\nConversions: 478\nRevenue: $8,942\nProvide KPI analysis, A/B test results, traffic breakdown, optimization suggestions.'}`,AG.AN);if(r.success){setData(pr(r));setMsg({t:'success',m:'Analysis complete!'})}else setMsg({t:'error',m:r.error||'Failed'})}catch(e:any){setMsg({t:'error',m:e?.message||'Failed'})}finally{setLd(false)}
  },[inp])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Analytics Dashboard</h2><p className="text-sm text-[hsl(250,15%,50%)]">Performance tracking and AI optimization</p></div><button onClick={run} disabled={ld} className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] font-semibold text-sm bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] disabled:opacity-50 shadow-md">{ld&&<FiLoader className="animate-spin" size={16}/>}<FiBarChart2 size={16}/>Analyze</button></div>
      {msg&&<div className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-sm ${msg.t==='success'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{msg.t==='success'?<FiCheck size={16}/>:<FiX size={16}/>}{msg.m}</div>}
      <div className={C+' p-4'}><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Metrics (optional)</label><textarea value={inp} onChange={e=>setInp(e.target.value)} rows={3} placeholder="Paste metrics or leave blank for sample data..." className="w-full px-3 py-2.5 rounded-[14px] border border-[hsl(250,20%,88%)] bg-white text-sm resize-none outline-none"/></div>
      {ld&&<div className="grid grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i=><div key={i} className={C+' p-4 animate-pulse'}><div className="h-4 bg-[hsl(250,18%,90%)] rounded w-3/4 mb-3"/><div className="h-3 bg-[hsl(250,18%,90%)] rounded w-full mb-2"/><div className="h-3 bg-[hsl(250,18%,90%)] rounded w-5/6"/></div>)}</div>}
      {data&&!ld&&<>
        {data.performance_summary&&<div className={C+' p-5'}><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-2">Performance Summary</h3><p className="text-sm text-[hsl(250,15%,50%)] leading-relaxed">{data.performance_summary}</p></div>}
        {sa<any>(data.kpi_analysis).length>0&&<div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">Key Metrics</h3><div className="grid grid-cols-3 gap-4">{sa<any>(data.kpi_analysis).map((k:any,i:number)=><div key={i} className={C+' p-4'}><span className="text-xs text-[hsl(250,15%,50%)]">{k.metric}</span><p className="text-xl font-bold text-[hsl(250,30%,12%)]">{k.value}</p><p className="text-xs text-[hsl(250,15%,50%)]">{k.insight}</p></div>)}</div></div>}
        {sa<any>(data.optimization_suggestions).length>0&&<div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">Optimization Suggestions</h3><div className="space-y-3">{sa<any>(data.optimization_suggestions).map((s:any,i:number)=><div key={i} className={C+' p-4'}><div className="flex justify-between mb-1"><span className="text-xs font-semibold text-[hsl(262,83%,58%)]">{s.area}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">{s.priority}</span></div><p className="text-sm text-[hsl(250,30%,12%)]">{s.suggestion}</p><p className="text-xs text-[hsl(250,15%,50%)]">Impact: {s.expected_impact}</p></div>)}</div></div>}
      </>}
      {!data&&!ld&&<div className="text-center py-16"><FiBarChart2 size={28} className="mx-auto text-[hsl(250,15%,50%)] mb-3"/><p className="text-lg font-semibold text-[hsl(250,30%,12%)]">No analysis yet</p><p className="text-sm text-[hsl(250,15%,50%)]">Click Analyze to get AI-powered insights</p><button onClick={run} className="mt-4 px-5 py-2.5 rounded-[14px] font-semibold text-sm bg-[hsl(262,83%,58%)] text-white shadow-md">Analyze Performance</button></div>}
    </div>
  )
}

function SetView({n,t,sn,st}:{n:string;t:string;sn:(v:string)=>void;st:(v:string)=>void}) {
  const [nn,setNN]=useState(n); const [tt,setTT]=useState(t); const [saved,setSaved]=useState(false)
  const save=()=>{sn(nn.trim()||'FunnelForge');st(tt.trim()||'Sales Funnel Automation');setSaved(true);setTimeout(()=>setSaved(false),3000)}
  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] font-serif">Settings</h2><p className="text-sm text-[hsl(250,15%,50%)]">Customize your app</p></div>
      {saved&&<div className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] border text-sm bg-green-50 text-green-700 border-green-200"><FiCheck size={16}/>Settings saved!</div>}
      <div className={C+' p-6 space-y-5'}>
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center"><FiSettings size={20} className="text-[hsl(262,83%,58%)]"/></div><div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Branding</h3><p className="text-xs text-[hsl(250,15%,50%)]">Change how your app appears</p></div></div>
        <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">App Name</label><input type="text" value={nn} onChange={e=>setNN(e.target.value)} className="w-full px-3 py-2.5 rounded-[14px] border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
        <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Tagline</label><input type="text" value={tt} onChange={e=>setTT(e.target.value)} className="w-full px-3 py-2.5 rounded-[14px] border border-[hsl(250,20%,88%)] bg-white text-sm outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]"/></div>
        <div><label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Preview</label><div className="inline-flex flex-col gap-0.5 px-5 py-4 rounded-[14px] bg-[hsl(250,22%,95%)] border border-[hsl(250,20%,88%)]"><span className="text-lg font-bold text-[hsl(250,30%,12%)] font-serif">{nn||'FunnelForge'}</span><span className="text-xs text-[hsl(250,15%,50%)]">{tt||'Sales Funnel Automation'}</span></div></div>
        <button onClick={save} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] font-semibold text-sm bg-[hsl(262,83%,58%)] text-white shadow-md"><FiCheck size={16}/>Save Changes</button>
      </div>
      <div className={C+' p-6 space-y-4'}>
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center"><FiArchive size={20} className="text-[hsl(262,83%,58%)]"/></div><div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Products</h3></div></div>
        <div className="space-y-2">{PRODS.map(p=><div key={p} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-[hsl(250,20%,88%)]"><span className="text-sm text-[hsl(250,30%,12%)]">{p}</span><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">active</span></div>)}</div>
      </div>
      <div className={C+' p-6 space-y-4'}>
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center"><FiExternalLink size={20} className="text-[hsl(262,83%,58%)]"/></div><div><h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Connected Platforms</h3></div></div>
        <div className="grid grid-cols-2 gap-3">{PLATS.map(p=><div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[hsl(250,20%,88%)]"><p.Ic size={18} style={{color:p.c}}/><span className="flex-1 text-sm font-medium text-[hsl(250,30%,12%)]">{p.label}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.id==='x'?'bg-green-100 text-green-700':'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>{p.id==='x'?'active':'draft'}</span></div>)}</div>
        <p className="text-xs text-[hsl(250,15%,50%)]">Twitter/X and Gmail connected via Composio.</p>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import {
  FiEdit3, FiZap, FiLoader, FiCheck
} from 'react-icons/fi'
import {
  BsFacebook, BsInstagram, BsPinterest, BsLinkedin, BsTiktok, BsTwitterX
} from 'react-icons/bs'
import type { ContentData } from './types'
import { AGENT_IDS, PRODUCTS, PLATFORMS } from './theme'
import { GlassCard, PrimaryButton, InlineMessage, safeParseResult } from './helpers'

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  facebook: BsFacebook,
  instagram: BsInstagram,
  pinterest: BsPinterest,
  linkedin: BsLinkedin,
  tiktok: BsTiktok,
  x: BsTwitterX,
}

export function GeneratorScreen({ onGenerated }: { onGenerated: (data: ContentData) => void }) {
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
      setTimeout(() => setProgress('Generating ad copy and hooks...'), 3000)
      setTimeout(() => setProgress('Creating email sequences...'), 8000)
      setTimeout(() => setProgress('Producing social posts...'), 14000)

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
  }, [product, platforms, brief, contentTypes, onGenerated])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Content Generator</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Configure and generate AI-powered campaign content</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          <GlassCard className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Product / Offer</label>
              <select
                value={product}
                onChange={e => setProduct(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"
              >
                <option value="">Select a product...</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const Icon = PLATFORM_ICONS[p.id] || BsFacebook
                  const selected = platforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${selected
                          ? 'bg-[hsl(262,83%,58%)] text-white border-[hsl(262,83%,58%)]'
                          : 'bg-white text-[hsl(250,25%,18%)] border-[hsl(250,20%,88%)] hover:border-[hsl(262,83%,58%)]'
                        }`}
                    >
                      <Icon size={13} /> {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Brief</label>
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={4}
                placeholder="Describe your target audience, goals, tone preferences..."
                className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm resize-none focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Content Types</label>
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
                      className="rounded border-[hsl(250,20%,88%)] text-[hsl(262,83%,58%)] focus:ring-[hsl(262,83%,58%)]"
                    />
                    <span className="text-sm text-[hsl(250,30%,12%)]">{ct.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <PrimaryButton onClick={handleGenerate} loading={loading} disabled={loading} className="w-full justify-center">
              <FiZap size={16} /> Generate Campaign Content
            </PrimaryButton>
          </GlassCard>
        </div>

        <div className="col-span-2 space-y-4">
          {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

          {loading && (
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-4">Generation Progress</h3>
              <div className="space-y-3">
                {['Analyzing campaign brief', 'Generating ad copy & hooks', 'Creating email sequences', 'Producing social posts', 'Aggregating results'].map((step, i) => {
                  const stepStatus = progress.toLowerCase().includes(step.split(' ')[0].toLowerCase()) ? 'active'
                    : progress && ['Aggregating', 'Producing', 'Creating', 'Generating', 'Dispatching'].findIndex(s => progress.includes(s)) > ['Analyzing', 'Generating', 'Creating', 'Producing', 'Aggregating'].indexOf(step.split(' ')[0]) ? 'done' : 'pending'
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        stepStatus === 'active' ? 'bg-[hsl(262,83%,58%)] text-white' :
                        stepStatus === 'done' ? 'bg-green-500 text-white' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'
                      }`}>
                        {stepStatus === 'active' ? <FiLoader size={12} className="animate-spin" /> :
                         stepStatus === 'done' ? <FiCheck size={12} /> :
                         <span className="text-[10px]">{i + 1}</span>}
                      </div>
                      <span className={`text-sm ${stepStatus === 'active' ? 'text-[hsl(262,83%,58%)] font-medium' : 'text-[hsl(250,15%,50%)]'}`}>{step}</span>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          )}

          {!loading && !statusMsg && (
            <GlassCard className="p-5">
              <div className="text-center py-8">
                <FiEdit3 size={32} className="mx-auto text-[hsl(250,15%,50%)] mb-3" />
                <p className="text-sm text-[hsl(250,15%,50%)]">Configure your campaign and click generate to create content</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}

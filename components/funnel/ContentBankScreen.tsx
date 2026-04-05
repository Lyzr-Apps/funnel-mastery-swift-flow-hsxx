'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import {
  FiArchive, FiImage, FiCheck, FiTrash2, FiSearch, FiLoader, FiCopy
} from 'react-icons/fi'
import type { ContentBankItem } from './types'
import { AGENT_IDS } from './theme'
import { GlassCard, StatusBadge, InlineMessage, EmptyState, getPlatformIcon, safeParseResult } from './helpers'

export function ContentBankScreen({ contentBank, setContentBank }: {
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
          <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Content Bank</h2>
          <p className="text-sm text-[hsl(250,15%,50%)]">Review, edit, and manage generated content</p>
        </div>
      </div>

      {imageMsg && <InlineMessage type={imageMsg.type} message={imageMsg.message} />}

      <div className="flex items-center gap-1 border-b border-[hsl(250,20%,88%)]">
        {tabs.map(tab => {
          const count = contentBank.filter(i => i.type === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-[hsl(262,83%,58%)] text-[hsl(262,83%,58%)]'
                  : 'border-transparent text-[hsl(250,15%,50%)] hover:text-[hsl(250,30%,12%)]'
                }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold
                  ${activeTab === tab.id ? 'bg-[hsl(262,83%,58%)] text-white' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(250,15%,50%)]" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search content..."
          className="w-full pl-10 pr-4 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] outline-none"
        />
      </div>

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
                  <h4 className="text-sm font-semibold text-[hsl(250,30%,12%)] truncate max-w-[200px]">{item.title}</h4>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-[hsl(250,15%,50%)] leading-relaxed mb-3 line-clamp-3">{item.content}</p>
              {item.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-[hsl(250,20%,88%)]">
                  <img src={item.imageUrl} alt="" className="w-full h-32 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateImage(item)}
                  disabled={imageLoading === item.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)] transition-colors disabled:opacity-50"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(250,20%,92%)] text-[hsl(250,25%,18%)] hover:bg-[hsl(250,20%,88%)] transition-colors"
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

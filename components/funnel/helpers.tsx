'use client'

import React from 'react'
import {
  FiCheck, FiX, FiLoader, FiEye, FiExternalLink
} from 'react-icons/fi'
import {
  BsFacebook, BsInstagram, BsPinterest, BsLinkedin, BsTiktok, BsTwitterX
} from 'react-icons/bs'
import type { AIAgentResponse } from '@/lib/aiAgent'

export function getPlatformIcon(p: string) {
  const pl = p.toLowerCase()
  if (pl.includes('facebook')) return <BsFacebook className="text-[#1877F2]" />
  if (pl.includes('instagram')) return <BsInstagram className="text-[#E4405F]" />
  if (pl.includes('pinterest')) return <BsPinterest className="text-[#BD081C]" />
  if (pl.includes('linkedin')) return <BsLinkedin className="text-[#0A66C2]" />
  if (pl.includes('tiktok')) return <BsTiktok />
  if (pl.includes('x') || pl.includes('twitter')) return <BsTwitterX />
  return <FiExternalLink />
}

export function safeParseResult(result: AIAgentResponse): Record<string, any> {
  try {
    if (!result?.response?.result) return {}
    const r = result.response.result
    if (typeof r === 'string') {
      try { return JSON.parse(r) } catch { return { text: r } }
    }
    return r
  } catch { return {} }
}

export function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : []
}

export function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[0.875rem] border border-white/[0.18] bg-[hsl(250,25%,96%)]/75 backdrop-blur-[16px] shadow-md ${className}`}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]',
    approved: 'bg-green-100 text-green-700',
    published: 'bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)]',
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

export function PrimaryButton({ children, onClick, disabled, loading, className = '' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.875rem] font-semibold text-sm
        bg-[hsl(262,83%,58%)] text-white hover:bg-[hsl(262,83%,52%)] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${className}`}
    >
      {loading && <FiLoader className="animate-spin" size={16} />}
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-[0.875rem] text-sm font-medium
        border border-[hsl(250,20%,88%)] text-[hsl(250,25%,18%)] bg-[hsl(250,20%,92%)]
        hover:bg-[hsl(250,20%,88%)] transition-all ${className}`}
    >
      {children}
    </button>
  )
}

export function InlineMessage({ type, message }: { type: 'success' | 'error' | 'info' | 'loading'; message: string }) {
  const styles: Record<string, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    loading: 'bg-[hsl(262,83%,58%)]/5 text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%)]/20',
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

export function SkeletonCard() {
  return (
    <GlassCard className="p-4 animate-pulse">
      <div className="h-4 bg-[hsl(250,18%,90%)] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[hsl(250,18%,90%)] rounded w-full mb-2" />
      <div className="h-3 bg-[hsl(250,18%,90%)] rounded w-5/6" />
    </GlassCard>
  )
}

export function EmptyState({ icon, title, description, action, onAction }: {
  icon: React.ReactNode; title: string; description: string; action?: string; onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[hsl(250,18%,90%)] flex items-center justify-center mb-4 text-[hsl(250,15%,50%)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[hsl(250,30%,12%)] mb-1">{title}</h3>
      <p className="text-sm text-[hsl(250,15%,50%)] max-w-sm mb-4">{description}</p>
      {action && onAction && <PrimaryButton onClick={onAction}>{action}</PrimaryButton>}
    </div>
  )
}

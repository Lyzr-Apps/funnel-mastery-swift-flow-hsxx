'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { FiSend, FiZap } from 'react-icons/fi'
import type { ContentBankItem, CalendarEvent } from './types'
import { AGENT_IDS, PLATFORMS } from './theme'
import { GlassCard, PrimaryButton, SecondaryButton, InlineMessage, getPlatformIcon, safeParseResult, safeArray } from './helpers'

export function CalendarScreen({ contentBank, calendarItems, setCalendarItems }: {
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
          <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Content Calendar</h2>
          <p className="text-sm text-[hsl(250,15%,50%)]">Schedule and distribute content across platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={() => setView('week')} className={view === 'week' ? '!bg-[hsl(262,83%,58%)] !text-white !border-[hsl(262,83%,58%)]' : ''}>Week</SecondaryButton>
          <SecondaryButton onClick={() => setView('month')} className={view === 'month' ? '!bg-[hsl(262,83%,58%)] !text-white !border-[hsl(262,83%,58%)]' : ''}>Month</SecondaryButton>
        </div>
      </div>

      {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <GlassCard className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-[hsl(250,15%,50%)] py-2">{day}</div>
              ))}
              {weekDays.map((date, i) => {
                const dateStr = date.toISOString().split('T')[0]
                const dayEvents = calendarItems.filter(e => e.date.startsWith(dateStr))
                const isToday = dateStr === today.toISOString().split('T')[0]
                return (
                  <div key={i} className={`min-h-[100px] rounded-lg border p-2 ${isToday ? 'border-[hsl(262,83%,58%)] bg-[hsl(262,83%,58%)]/5' : 'border-[hsl(250,20%,88%)]'}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-[hsl(262,83%,58%)]' : 'text-[hsl(250,15%,50%)]'}`}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(ev => (
                        <div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)] truncate flex items-center gap-1">
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

        <div className="space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Schedule Post</h3>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Platform</label>
              <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]">
                <option value="">Select...</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Post Content</label>
              <textarea value={postContent} onChange={e => setPostContent(e.target.value)} rows={3}
                placeholder="Enter post content..."
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Schedule Time</label>
              <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
            </div>
            <PrimaryButton onClick={() => handleDistribute(false)} loading={loading} disabled={loading} className="w-full justify-center text-xs">
              <FiSend size={13} /> Schedule & Distribute
            </PrimaryButton>
            <button
              onClick={() => handleDistribute(true)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[0.875rem] text-xs font-semibold
                bg-[hsl(174,72%,40%)] text-white hover:bg-[hsl(174,72%,35%)] transition-all disabled:opacity-50 shadow-md"
            >
              <FiZap size={13} /> Rocket Post
            </button>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-3">Approved Queue ({approvedContent.length})</h3>
            {approvedContent.length === 0 ? (
              <p className="text-xs text-[hsl(250,15%,50%)]">Approve content in the Content Bank to queue it</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {approvedContent.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
                    {item.platform && getPlatformIcon(item.platform)}
                    <span className="text-[11px] text-[hsl(250,30%,12%)] truncate">{item.title}</span>
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

'use client'

import { useState, useCallback } from 'react'
import type { Screen, ContentData, ContentBankItem, CalendarEvent, AdCopy, Hook, ScriptItem, EmailSequence, EmailItem, SocialPost } from '@/components/funnel/types'
import { safeArray } from '@/components/funnel/helpers'
import { StatusBadge } from '@/components/funnel/helpers'
import { Sidebar } from '@/components/funnel/Sidebar'
import { DashboardScreen } from '@/components/funnel/DashboardScreen'
import { GeneratorScreen } from '@/components/funnel/GeneratorScreen'
import { ContentBankScreen } from '@/components/funnel/ContentBankScreen'
import { CalendarScreen } from '@/components/funnel/CalendarScreen'
import { EmailScreen } from '@/components/funnel/EmailScreen'
import { AnalyticsScreen } from '@/components/funnel/AnalyticsScreen'
import { SettingsScreen } from '@/components/funnel/SettingsScreen'

export default function FunnelForgePage() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const [contentBank, setContentBank] = useState<ContentBankItem[]>([])
  const [calendarItems, setCalendarItems] = useState<CalendarEvent[]>([])
  const [appName, setAppName] = useState('FunnelForge')
  const [appTagline, setAppTagline] = useState('Sales Funnel Automation')

  const handleContentGenerated = useCallback((data: ContentData) => {
    const items: ContentBankItem[] = []
    let counter = Date.now()

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

    safeArray<ScriptItem>(data.scripts).forEach(script => {
      items.push({
        id: `cb-${counter++}`,
        type: 'script',
        title: `${script.format || 'Script'}`,
        content: script.script || '',
        status: 'draft',
        raw: script,
      })
    })

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

  const screenTitles: Record<Screen, string> = {
    dashboard: 'Campaign Hub',
    generator: 'Content Generator',
    'content-bank': 'Content Bank',
    calendar: 'Content Calendar',
    email: 'Email Automation',
    analytics: 'Analytics',
    settings: 'Settings',
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(250,30%,97%) 0%, hsl(260,25%,95%) 35%, hsl(240,20%,96%) 70%, hsl(270,20%,97%) 100%)' }}>
      <Sidebar active={activeScreen} onNavigate={setActiveScreen} appName={appName} appTagline={appTagline} />

      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 px-8 py-4 border-b border-[hsl(250,20%,88%)] bg-[hsl(250,25%,98%)]/80 backdrop-blur-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em]">
                {screenTitles[activeScreen]}
              </h2>
              <StatusBadge status="active" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(250,15%,50%)]">{contentBank.length} content pieces</span>
            </div>
          </div>
        </header>

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
          {activeScreen === 'settings' && (
            <SettingsScreen
              appName={appName}
              appTagline={appTagline}
              onUpdateName={setAppName}
              onUpdateTagline={setAppTagline}
            />
          )}
        </div>
      </main>
    </div>
  )
}

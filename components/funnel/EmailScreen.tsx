'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { FiMail, FiSend } from 'react-icons/fi'
import { AGENT_IDS, SEQUENCE_TYPES } from './theme'
import { GlassCard, PrimaryButton, StatusBadge, InlineMessage, safeParseResult } from './helpers'

export function EmailScreen() {
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
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Email Automation</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Configure and manage email nurture sequences</p>
      </div>

      {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-3">
          {sequences.map(seq => (
            <GlassCard key={seq.type} className={`p-4 transition-all ${sequenceType === seq.type ? 'ring-2 ring-[hsl(262,83%,58%)]' : ''}`}
              onClick={() => setSequenceType(seq.type)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeSequences[seq.type] ? 'bg-green-100 text-green-600' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'
                  }`}>
                    <FiMail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[hsl(250,30%,12%)]">{seq.label}</h4>
                    <p className="text-xs text-[hsl(250,15%,50%)]">{seq.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[hsl(250,15%,50%)]">{seq.emails} emails</p>
                    <p className="text-xs text-[hsl(250,15%,50%)]">{seq.subscribers} subscribers</p>
                  </div>
                  <StatusBadge status={activeSequences[seq.type] ? 'active' : 'paused'} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: seq.emails }, (_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold
                      ${activeSequences[seq.type] ? 'bg-[hsl(262,83%,58%)] text-white' : 'bg-[hsl(250,18%,90%)] text-[hsl(250,15%,50%)]'}`}>
                      {i + 1}
                    </div>
                    {i < seq.emails - 1 && <div className={`w-4 h-0.5 ${activeSequences[seq.type] ? 'bg-[hsl(262,83%,58%)]' : 'bg-[hsl(250,18%,90%)]'}`} />}
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="col-span-2 space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)]">Activate Sequence</h3>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Sequence Type</label>
              <select value={sequenceType} onChange={e => setSequenceType(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]">
                {SEQUENCE_TYPES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Recipient Email</label>
              <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                placeholder="lead@example.com"
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Subject Line</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Welcome to your journey..."
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(250,15%,50%)] mb-1">Email Body</label>
              <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4}
                placeholder="Enter the email content..."
                className="w-full px-2.5 py-2 rounded-lg border border-[hsl(250,20%,88%)] bg-white text-xs resize-none outline-none focus:ring-2 focus:ring-[hsl(262,83%,58%)]" />
            </div>
            <PrimaryButton onClick={handleActivate} loading={loading} disabled={loading} className="w-full justify-center text-xs">
              <FiSend size={13} /> Activate Sequence
            </PrimaryButton>
          </GlassCard>

          {lastResult && (
            <GlassCard className="p-4">
              <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-2">Last Activation</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(250,15%,50%)]">Status</span>
                  <StatusBadge status={lastResult.status || 'active'} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(250,15%,50%)]">Sequence</span>
                  <span className="text-[hsl(250,30%,12%)] font-medium">{lastResult.sequence_type || sequenceType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(250,15%,50%)]">Emails Queued</span>
                  <span className="text-[hsl(250,30%,12%)] font-medium">{lastResult.emails_queued || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[hsl(250,15%,50%)]">Next Email</span>
                  <span className="text-[hsl(250,30%,12%)] font-medium">{lastResult.next_email_time || 'Pending'}</span>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-3">Email Performance</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Open Rate', value: '42.3%' },
                { label: 'Click Rate', value: '8.7%' },
                { label: 'Unsub Rate', value: '0.4%' },
              ].map(m => (
                <div key={m.label} className="text-center p-2 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
                  <p className="text-sm font-bold text-[hsl(250,30%,12%)]">{m.value}</p>
                  <p className="text-[10px] text-[hsl(250,15%,50%)]">{m.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { FiSettings, FiArchive, FiExternalLink, FiCheck } from 'react-icons/fi'
import {
  BsFacebook, BsInstagram, BsPinterest, BsLinkedin, BsTiktok, BsTwitterX
} from 'react-icons/bs'
import { PRODUCTS } from './theme'
import { GlassCard, PrimaryButton, StatusBadge, InlineMessage } from './helpers'

const PLATFORM_LIST = [
  { id: 'facebook', label: 'Facebook', icon: BsFacebook, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: BsInstagram, color: '#E4405F' },
  { id: 'pinterest', label: 'Pinterest', icon: BsPinterest, color: '#BD081C' },
  { id: 'linkedin', label: 'LinkedIn', icon: BsLinkedin, color: '#0A66C2' },
  { id: 'tiktok', label: 'TikTok', icon: BsTiktok, color: '#000000' },
  { id: 'x', label: 'X', icon: BsTwitterX, color: '#000000' },
]

export function SettingsScreen({ appName, appTagline, onUpdateName, onUpdateTagline }: {
  appName: string; appTagline: string
  onUpdateName: (name: string) => void; onUpdateTagline: (tagline: string) => void
}) {
  const [nameInput, setNameInput] = useState(appName)
  const [taglineInput, setTaglineInput] = useState(appTagline)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onUpdateName(nameInput.trim() || 'FunnelForge')
    onUpdateTagline(taglineInput.trim() || 'Sales Funnel Automation')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Settings</h2>
        <p className="text-sm text-[hsl(250,15%,50%)]">Customize your app preferences</p>
      </div>

      {saved && <InlineMessage type="success" message="Settings saved successfully!" />}

      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center">
            <FiSettings size={20} className="text-[hsl(262,83%,58%)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Branding</h3>
            <p className="text-xs text-[hsl(250,15%,50%)]">Change how your app appears in the sidebar and header</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">App Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="FunnelForge"
            className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"
          />
          <p className="text-xs text-[hsl(250,15%,50%)] mt-1">This name appears in the sidebar header and page title</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Tagline</label>
          <input
            type="text"
            value={taglineInput}
            onChange={e => setTaglineInput(e.target.value)}
            placeholder="Sales Funnel Automation"
            className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm focus:ring-2 focus:ring-[hsl(262,83%,58%)] focus:border-transparent outline-none"
          />
          <p className="text-xs text-[hsl(250,15%,50%)] mt-1">Short description shown below the app name</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Preview</label>
          <div className="inline-flex flex-col gap-0.5 px-5 py-4 rounded-[0.875rem] bg-[hsl(250,22%,95%)] border border-[hsl(250,20%,88%)]">
            <span className="text-lg font-bold tracking-[-0.01em] text-[hsl(250,30%,12%)] font-serif">{nameInput || 'FunnelForge'}</span>
            <span className="text-xs text-[hsl(250,15%,50%)]">{taglineInput || 'Sales Funnel Automation'}</span>
          </div>
        </div>

        <PrimaryButton onClick={handleSave} className="w-full justify-center">
          <FiCheck size={16} /> Save Changes
        </PrimaryButton>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center">
            <FiArchive size={20} className="text-[hsl(262,83%,58%)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Products & Offers</h3>
            <p className="text-xs text-[hsl(250,15%,50%)]">Your current digital products and affiliate offers</p>
          </div>
        </div>
        <div className="space-y-2">
          {PRODUCTS.map(p => (
            <div key={p} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
              <span className="text-sm text-[hsl(250,30%,12%)]">{p}</span>
              <StatusBadge status="active" />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[hsl(262,83%,58%)]/10 flex items-center justify-center">
            <FiExternalLink size={20} className="text-[hsl(262,83%,58%)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Connected Platforms</h3>
            <p className="text-xs text-[hsl(250,15%,50%)]">Active integrations for distribution and email</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORM_LIST.map(p => {
            const Icon = p.icon
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[hsl(250,20%,88%)]">
                <Icon size={18} style={{ color: p.color }} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[hsl(250,30%,12%)]">{p.label}</span>
                </div>
                <StatusBadge status={p.id === 'x' ? 'active' : 'draft'} />
              </div>
            )
          })}
        </div>
        <p className="text-xs text-[hsl(250,15%,50%)]">Twitter/X and Gmail are connected via Composio. Other platforms require manual API setup.</p>
      </GlassCard>
    </div>
  )
}

'use client'

import React from 'react'
import {
  FiUsers, FiTarget, FiDollarSign, FiMail, FiCalendar,
  FiTrendingUp, FiTrendingDown, FiZap, FiBarChart2, FiChevronRight
} from 'react-icons/fi'
import type { Screen, ContentBankItem, CalendarEvent } from './types'
import { GlassCard, PrimaryButton, SecondaryButton } from './helpers'

export function DashboardScreen({ onNavigate, contentBank, calendarItems }: {
  onNavigate: (s: Screen) => void; contentBank: ContentBankItem[]; calendarItems: CalendarEvent[]
}) {
  const kpis = [
    { label: 'Total Leads', value: '1,284', trend: '+12%', up: true, icon: <FiUsers size={18} /> },
    { label: 'Conversion Rate', value: '3.8%', trend: '+0.5%', up: true, icon: <FiTarget size={18} /> },
    { label: 'EPC', value: '$2.47', trend: '+$0.12', up: true, icon: <FiDollarSign size={18} /> },
    { label: 'Revenue', value: '$8,942', trend: '+18%', up: true, icon: <FiDollarSign size={18} /> },
    { label: 'Active Sequences', value: '4', trend: 'stable', up: true, icon: <FiMail size={18} /> },
    { label: 'Scheduled Posts', value: String(calendarItems.length || 12), trend: '+3', up: true, icon: <FiCalendar size={18} /> },
  ]

  const recentActivity = [
    { text: 'Campaign content generated for Coloring Book Journey', time: '2 min ago' },
    { text: '3 posts scheduled for Facebook & Instagram', time: '15 min ago' },
    { text: 'Welcome email sequence activated', time: '1 hr ago' },
    { text: 'New lead captured from Pinterest ad', time: '2 hrs ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Dashboard</h2>
          <p className="text-sm text-[hsl(250,15%,50%)]">Campaign overview and quick actions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <GlassCard key={kpi.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[hsl(250,15%,50%)]">{kpi.icon}</span>
              <span className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em]">{kpi.value}</p>
            <p className="text-xs text-[hsl(250,15%,50%)] mt-1">{kpi.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <PrimaryButton onClick={() => onNavigate('generator')} className="w-full justify-center">
              <FiZap size={16} /> Generate Campaign Content
            </PrimaryButton>
            <SecondaryButton onClick={() => onNavigate('calendar')} className="w-full justify-center">
              <FiCalendar size={16} /> View Calendar
            </SecondaryButton>
            <SecondaryButton onClick={() => onNavigate('analytics')} className="w-full justify-center">
              <FiBarChart2 size={16} /> Check Analytics
            </SecondaryButton>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-[hsl(262,83%,58%)] shrink-0" />
                <div>
                  <p className="text-sm text-[hsl(250,30%,12%)] leading-snug">{a.text}</p>
                  <p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {contentBank.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[hsl(250,30%,12%)]">Content Bank</h3>
            <SecondaryButton onClick={() => onNavigate('content-bank')}>
              View All <FiChevronRight size={14} />
            </SecondaryButton>
          </div>
          <p className="text-sm text-[hsl(250,15%,50%)]">{contentBank.length} content pieces generated</p>
        </GlassCard>
      )}
    </div>
  )
}

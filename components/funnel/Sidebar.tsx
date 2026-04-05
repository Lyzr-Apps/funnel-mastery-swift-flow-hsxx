'use client'

import React from 'react'
import {
  FiHome, FiEdit3, FiArchive, FiCalendar, FiMail, FiBarChart2, FiSettings
} from 'react-icons/fi'
import type { Screen } from './types'

export function Sidebar({ active, onNavigate, appName, appTagline }: {
  active: Screen; onNavigate: (s: Screen) => void; appName: string; appTagline: string
}) {
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
        <h1 className="text-xl font-bold tracking-[-0.01em] text-[hsl(250,30%,12%)] font-serif">{appName}</h1>
        <p className="text-xs text-[hsl(250,15%,50%)] mt-0.5">{appTagline}</p>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.875rem] text-sm font-medium transition-all
              ${active === item.id
                ? 'bg-[hsl(262,83%,58%)] text-white shadow-md'
                : 'text-[hsl(250,30%,12%)] hover:bg-[hsl(250,20%,90%)]'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[hsl(250,20%,88%)]">
        <p className="text-[10px] text-[hsl(250,15%,50%)]">Powered by AI Agents</p>
      </div>
    </aside>
  )
}

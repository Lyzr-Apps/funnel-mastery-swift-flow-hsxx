'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import {
  FiBarChart2, FiTrendingUp, FiTrendingDown, FiCheck
} from 'react-icons/fi'
import type { KpiItem, AbTestResult, OptSuggestion, TrafficItem } from './types'
import { AGENT_IDS } from './theme'
import { GlassCard, PrimaryButton, InlineMessage, EmptyState, SkeletonCard, getPlatformIcon, safeParseResult, safeArray } from './helpers'

export function AnalyticsScreen() {
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [metricsInput, setMetricsInput] = useState('')
  const [analyticsData, setAnalyticsData] = useState<{
    performance_summary?: string
    kpi_analysis?: KpiItem[]
    ab_test_results?: AbTestResult[]
    optimization_suggestions?: OptSuggestion[]
    traffic_breakdown?: TrafficItem[]
  } | null>(null)

  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    setStatusMsg(null)

    const message = `Analyze the following funnel performance data and provide optimization suggestions:

${metricsInput || `Campaign: Digital Products Funnel
Period: Last 30 days
Metrics:
- Total Clicks: 12,450
- EPC: $2.47
- Conversions: 478
- Conversion Rate: 3.84%
- Revenue: $8,942
- Refund Rate: 2.1%
- Active email sequences: 4
- Top traffic source: Facebook (45%), Pinterest (22%), Instagram (18%), X (10%), LinkedIn (5%)

A/B Tests Running:
- Landing page headline test (Variant A: "Transform Your Life" vs Variant B: "Start Your Journey")
- Ad image test (Photo vs Illustration)
- Email subject line test (Question vs Statement)

Please analyze performance, evaluate A/B tests, and provide optimization suggestions.`}`

    try {
      const result = await callAIAgent(message, AGENT_IDS.ANALYTICS)
      if (result.success) {
        const data = safeParseResult(result)
        setAnalyticsData(data)
        setStatusMsg({ type: 'success', message: 'Analysis complete!' })
      } else {
        setStatusMsg({ type: 'error', message: result.error || 'Analysis failed' })
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err?.message || 'Analysis failed' })
    } finally {
      setLoading(false)
    }
  }, [metricsInput])

  const kpis = safeArray<KpiItem>(analyticsData?.kpi_analysis)
  const abTests = safeArray<AbTestResult>(analyticsData?.ab_test_results)
  const suggestions = safeArray<OptSuggestion>(analyticsData?.optimization_suggestions)
  const traffic = safeArray<TrafficItem>(analyticsData?.traffic_breakdown)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(250,30%,12%)] tracking-[-0.01em] font-serif">Analytics Dashboard</h2>
          <p className="text-sm text-[hsl(250,15%,50%)]">Performance tracking, A/B testing, and AI optimization</p>
        </div>
        <PrimaryButton onClick={handleAnalyze} loading={loading} disabled={loading}>
          <FiBarChart2 size={16} /> Analyze Performance
        </PrimaryButton>
      </div>

      {statusMsg && <InlineMessage type={statusMsg.type} message={statusMsg.message} />}

      <GlassCard className="p-4">
        <label className="block text-sm font-medium text-[hsl(250,30%,12%)] mb-1.5">Campaign Metrics (optional - defaults provided)</label>
        <textarea
          value={metricsInput}
          onChange={e => setMetricsInput(e.target.value)}
          rows={3}
          placeholder="Paste your campaign metrics here, or leave blank to use sample data..."
          className="w-full px-3 py-2.5 rounded-[0.875rem] border border-[hsl(250,20%,88%)] bg-white text-sm resize-none focus:ring-2 focus:ring-[hsl(262,83%,58%)] outline-none"
        />
      </GlassCard>

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {analyticsData && !loading && (
        <>
          {analyticsData.performance_summary && (
            <GlassCard className="p-5">
              <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-2">Performance Summary</h3>
              <p className="text-sm text-[hsl(250,15%,50%)] leading-relaxed">{analyticsData.performance_summary}</p>
            </GlassCard>
          )}

          {kpis.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                {kpis.map((kpi, i) => (
                  <GlassCard key={i} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[hsl(250,15%,50%)]">{kpi.metric}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        kpi.trend?.toLowerCase().includes('up') || kpi.trend?.includes('+') ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {kpi.trend?.toLowerCase().includes('up') || kpi.trend?.includes('+') ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-[hsl(250,30%,12%)]">{kpi.value}</p>
                    <p className="text-xs text-[hsl(250,15%,50%)] mt-1">{kpi.insight}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {traffic.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-4">Traffic Source Breakdown</h3>
              <div className="space-y-3">
                {traffic.map((t, i) => {
                  const maxClicks = Math.max(...traffic.map(tr => parseInt(tr.clicks?.replace(/,/g, '') || '0') || 1))
                  const pct = (parseInt(t.clicks?.replace(/,/g, '') || '0') / maxClicks) * 100
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(t.source)}
                          <span className="text-sm font-medium text-[hsl(250,30%,12%)]">{t.source}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[hsl(250,15%,50%)]">
                          <span>{t.clicks} clicks</span>
                          <span>{t.conversions} conv.</span>
                          <span className="font-semibold text-[hsl(262,83%,58%)]">${t.epc} EPC</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[hsl(250,18%,90%)]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(174,72%,40%)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-2 gap-6">
            {abTests.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">A/B Test Results</h3>
                <div className="space-y-3">
                  {abTests.map((test, i) => (
                    <GlassCard key={i} className="p-4">
                      <h4 className="text-sm font-semibold text-[hsl(250,30%,12%)] mb-2">{test.test_name}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className={`p-2 rounded-lg text-xs border ${test.winner?.toLowerCase().includes('a') ? 'border-green-300 bg-green-50' : 'border-[hsl(250,20%,88%)]'}`}>
                          <p className="font-medium text-[hsl(250,30%,12%)]">Variant A</p>
                          <p className="text-[hsl(250,15%,50%)] mt-0.5">{test.variant_a}</p>
                          {test.winner?.toLowerCase().includes('a') && (
                            <span className="inline-flex items-center gap-1 mt-1 text-green-600 font-semibold"><FiCheck size={10} /> Winner</span>
                          )}
                        </div>
                        <div className={`p-2 rounded-lg text-xs border ${test.winner?.toLowerCase().includes('b') ? 'border-green-300 bg-green-50' : 'border-[hsl(250,20%,88%)]'}`}>
                          <p className="font-medium text-[hsl(250,30%,12%)]">Variant B</p>
                          <p className="text-[hsl(250,15%,50%)] mt-0.5">{test.variant_b}</p>
                          {test.winner?.toLowerCase().includes('b') && (
                            <span className="inline-flex items-center gap-1 mt-1 text-green-600 font-semibold"><FiCheck size={10} /> Winner</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[hsl(250,15%,50%)]">Confidence: {test.confidence}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-[hsl(250,30%,12%)] mb-3">AI Optimization Suggestions</h3>
                <div className="space-y-3">
                  {suggestions.map((s, i) => {
                    const priorityColors: Record<string, string> = {
                      high: 'bg-red-100 text-red-700',
                      medium: 'bg-yellow-100 text-yellow-700',
                      low: 'bg-green-100 text-green-700',
                    }
                    return (
                      <GlassCard key={i} className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-[hsl(262,83%,58%)]">{s.area}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[s.priority?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                            {s.priority}
                          </span>
                        </div>
                        <p className="text-sm text-[hsl(250,30%,12%)] mb-1">{s.suggestion}</p>
                        <p className="text-xs text-[hsl(250,15%,50%)]">Expected impact: {s.expected_impact}</p>
                      </GlassCard>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!analyticsData && !loading && (
        <EmptyState
          icon={<FiBarChart2 size={28} />}
          title="No analysis yet"
          description="Click 'Analyze Performance' to get AI-powered insights and optimization suggestions"
          action="Analyze Performance"
          onAction={handleAnalyze}
        />
      )}
    </div>
  )
}

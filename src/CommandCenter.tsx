import { useState } from 'react'
import { useTenant } from './TenantContext'
import { useDemo } from './context/DemoContext'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  TruckIcon,
  BoltIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import Breadcrumbs from './components/Breadcrumbs'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface CommandCenterProps {
  onLogout: () => void
  onNavigateToDetail: () => void
  onNavigateToWorkspace: () => void
  onNavigate: (page: string) => void
}

// --- KPI Data ---
const kpiData = [
  { label: 'Pending ACKs', value: '23', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
  { label: 'Open Exceptions', value: '7', sub: 'Need resolution', icon: ExclamationTriangleIcon, color: 'red' },
  { label: 'Auto-Accept Rate', value: '82%', sub: 'Last 30 days', icon: CheckCircleIcon, color: 'green' },
  { label: 'Avg Response Time', value: '1.2d', sub: 'Days to ACK', icon: ArrowTrendingUpIcon, color: 'blue' },
  { label: 'Active POs', value: '156', sub: 'In pipeline', icon: CubeIcon, color: 'indigo' },
]

// --- Urgent Actions ---
const urgentActions = [
  { id: 1, severity: 'critical', title: '3 ACKs pending >48h', description: 'Herman Miller, Steelcase, Knoll — exceeding SLA threshold', action: 'Review ACKs' },
  { id: 2, severity: 'high', title: 'Exception rate spike on Supplier XYZ', description: '12% exception rate (vs 4% avg) — 5 new discrepancies today', action: 'View Exceptions' },
  { id: 3, severity: 'medium', title: '5 POs missing ship dates', description: 'Orders from last week still awaiting confirmed ship dates', action: 'View POs' },
  { id: 4, severity: 'low', title: 'Quarterly supplier review due', description: 'Performance scorecards ready for top 10 suppliers', action: 'View Report' },
]

// --- Recent Activity ---
const recentActivity = [
  { id: 1, action: 'ACK auto-accepted', detail: 'PO-2026-089 — Herman Miller — all lines matched', time: '2 min ago', type: 'success' },
  { id: 2, action: 'Exception created', detail: 'PO-2026-091 — Qty mismatch on 3 lines', time: '15 min ago', type: 'warning' },
  { id: 3, action: 'Delta engine completed', detail: 'ACK-8842 — 2 auto-corrections, 1 escalated', time: '32 min ago', type: 'info' },
  { id: 4, action: 'PO received', detail: 'PO-2026-095 from Acme Corp — 45 line items', time: '1h ago', type: 'info' },
  { id: 5, action: 'Claim submitted', detail: 'Issue #1023 — freight damage — carrier liability 70%', time: '2h ago', type: 'success' },
]

// --- Your Tools Widget Definitions ---
const defaultFeatures = [
  { id: 'po_inbox', title: 'PO Inbox', enabled: true, category: 'core', required: true },
  { id: 'ack_queue', title: 'ACK Processing Queue', enabled: true, category: 'core' },
  { id: 'exception_monitor', title: 'Exception Monitor', enabled: true, category: 'core' },
  { id: 'production_tracker', title: 'Production Tracker', enabled: true, category: 'operations' },
  { id: 'ai_actions_log', title: 'Recent AI Actions', enabled: true, category: 'analytics' },
  { id: 'shipping_status', title: 'Shipping & Logistics', enabled: false, category: 'operations' },
  { id: 'warranty_claims', title: 'Warranty Claims', enabled: false, category: 'support' },
  { id: 'supplier_scorecard', title: 'Supplier Scorecard', enabled: false, category: 'analytics' },
  { id: 'inventory_forecast', title: 'Inventory Forecast', enabled: false, category: 'analytics' },
  { id: 'compliance_dashboard', title: 'Compliance & Audit', enabled: false, category: 'finance' },
]

// --- Metrics Chart Placeholders ---
const metricsCharts = [
  { title: 'PO Volume', type: 'Area', description: 'Incoming POs by day/week/month' },
  { title: 'ACK Turnaround', type: 'Bar', description: 'Time from PO received → ACK sent' },
  { title: 'Exception Rate', type: 'Line', description: '% of POs with discrepancies' },
  { title: 'Auto-Accept Rate', type: 'Gauge', description: '% ACKs auto-accepted' },
  { title: 'Resolution Time', type: 'Bar', description: 'Avg exception resolution by code' },
  { title: 'On-Time Shipping', type: 'Line', description: '% shipped on/before committed date' },
  { title: 'AI Accuracy', type: 'Multi-line', description: 'Extraction & correction accuracy' },
  { title: 'Supplier Performance', type: 'Stacked Bar', description: 'Top 10 by volume × exception rate' },
  { title: 'Cost Impact', type: 'Donut', description: 'Resolved savings vs write-offs' },
]

const severityColors: Record<string, string> = {
  critical: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300',
  high: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300',
  medium: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  low: 'bg-zinc-50 dark:bg-zinc-500/10 border-zinc-200 dark:border-zinc-500/20 text-zinc-700 dark:text-zinc-300',
}

const activityTypeColors: Record<string, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const kpiColorStyles: Record<string, string> = {
  orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
}

export default function CommandCenter({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: CommandCenterProps) {
  const { currentTenant } = useTenant()
  const [mainTab, setMainTab] = useState<'follow_up' | 'your_tools' | 'metrics'>('follow_up')
  const [features, setFeatures] = useState(defaultFeatures)
  const [showFeatureManager, setShowFeatureManager] = useState(false)
  const [expandedUrgent, setExpandedUrgent] = useState<Set<number>>(new Set([1]))

  const enabledTools = features.filter(f => f.enabled)
  const toolsOrder = enabledTools.map(f => f.id)

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f =>
      f.id === id && !f.required ? { ...f, enabled: !f.enabled } : f
    ))
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-10">
      <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Command Center' }]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
              Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Manufacturer operations overview for {currentTenant}
            </p>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit">
          {[
            { id: 'follow_up' as const, label: 'Follow Up', icon: HomeIcon },
            { id: 'your_tools' as const, label: 'Your Tools', icon: WrenchScrewdriverIcon },
            { id: 'metrics' as const, label: 'Metrics', icon: ChartBarIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                mainTab === tab.id
                  ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                  : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== FOLLOW UP TAB ==================== */}
        {mainTab === 'follow_up' && (
          <div className="space-y-6">

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {kpiData.map((kpi) => (
                <div key={kpi.label} className="bg-white dark:bg-zinc-800 rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", kpiColorStyles[kpi.color])}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs font-medium text-foreground truncate">{kpi.label}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Urgent Actions */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-foreground">Urgent Actions</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium">
                    {urgentActions.filter(a => a.severity === 'critical').length} critical
                  </span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {urgentActions.map(action => (
                  <div
                    key={action.id}
                    className={cn("px-5 py-3 cursor-pointer transition-colors hover:bg-brand-300/10 dark:hover:bg-brand-600/10")}
                    onClick={() => setExpandedUrgent(prev => {
                      const next = new Set(prev)
                      next.has(action.id) ? next.delete(action.id) : next.add(action.id)
                      return next
                    })}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border", severityColors[action.severity])}>
                        {action.severity}
                      </span>
                      <span className="text-sm font-medium text-foreground flex-1">{action.title}</span>
                      <button className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                        {action.action}
                      </button>
                    </div>
                    {expandedUrgent.has(action.id) && (
                      <p className="text-xs text-muted-foreground mt-2 ml-[72px]">{action.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column: Recent Activity + Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                </div>
                <div className="divide-y divide-border">
                  {recentActivity.map(item => (
                    <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activityTypeColors[item.type])} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: 'ACK Turnaround', value: 85, target: '< 2 days', color: 'bg-green-500' },
                    { label: 'Exception Resolution', value: 72, target: '< 4 hours', color: 'bg-amber-500' },
                    { label: 'On-Time Shipping', value: 94, target: '> 95%', color: 'bg-blue-500' },
                    { label: 'AI Auto-Accept', value: 82, target: '> 80%', color: 'bg-indigo-500' },
                    { label: 'Clean Match Rate', value: 91, target: '> 90%', color: 'bg-green-500' },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{metric.label}</span>
                        <span className="text-xs text-muted-foreground">{metric.value}% (target: {metric.target})</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", metric.color)} style={{ width: `${metric.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== YOUR TOOLS TAB ==================== */}
        {mainTab === 'your_tools' && (
          <div className="space-y-6">
            {/* Feature Manager Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {enabledTools.length} tools active — drag to reorder
              </p>
              <button
                onClick={() => setShowFeatureManager(!showFeatureManager)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                {showFeatureManager ? 'Done' : 'Manage Tools'}
              </button>
            </div>

            {/* Feature Manager Panel */}
            {showFeatureManager && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Toggle Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map(feature => (
                    <label
                      key={feature.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        feature.enabled
                          ? "border-primary/30 bg-primary/5 dark:bg-brand-500/10"
                          : "border-border hover:border-brand-300 dark:hover:border-brand-600/50",
                        feature.required && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={feature.enabled}
                        onChange={() => toggleFeature(feature.id)}
                        disabled={feature.required}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{feature.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{feature.category}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Widget Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {enabledTools.map(tool => (
                <div key={tool.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                    <span className="text-[10px] text-muted-foreground uppercase">{tool.category}</span>
                  </div>
                  <div className="p-5">
                    {/* PO Inbox Widget */}
                    {tool.id === 'po_inbox' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="text" placeholder="Search POs..." className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none" />
                          </div>
                        </div>
                        {['PO-2026-095 — Acme Corp — 45 items — Received', 'PO-2026-094 — TechDealer — 12 items — AI Processing', 'PO-2026-093 — Urban Living — 28 items — Under Review'].map((po, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-300/20 dark:hover:bg-brand-600/20 cursor-pointer transition-colors">
                            <DocumentTextIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground truncate">{po}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* ACK Queue Widget */}
                    {tool.id === 'ack_queue' && (
                      <div className="space-y-3">
                        {['ACK-8843 — Steelcase — 5 lines — Pending Review', 'ACK-8842 — Herman Miller — 2 corrections — Ready', 'ACK-8841 — Knoll — Partial — Backorder'].map((ack, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-300/20 dark:hover:bg-brand-600/20 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                              <ClipboardDocumentCheckIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground">{ack}</span>
                            </div>
                            <button className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Review</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Exception Monitor Widget */}
                    {tool.id === 'exception_monitor' && (
                      <div className="space-y-2">
                        {[
                          { text: 'Qty Mismatch — PO-2026-091 — 3 lines', severity: 'critical' },
                          { text: 'Price Discrepancy — PO-2026-088 — $500 diff', severity: 'high' },
                          { text: 'Ship Date — PO-2026-085 — 2 week delay', severity: 'medium' },
                        ].map((ex, i) => (
                          <div key={i} className={cn("p-2 rounded-lg border text-sm", severityColors[ex.severity])}>
                            {ex.text}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Production Tracker Widget */}
                    {tool.id === 'production_tracker' && (
                      <div className="space-y-3">
                        {[
                          { order: 'ORD-2055', stage: 'Manufacturing', progress: 65, eta: 'Feb 15' },
                          { order: 'ORD-2054', stage: 'Assembly', progress: 40, eta: 'Feb 22' },
                          { order: 'ORD-2053', stage: 'QC', progress: 90, eta: 'Feb 08' },
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-foreground">{item.order} — {item.stage}</span>
                              <span className="text-muted-foreground">ETA {item.eta}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-brand-400 rounded-full" style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* AI Actions Log Widget */}
                    {tool.id === 'ai_actions_log' && (
                      <div className="space-y-2">
                        {[
                          { action: 'Auto-accepted ACK-8840', time: '2m ago', icon: '✓' },
                          { action: 'Extracted 45 items from PO-2026-095', time: '5m ago', icon: '⚡' },
                          { action: 'Delta engine: 2 corrections on ACK-8842', time: '12m ago', icon: '🔄' },
                          { action: 'Created exception for qty mismatch', time: '15m ago', icon: '⚠' },
                        ].map((log, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="text-base shrink-0">{log.icon}</span>
                            <span className="text-foreground flex-1">{log.action}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Generic placeholder for other widgets */}
                    {!['po_inbox', 'ack_queue', 'exception_monitor', 'production_tracker', 'ai_actions_log'].includes(tool.id) && (
                      <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                        {tool.title} — coming soon
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== METRICS TAB ==================== */}
        {mainTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricsCharts.map(chart => (
              <div key={chart.title} className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">{chart.title}</h3>
                  <p className="text-[10px] text-muted-foreground">{chart.type} chart</p>
                </div>
                <div className="h-48 flex items-center justify-center p-5">
                  <div className="text-center">
                    <ChartBarIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{chart.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

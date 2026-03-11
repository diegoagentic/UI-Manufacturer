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
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  Bars3Icon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Reorder } from 'framer-motion'
import Breadcrumbs from './components/Breadcrumbs'
import FeatureManager from './components/FeatureManager'
import type { Feature } from './components/FeatureManager'
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
  { label: 'Avg Response Time', value: '1.2d', sub: 'Days to acknowledge', icon: ArrowTrendingUpIcon, color: 'blue' },
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
  { id: 1, action: 'Acknowledgement auto-accepted', detail: 'PO-2026-089 — Herman Miller — all lines matched', time: '2 min ago', type: 'success' },
  { id: 2, action: 'Exception created', detail: 'PO-2026-091 — Qty mismatch on 3 lines', time: '15 min ago', type: 'warning' },
  { id: 3, action: 'Delta engine completed', detail: 'ACK-8842 — 2 auto-corrections, 1 escalated', time: '32 min ago', type: 'info' },
  { id: 4, action: 'PO received', detail: 'PO-2026-095 from Acme Corp — 45 line items', time: '1h ago', type: 'info' },
  { id: 5, action: 'Claim submitted', detail: 'Issue #1023 — freight damage — carrier liability 70%', time: '2h ago', type: 'success' },
]

// --- Your Tools Widget Definitions ---
const defaultFeatures: Feature[] = [
  { id: 'po_inbox', title: 'PO Inbox', description: 'Receive and process incoming purchase orders with AI extraction.', enabled: true, category: 'core', required: true },
  { id: 'ack_queue', title: 'Acknowledgement Processing Queue', description: 'Review, validate, and send acknowledgements with delta comparison.', enabled: true, category: 'core' },
  { id: 'exception_monitor', title: 'Exception Monitor', description: 'Track and resolve discrepancies across all orders.', enabled: true, category: 'core' },
  { id: 'production_tracker', title: 'Production Tracker', description: 'Monitor manufacturing progress and delivery ETAs.', enabled: true, category: 'operations' },
  { id: 'ai_actions_log', title: 'Recent AI Actions', description: 'Audit trail of all AI-automated decisions and corrections.', enabled: true, category: 'analytics' },
  { id: 'shipping_status', title: 'Shipping & Logistics', description: 'Track shipments, carriers, and delivery confirmations.', enabled: false, category: 'operations' },
  { id: 'warranty_claims', title: 'Warranty Claims', description: 'Process and track product warranty issues.', enabled: false, category: 'support' },
  { id: 'supplier_scorecard', title: 'Supplier Scorecard', description: 'Performance metrics for your top suppliers.', enabled: false, category: 'analytics' },
  { id: 'inventory_forecast', title: 'Inventory Forecast', description: 'Predict stock needs based on order trends.', enabled: false, category: 'analytics' },
  { id: 'compliance_dashboard', title: 'Compliance & Audit', description: 'Regulatory compliance tracking and audit logs.', enabled: false, category: 'finance' },
]

// --- AI Suggestions for Manufacturer ---
const aiSuggestions = [
  {
    id: 1,
    title: 'Batch PO Processing',
    description: '3 POs from TechDealer share 80% SKU overlap. Batch process to reduce validation time by 40%.',
    impact: 'Save 2.5h',
    icon: BoltIcon,
    type: 'savings',
  },
  {
    id: 2,
    title: 'Supplier Exception Pattern',
    description: 'Coastal Props has 3× average exception rate this month. Root cause: outdated price list.',
    impact: 'Reduce errors',
    icon: ExclamationTriangleIcon,
    type: 'action',
  },
  {
    id: 3,
    title: 'Raise Auto-Accept Threshold',
    description: 'Lowering confidence threshold from 90% to 85% would auto-process 12 more ACKs/week with <1% error risk.',
    impact: '+15% automation',
    icon: SparklesIcon,
    type: 'opportunity',
  },
  {
    id: 4,
    title: 'Consolidate Shipments',
    description: 'Combine 3 pending orders for Urban Living to save 12% on freight costs.',
    impact: 'Save $1,800',
    icon: TruckIcon,
    type: 'savings',
  },
]


// --- Metric Chart Definitions ---
const defaultMetricCharts: Feature[] = [
  { id: 'po_volume', title: 'PO Volume', description: 'Incoming POs by week — area chart', enabled: true, category: 'core' },
  { id: 'ack_turnaround', title: 'Acknowledgement Turnaround', description: 'Hours to acknowledge by day — bar chart', enabled: true, category: 'core' },
  { id: 'exception_rate', title: 'Exception Rate', description: '% of POs with discrepancies — line chart', enabled: true, category: 'core' },
  { id: 'auto_accept_rate', title: 'Auto-Accept Rate', description: '% acknowledgements auto-accepted by AI — gauge', enabled: true, category: 'analytics' },
  { id: 'resolution_time', title: 'Resolution Time', description: 'Avg hours by exception type — horizontal bars', enabled: true, category: 'operations' },
  { id: 'on_time_shipping', title: 'On-Time Shipping', description: '% shipped on/before committed date — area chart', enabled: true, category: 'operations' },
  { id: 'ai_accuracy', title: 'AI Accuracy', description: 'Extraction & correction accuracy — multi-line', enabled: true, category: 'analytics' },
  { id: 'supplier_performance', title: 'Supplier Performance', description: 'Volume vs exception rate by supplier — stacked bars', enabled: true, category: 'analytics' },
  { id: 'cost_impact', title: 'Cost Impact', description: 'Resolved savings vs write-offs — donut chart', enabled: true, category: 'finance' },
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
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures)
  const [isFeatureManagerOpen, setIsFeatureManagerOpen] = useState(false)
  const [expandedUrgent, setExpandedUrgent] = useState<Set<number>>(new Set([1]))
  const [toolsOrder, setToolsOrder] = useState<string[]>(
    defaultFeatures.filter(f => f.enabled).map(f => f.id)
  )

  const handleToggleFeature = (id: string, enabled: boolean) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled } : f))
    if (enabled && !toolsOrder.includes(id)) {
      setToolsOrder(prev => [id, ...prev])
    }
  }

  // --- Metrics customization state ---
  const [metricCharts, setMetricCharts] = useState<Feature[]>(defaultMetricCharts)
  const [isMetricsManagerOpen, setIsMetricsManagerOpen] = useState(false)
  const [metricsOrder, setMetricsOrder] = useState<string[]>(
    defaultMetricCharts.filter(f => f.enabled).map(f => f.id)
  )

  const handleToggleMetric = (id: string, enabled: boolean) => {
    setMetricCharts(prev => prev.map(f => f.id === id ? { ...f, enabled } : f))
    if (enabled && !metricsOrder.includes(id)) {
      setMetricsOrder(prev => [id, ...prev])
    }
  }

  const activeMetricsCount = metricsOrder.filter(id => {
    const m = metricCharts.find(f => f.id === id)
    return m?.enabled
  }).length

  const metricsGridCols = activeMetricsCount <= 2
    ? 'grid-cols-1 md:grid-cols-2'
    : activeMetricsCount <= 4
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

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

            {/* 2x2 Grid: Urgent Actions, AI Suggestions, Recent Activity, Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Urgent Actions */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-semibold text-foreground">Urgent Actions</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium">
                      {urgentActions.filter(a => a.severity === 'critical').length} critical
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
                  {urgentActions.map(action => (
                    <div
                      key={action.id}
                      className={cn("p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                        action.severity === 'critical' ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 hover:border-red-300 dark:hover:border-red-500/30" :
                        action.severity === 'high' ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 hover:border-amber-300 dark:hover:border-amber-500/30" :
                        "border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30"
                      )}
                      onClick={() => setExpandedUrgent(prev => {
                        const next = new Set(prev)
                        next.has(action.id) ? next.delete(action.id) : next.add(action.id)
                        return next
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0", severityColors[action.severity])}>
                          {action.severity}
                        </span>
                        <span className="text-sm font-medium text-foreground flex-1">{action.title}</span>
                        <button className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shrink-0">
                          {action.action}
                        </button>
                      </div>
                      {expandedUrgent.has(action.id) && (
                        <p className="text-xs text-muted-foreground mt-2 pl-[72px]">{action.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2 shrink-0">
                  <SparklesIcon className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-base font-semibold text-foreground">AI Suggestions</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
                    {aiSuggestions.length} new
                  </span>
                </div>
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
                  {aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 border border-zinc-100 dark:border-zinc-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <suggestion.icon className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{suggestion.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shrink-0">
                              {suggestion.impact}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {suggestion.description}
                          </p>
                          <button className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group/btn">
                            Apply Suggestion <ArrowRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border shrink-0">
                  <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
                </div>
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
                  {recentActivity.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all">
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
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border shrink-0">
                  <h2 className="text-base font-semibold text-foreground">Performance Overview</h2>
                </div>
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
                  {[
                    { label: 'Acknowledgement Turnaround', value: 85, target: '< 2 days', color: 'bg-green-500' },
                    { label: 'Exception Resolution', value: 72, target: '< 4 hours', color: 'bg-amber-500' },
                    { label: 'On-Time Shipping', value: 94, target: '> 95%', color: 'bg-blue-500' },
                    { label: 'AI Auto-Accept', value: 82, target: '> 80%', color: 'bg-indigo-500' },
                    { label: 'Clean Match Rate', value: 91, target: '> 90%', color: 'bg-green-500' },
                  ].map(metric => (
                    <div key={metric.label} className="p-3 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30">
                      <div className="flex items-center justify-between mb-1.5">
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

            {/* Config Bar — matches dealer pattern */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-white/5 rounded-lg">
              <span className="text-sm font-medium text-foreground">Tools configured for you</span>
              <button
                onClick={() => setIsFeatureManagerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-md shadow-sm text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Customize
              </button>
            </div>

            {/* FeatureManager Modal */}
            <FeatureManager
              isOpen={isFeatureManagerOpen}
              onClose={() => setIsFeatureManagerOpen(false)}
              features={features}
              onToggleFeature={handleToggleFeature}
            />

            {/* Reorderable Widget List */}
            <Reorder.Group axis="y" values={toolsOrder} onReorder={setToolsOrder} className="space-y-6">
              {toolsOrder.map((toolId) => {
                const feature = features.find(f => f.id === toolId)
                if (!feature || !feature.enabled) return null

                return (
                  <Reorder.Item
                    key={toolId}
                    value={toolId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                    className="bg-white dark:bg-zinc-800 rounded-2xl border border-border overflow-hidden"
                  >
                    {/* Widget Header with drag handle */}
                    <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                      <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground flex-1">{feature.title}</h3>
                      <span className="text-[10px] text-muted-foreground uppercase">{feature.category}</span>
                    </div>
                    <div className="p-5">
                      {/* PO Inbox Widget */}
                      {toolId === 'po_inbox' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="relative flex-1">
                              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input type="text" placeholder="Search POs..." className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                          </div>
                          {[
                            { id: 'PO-2026-095', supplier: 'Acme Corp', items: 45, status: 'Received' },
                            { id: 'PO-2026-094', supplier: 'TechDealer', items: 12, status: 'AI Processing' },
                            { id: 'PO-2026-093', supplier: 'Urban Living', items: 28, status: 'Under Review' },
                          ].map((po) => (
                            <div key={po.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all">
                              <DocumentTextIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{po.id}</span>
                                  <span className="text-[10px] text-muted-foreground">·</span>
                                  <span className="text-xs text-muted-foreground truncate">{po.supplier}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">{po.items} items</span>
                              </div>
                              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
                                po.status === 'Received' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300' :
                                po.status === 'AI Processing' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' :
                                'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                              )}>{po.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* ACK Queue Widget */}
                      {toolId === 'ack_queue' && (
                        <div className="space-y-3">
                          {[
                            { id: 'ACK-8843', vendor: 'Steelcase', lines: 5, status: 'Pending Review', statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
                            { id: 'ACK-8842', vendor: 'Herman Miller', lines: 28, status: '2 corrections', statusColor: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' },
                            { id: 'ACK-8841', vendor: 'Knoll', lines: 8, status: 'Backorder', statusColor: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
                          ].map((ack) => (
                            <div key={ack.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <ClipboardDocumentCheckIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-foreground">{ack.id}</span>
                                    <span className="text-[10px] text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground truncate">{ack.vendor}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground">{ack.lines} lines</span>
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", ack.statusColor)}>{ack.status}</span>
                                  </div>
                                </div>
                              </div>
                              <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shrink-0">Review</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Exception Monitor Widget */}
                      {toolId === 'exception_monitor' && (
                        <div className="space-y-3">
                          {[
                            { problem: 'Qty Mismatch', po: 'PO-2026-091', detail: '3 lines affected', severity: 'critical' },
                            { problem: 'Price Discrepancy', po: 'PO-2026-088', detail: '$500 difference', severity: 'high' },
                            { problem: 'Ship Date', po: 'PO-2026-085', detail: '2 week delay', severity: 'medium' },
                          ].map((ex, i) => (
                            <div key={i} className={cn("p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all", severityColors[ex.severity])}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">{ex.problem}</span>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full border border-current/20">{ex.severity}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-medium">{ex.po}</span>
                                <span className="text-[10px] opacity-70">·</span>
                                <span className="text-[10px] opacity-70">{ex.detail}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Production Tracker Widget */}
                      {toolId === 'production_tracker' && (
                        <div className="space-y-3">
                          {[
                            { order: 'ORD-2055', stage: 'Manufacturing', progress: 65, eta: 'Feb 15', stageColor: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
                            { order: 'ORD-2054', stage: 'Assembly', progress: 40, eta: 'Feb 22', stageColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
                            { order: 'ORD-2053', stage: 'QC', progress: 90, eta: 'Feb 08', stageColor: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300' },
                          ].map((item) => (
                            <div key={item.order} className="p-3 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{item.order}</span>
                                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", item.stageColor)}>{item.stage}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">ETA {item.eta}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">{item.progress}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* AI Actions Log Widget */}
                      {toolId === 'ai_actions_log' && (
                        <div className="space-y-2">
                          {[
                            { action: 'Auto-accepted Acknowledgement ACK-8840', time: '2m ago', Icon: CheckCircleIcon, color: 'text-green-500' },
                            { action: 'Extracted 45 items from PO-2026-095', time: '5m ago', Icon: BoltIcon, color: 'text-indigo-500' },
                            { action: 'Delta engine: 2 corrections on ACK-8842', time: '12m ago', Icon: SparklesIcon, color: 'text-brand-500' },
                            { action: 'Created exception for qty mismatch', time: '15m ago', Icon: ExclamationTriangleIcon, color: 'text-amber-500' },
                          ].map((log, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all">
                              <log.Icon className={cn("w-4 h-4 shrink-0", log.color)} />
                              <span className="text-xs text-foreground flex-1">{log.action}</span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{log.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Generic placeholder for other widgets */}
                      {!['po_inbox', 'ack_queue', 'exception_monitor', 'production_tracker', 'ai_actions_log'].includes(toolId) && (
                        <div className="bg-card rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-muted dark:bg-zinc-700 flex items-center justify-center mb-4">
                            <CubeIcon className="w-6 h-6 text-zinc-400" />
                          </div>
                          <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 max-w-md">{feature.description}</p>
                          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                            Launch Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
          </div>
        )}

        {/* ==================== METRICS TAB ==================== */}
        {mainTab === 'metrics' && (
          <div className="space-y-4">
            {/* Config bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-white/5 rounded-lg">
              <span className="text-sm font-medium text-foreground">Metrics configured for you</span>
              <button
                onClick={() => setIsMetricsManagerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-md shadow-sm text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Customize
              </button>
            </div>

            {/* Metrics Manager Modal */}
            <FeatureManager
              isOpen={isMetricsManagerOpen}
              onClose={() => setIsMetricsManagerOpen(false)}
              features={metricCharts}
              onToggleFeature={handleToggleMetric}
            />

            {/* Reorderable chart grid */}
            <Reorder.Group
              axis="y"
              values={metricsOrder}
              onReorder={setMetricsOrder}
              className={cn("grid gap-4", metricsGridCols)}
            >
              {metricsOrder.map((chartId) => {
                const chart = metricCharts.find(m => m.id === chartId)
                if (!chart || !chart.enabled) return null

                return (
                  <Reorder.Item
                    key={chartId}
                    value={chartId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileDrag={{ scale: 1.03, zIndex: 50, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                    className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden"
                  >
                    {/* ---- PO Volume ---- */}
                    {chartId === 'po_volume' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">PO Volume</h3>
                          <p className="text-[10px] text-muted-foreground">Incoming POs by week</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">342</p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">+12% ↑</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <polygon points="0,82 25,70 50,74 75,55 100,60 125,40 150,45 175,30 200,24 200,100 0,100" fill="#6366f1" opacity="0.12" />
                          <polyline points="0,82 25,70 50,74 75,55 100,60 125,40 150,45 175,30 200,24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {['W1','W2','W3','W4','W5','W6','W7','W8','W9'].map(w => <span key={w}>{w}</span>)}
                        </div>
                      </div>
                    </>)}

                    {/* ---- ACK Turnaround ---- */}
                    {chartId === 'ack_turnaround' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Acknowledgement Turnaround</h3>
                          <p className="text-[10px] text-muted-foreground">Hours to acknowledge by day</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">1.2d</p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">-8% ↓</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <div className="flex-1 flex items-end gap-2">
                          {[
                            { label: 'Mon', h: 65 },
                            { label: 'Tue', h: 82 },
                            { label: 'Wed', h: 45 },
                            { label: 'Thu', h: 70 },
                            { label: 'Fri', h: 38 },
                            { label: 'Sat', h: 22 },
                          ].map(bar => (
                            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%' }}>
                              <div className="w-full flex-1" />
                              <div className="w-full rounded-t bg-indigo-400 dark:bg-indigo-500 shrink-0" style={{ height: `${bar.h}%` }} />
                              <span className="text-[9px] text-muted-foreground shrink-0">{bar.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>)}

                    {/* ---- Exception Rate ---- */}
                    {chartId === 'exception_rate' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Exception Rate</h3>
                          <p className="text-[10px] text-muted-foreground">% of POs with discrepancies</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">4.2%</p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">-1.8% ↓</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <line x1="0" y1="30" x2="200" y2="30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                          <polyline points="0,20 28,35 57,28 85,42 114,35 142,48 171,42 200,55" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {[{x:0,y:20},{x:28,y:35},{x:57,y:28},{x:85,y:42},{x:114,y:35},{x:142,y:48},{x:171,y:42},{x:200,y:55}].map((p,i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f59e0b" />
                          ))}
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(m => <span key={m}>{m}</span>)}
                        </div>
                      </div>
                    </>)}

                    {/* ---- Auto-Accept Rate ---- */}
                    {chartId === 'auto_accept_rate' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Auto-Accept Rate</h3>
                          <p className="text-[10px] text-muted-foreground">% ACKs auto-accepted</p>
                        </div>
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">+5% ↑ vs last month</p>
                      </div>
                      <div className="h-44 flex items-center justify-center">
                        <svg viewBox="0 0 120 75" className="w-44 h-28">
                          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" className="dark:hidden" />
                          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#3f3f46" strokeWidth="10" strokeLinecap="round" className="hidden dark:block" />
                          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeDasharray="128.8 157" />
                          <text x="60" y="55" textAnchor="middle" fill="currentColor" fontSize="22" fontWeight="bold">82%</text>
                          <text x="60" y="70" textAnchor="middle" fill="#94a3b8" fontSize="8">target: 80%</text>
                        </svg>
                      </div>
                    </>)}

                    {/* ---- Resolution Time ---- */}
                    {chartId === 'resolution_time' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Resolution Time</h3>
                          <p className="text-[10px] text-muted-foreground">Avg hours by exception type</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">3.4h</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">+0.2h ↑</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 py-4 flex flex-col justify-center gap-3">
                        {[
                          { label: 'Qty Mismatch', value: 85, hours: '4.2h' },
                          { label: 'Price Disc.', value: 70, hours: '3.5h' },
                          { label: 'Ship Date', value: 45, hours: '2.2h' },
                          { label: 'Substitution', value: 60, hours: '3.0h' },
                          { label: 'Missing Info', value: 30, hours: '1.5h' },
                        ].map(bar => (
                          <div key={bar.label} className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground w-20 text-right shrink-0">{bar.label}</span>
                            <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full" style={{ width: `${bar.value}%` }} />
                            </div>
                            <span className="text-[9px] font-medium text-foreground w-8 shrink-0">{bar.hours}</span>
                          </div>
                        ))}
                      </div>
                    </>)}

                    {/* ---- On-Time Shipping ---- */}
                    {chartId === 'on_time_shipping' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">On-Time Shipping</h3>
                          <p className="text-[10px] text-muted-foreground">% shipped on/before committed date</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">94%</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">target: 95%</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <line x1="0" y1="15" x2="200" y2="15" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                          <polygon points="0,25 28,20 57,30 85,18 114,22 142,12 171,18 200,15 200,100 0,100" fill="#3b82f6" opacity="0.08" />
                          <polyline points="0,25 28,20 57,30 85,18 114,22 142,12 171,18 200,15" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(m => <span key={m}>{m}</span>)}
                        </div>
                      </div>
                    </>)}

                    {/* ---- AI Accuracy ---- */}
                    {chartId === 'ai_accuracy' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">AI Accuracy</h3>
                          <p className="text-[10px] text-muted-foreground">Extraction & correction accuracy</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[9px] text-muted-foreground">Extract</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[9px] text-muted-foreground">Correct</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <polyline points="0,40 33,32 66,28 100,22 133,18 166,12 200,8" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="0,55 33,48 66,50 100,40 133,35 166,28 200,22" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {['Jul','Aug','Sep','Oct','Nov','Dec','Jan'].map(m => <span key={m}>{m}</span>)}
                        </div>
                      </div>
                    </>)}

                    {/* ---- Supplier Performance ---- */}
                    {chartId === 'supplier_performance' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Supplier Performance</h3>
                          <p className="text-[10px] text-muted-foreground">Volume vs exception rate</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-indigo-400" />
                            <span className="text-[9px] text-muted-foreground">Clean</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-red-400" />
                            <span className="text-[9px] text-muted-foreground">Exceptions</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-44 px-5 py-4 flex flex-col justify-center gap-2.5">
                        {[
                          { name: 'Acme Corp', clean: 92, exc: 8 },
                          { name: 'TechDealer', clean: 85, exc: 15 },
                          { name: 'Urban Living', clean: 78, exc: 22 },
                          { name: 'Steelcase', clean: 95, exc: 5 },
                          { name: 'Coastal', clean: 70, exc: 30 },
                        ].map(s => (
                          <div key={s.name} className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground w-16 text-right shrink-0 truncate">{s.name}</span>
                            <div className="flex-1 h-3 flex rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 dark:bg-indigo-500" style={{ width: `${s.clean}%` }} />
                              <div className="h-full bg-red-400 dark:bg-red-500" style={{ width: `${s.exc}%` }} />
                            </div>
                            <span className="text-[9px] font-medium text-foreground w-6 shrink-0">{s.exc}%</span>
                          </div>
                        ))}
                      </div>
                    </>)}

                    {/* ---- Cost Impact ---- */}
                    {chartId === 'cost_impact' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Cost Impact</h3>
                          <p className="text-[10px] text-muted-foreground">Resolved savings vs write-offs</p>
                        </div>
                      </div>
                      <div className="h-44 flex items-center justify-center gap-6 px-5">
                        <div className="relative w-28 h-28">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: 'conic-gradient(from -90deg, #22c55e 0deg 270deg, #f59e0b 270deg 324deg, #9ca3af 324deg 360deg)' }}
                          />
                          <div className="absolute inset-3 rounded-full bg-white dark:bg-zinc-800" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm font-bold text-foreground">$847K</p>
                              <p className="text-[8px] text-muted-foreground">total</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                            <div>
                              <p className="text-[10px] font-medium text-foreground">$635K</p>
                              <p className="text-[8px] text-muted-foreground">Recovered</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                            <div>
                              <p className="text-[10px] font-medium text-foreground">$127K</p>
                              <p className="text-[8px] text-muted-foreground">Write-offs</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-400 dark:bg-zinc-500" />
                            <div>
                              <p className="text-[10px] font-medium text-foreground">$85K</p>
                              <p className="text-[8px] text-muted-foreground">Pending</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>)}

                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
          </div>
        )}

      </div>
    </div>
  )
}

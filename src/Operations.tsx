import { useState, useMemo, useEffect, Fragment } from 'react'
import { useTenant } from './TenantContext'
import { useDemo } from './context/DemoContext'
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import Breadcrumbs from './components/Breadcrumbs'
import Select from './components/Select'
import BatchAckModal from './components/BatchAckModal'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface OperationsProps {
  onLogout: () => void
  onNavigateToDetail: (type: string) => void
  onNavigateToWorkspace: () => void
  onNavigate: (page: string) => void
}

// --- Pipeline Stages ---
const poPipelineStages = ['Received', 'AI Processing', 'Under Review', 'ACK Draft', 'ACK Sent', 'Completed']
const ackPipelineStages = ['Draft', 'AI Validated', 'Sent', 'Confirmed', 'Revision Pending']
const exceptionPipelineStages = ['New', 'AI Analyzing', 'Pending Review', 'In Progress', 'Resolved']

// --- KPI Data per tab ---
const poKpis = [
  { label: 'Active POs', value: '156', sub: 'In pipeline', icon: CubeIcon, color: 'blue' },
  { label: 'Pending ACK', value: '23', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
  { label: 'With Exceptions', value: '7', sub: 'Need attention', icon: ExclamationTriangleIcon, color: 'red' },
  { label: 'Clean Match Rate', value: '91%', sub: 'Auto-accepted', icon: CheckCircleIcon, color: 'green' },
  { label: 'Total Value', value: '$3.8M', sub: 'Active POs', icon: CurrencyDollarIcon, color: 'indigo' },
]

const ackKpis = [
  { label: 'Pending ACKs', value: '23', sub: 'Awaiting review', icon: ClockIcon, color: 'orange' },
  { label: 'Discrepancies', value: '5', sub: 'Action required', icon: ExclamationTriangleIcon, color: 'red' },
  { label: 'Confirmed', value: '156', sub: 'On track', icon: CheckCircleIcon, color: 'green' },
  { label: 'Avg Lead Time', value: '4.2w', sub: 'Weeks to ship', icon: CalendarIcon, color: 'blue' },
  { label: 'On-Time %', value: '94%', sub: 'Vendor perf.', icon: ArrowTrendingUpIcon, color: 'indigo' },
]

const exceptionKpis = [
  { label: 'Open Exceptions', value: '7', sub: 'Need resolution', icon: ExclamationTriangleIcon, color: 'red' },
  { label: 'Avg Resolution', value: '3.2h', sub: 'Hours to resolve', icon: ClockIcon, color: 'orange' },
  { label: 'Auto-Resolved', value: '34%', sub: 'No human needed', icon: SparklesIcon, color: 'green' },
  { label: 'By Qty Mismatch', value: '3', sub: 'Most common', icon: ExclamationCircleIcon, color: 'blue' },
  { label: 'This Week', value: '12', sub: 'Total exceptions', icon: CalendarIcon, color: 'indigo' },
]

// --- Mock Data ---
const purchaseOrders = [
  { id: 'PO-2026-095', supplier: 'Acme Corp', items: 45, amount: '$124,500', status: 'Received', date: 'Jan 15, 2026',
    confidence: 0, aiInsight: '', agentStage: 'intake' as const, flaggedFields: 0 },
  { id: 'PO-2026-094', supplier: 'TechDealer Solutions', items: 12, amount: '$62,500', status: 'AI Processing', date: 'Jan 14, 2026',
    confidence: 87, aiInsight: '10 SKUs auto-mapped, 2 need expert review', agentStage: 'validator' as const, flaggedFields: 2 },
  { id: 'PO-2026-093', supplier: 'Urban Living Inc.', items: 28, amount: '$112,000', status: 'Under Review', date: 'Jan 13, 2026',
    confidence: 94, aiInsight: 'All line items validated — freight zone flagged', agentStage: 'complete' as const, flaggedFields: 1 },
  { id: 'PO-2026-092', supplier: 'Global Logistics', items: 8, amount: '$45,000', status: 'ACK Sent', date: 'Jan 12, 2026',
    confidence: 98, aiInsight: 'Clean match — auto-acknowledged', agentStage: 'complete' as const, flaggedFields: 0 },
  { id: 'PO-2026-091', supplier: 'City Builders', items: 15, amount: '$89,000', status: 'ACK Draft', date: 'Jan 11, 2026',
    confidence: 76, aiInsight: '3 pricing discrepancies detected, draft pending review', agentStage: 'complete' as const, flaggedFields: 3 },
  { id: 'PO-2026-090', supplier: 'Modern Homes', items: 32, amount: '$210,000', status: 'Completed', date: 'Jan 10, 2026',
    confidence: 99, aiInsight: 'Fully processed — 0 exceptions', agentStage: 'complete' as const, flaggedFields: 0 },
]

const acknowledgements = [
  { id: 'ACK-8843', relatedPo: 'PO-2026-094', vendor: 'TechDealer Solutions', status: 'Draft', lines: 12, date: 'Jan 14, 2026',
    discrepancy: 'None', confidence: 0, aiInsight: '', matchedLines: 0, totalLines: 12, discrepancyCount: 0, autoResolved: 0 },
  { id: 'ACK-8842', relatedPo: 'PO-2026-093', vendor: 'Urban Living Inc.', status: 'AI Validated', lines: 28, date: 'Jan 13, 2026',
    discrepancy: '2 auto-corrected', confidence: 92, aiInsight: '26 lines matched, 2 auto-corrected (grommet config, ship date)', matchedLines: 26, totalLines: 28, discrepancyCount: 2, autoResolved: 2 },
  { id: 'ACK-8841', relatedPo: 'PO-2026-092', vendor: 'Global Logistics', status: 'Sent', lines: 8, date: 'Jan 12, 2026',
    discrepancy: 'None', confidence: 99, aiInsight: 'Perfect match — all 8 lines confirmed', matchedLines: 8, totalLines: 8, discrepancyCount: 0, autoResolved: 0 },
  { id: 'ACK-8840', relatedPo: 'PO-2026-091', vendor: 'City Builders', status: 'Revision Pending', lines: 15, date: 'Jan 11, 2026',
    discrepancy: 'Price Mismatch ($500)', confidence: 68, aiInsight: 'Price mismatch on 3 lines — vendor revision requested', matchedLines: 12, totalLines: 15, discrepancyCount: 3, autoResolved: 0 },
  { id: 'ACK-8839', relatedPo: 'PO-2026-090', vendor: 'Modern Homes', status: 'Confirmed', lines: 32, date: 'Jan 10, 2026',
    discrepancy: 'None', confidence: 99, aiInsight: 'All 32 lines confirmed — zero discrepancies', matchedLines: 32, totalLines: 32, discrepancyCount: 0, autoResolved: 0 },
]

const exceptions = [
  { id: 'EXC-001', relatedPo: 'PO-2026-091', vendor: 'City Builders', problem: 'Qty Mismatch', severity: 'critical', status: 'New', lines: 3, date: 'Jan 15, 2026',
    confidence: 0, aiInsight: '', rootCause: '', autoResolvable: false },
  { id: 'EXC-002', relatedPo: 'PO-2026-088', vendor: 'Coastal Props', problem: 'Price Discrepancy', severity: 'high', status: 'AI Analyzing', lines: 1, date: 'Jan 14, 2026',
    confidence: 82, aiInsight: 'Vendor applied outdated price list — suggesting correction', rootCause: 'Outdated vendor price list', autoResolvable: true },
  { id: 'EXC-003', relatedPo: 'PO-2026-085', vendor: 'Valley Homes', problem: 'Ship Date', severity: 'medium', status: 'Pending Review', lines: 5, date: 'Jan 13, 2026',
    confidence: 91, aiInsight: 'Ship date shifted +7 days — within tolerance threshold', rootCause: 'Production delay at vendor', autoResolvable: false },
  { id: 'EXC-004', relatedPo: 'PO-2026-082', vendor: 'Elite Builders', problem: 'Part # Mismatch', severity: 'high', status: 'In Progress', lines: 2, date: 'Jan 12, 2026',
    confidence: 74, aiInsight: 'Vendor substituted part — checking compatibility', rootCause: 'Vendor substitution without approval', autoResolvable: false },
  { id: 'EXC-005', relatedPo: 'PO-2026-080', vendor: 'Apex Tech', problem: 'Spec Issue', severity: 'low', status: 'Resolved', lines: 1, date: 'Jan 10, 2026',
    confidence: 97, aiInsight: 'Spec deviation within tolerance — auto-accepted', rootCause: 'Minor spec variation', autoResolvable: true },
]

const kpiColorStyles: Record<string, string> = {
  orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
}

const statusColors: Record<string, string> = {
  'Received': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
  'AI Processing': 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Under Review': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'ACK Draft': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'ACK Sent': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'Completed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'Draft': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
  'AI Validated': 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Sent': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Confirmed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'Revision Pending': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'New': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
  'AI Analyzing': 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Pending Review': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'In Progress': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Resolved': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300',
}

// --- Agent Pipeline Helpers ---
type AgentStatus = 'done' | 'running' | 'pending'
interface AgentStep { id: string; name: string; status: AgentStatus }

const poAgentStages = ['ocr', 'parser', 'normalizer', 'validator'] as const
const poAgentNames: Record<string, string> = { ocr: 'OCR', parser: 'Parser', normalizer: 'Norm', validator: 'Valid' }

const ackAgentStages = ['ingest', 'normalize', 'compare', 'resolve'] as const
const ackAgentNames: Record<string, string> = { ingest: 'Ingest', normalize: 'Norm', compare: 'Compare', resolve: 'Resolve' }

const excAgentStages = ['detect', 'analyze', 'classify', 'resolve'] as const
const excAgentNames: Record<string, string> = { detect: 'Detect', analyze: 'Analyze', classify: 'Classify', resolve: 'Resolve' }

function getPoPipeline(agentStage: string): AgentStep[] {
  const idx = poAgentStages.indexOf(agentStage as any)
  return poAgentStages.map((s, i) => ({
    id: s, name: poAgentNames[s],
    status: i < idx ? 'done' : i === idx ? (agentStage === 'complete' ? 'done' : 'running') : 'pending',
  }))
}

function getAckPipeline(status: string): AgentStep[] {
  const activeMap: Record<string, number> = { 'Draft': 0, 'AI Validated': 3, 'Sent': 3, 'Confirmed': 3, 'Revision Pending': 2 }
  const active = activeMap[status] ?? 0
  return ackAgentStages.map((s, i) => ({
    id: s, name: ackAgentNames[s],
    status: i < active ? 'done' : i === active && status === 'AI Validated' ? 'done' : i === active ? 'running' : 'pending',
  }))
}

function getExcPipeline(status: string): AgentStep[] {
  const activeMap: Record<string, number> = { 'New': 0, 'AI Analyzing': 1, 'Pending Review': 2, 'In Progress': 3, 'Resolved': 3 }
  const active = activeMap[status] ?? 0
  return excAgentStages.map((s, i) => ({
    id: s, name: excAgentNames[s],
    status: i < active ? 'done' : i === active && status === 'Resolved' ? 'done' : i === active ? 'running' : 'pending',
  }))
}

export default function Operations({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: OperationsProps) {
  const { currentTenant } = useTenant()
  const { currentStep } = useDemo()
  const [lifecycleTab, setLifecycleTab] = useState<'purchase-orders' | 'acknowledgements' | 'exceptions'>('purchase-orders')
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all' | 'metrics'>('active')
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [isBatchAckOpen, setIsBatchAckOpen] = useState(false)

  // Demo step animation states
  const [aiProcessingPhase, setAiProcessingPhase] = useState<'idle' | 'scanning' | 'extracting' | 'validating' | 'complete'>('idle')
  const [ackArrivalPhase, setAckArrivalPhase] = useState<'idle' | 'arriving' | 'placed'>('idle')

  // Auto-select tab from demo context
  useEffect(() => {
    if (['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'].includes(currentStep?.id)) {
      setLifecycleTab('acknowledgements')
    }
  }, [currentStep?.id])

  // PO AI Processing animation (steps 1.2-1.4)
  useEffect(() => {
    if (!['1.2', '1.3', '1.4'].includes(currentStep?.id)) { setAiProcessingPhase('idle'); return }
    const t: ReturnType<typeof setTimeout>[] = []
    t.push(setTimeout(() => setAiProcessingPhase('scanning'), 2000))
    t.push(setTimeout(() => setAiProcessingPhase('extracting'), 6000))
    t.push(setTimeout(() => setAiProcessingPhase('validating'), 12000))
    t.push(setTimeout(() => setAiProcessingPhase('complete'), 18000))
    return () => t.forEach(clearTimeout)
  }, [currentStep?.id])

  // ACK arrival animation (step 2.1)
  useEffect(() => {
    if (currentStep?.id !== '2.1') { setAckArrivalPhase('idle'); return }
    const t: ReturnType<typeof setTimeout>[] = []
    t.push(setTimeout(() => setAckArrivalPhase('arriving'), 2000))
    t.push(setTimeout(() => setAckArrivalPhase('placed'), 5000))
    return () => t.forEach(clearTimeout)
  }, [currentStep?.id])

  const currentKpis = lifecycleTab === 'purchase-orders' ? poKpis
    : lifecycleTab === 'acknowledgements' ? ackKpis
    : exceptionKpis

  const currentPipelineStages = lifecycleTab === 'purchase-orders' ? poPipelineStages
    : lifecycleTab === 'acknowledgements' ? ackPipelineStages
    : exceptionPipelineStages

  const currentData = lifecycleTab === 'purchase-orders' ? purchaseOrders
    : lifecycleTab === 'acknowledgements' ? acknowledgements
    : exceptions

  const filteredData = useMemo(() => {
    return currentData.filter(item => {
      const searchStr = JSON.stringify(item).toLowerCase()
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase())

      let matchesTab = true
      if (activeTab === 'active') {
        matchesTab = !['Completed', 'Confirmed', 'Resolved'].includes(item.status)
      } else if (activeTab === 'completed') {
        matchesTab = ['Completed', 'Confirmed', 'Resolved'].includes(item.status)
      }

      return matchesSearch && matchesTab
    })
  }, [currentData, searchQuery, activeTab])

  const counts = useMemo(() => ({
    active: currentData.filter(i => !['Completed', 'Confirmed', 'Resolved'].includes(i.status)).length,
    completed: currentData.filter(i => ['Completed', 'Confirmed', 'Resolved'].includes(i.status)).length,
    all: currentData.length,
  }), [currentData])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-10">
      <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Command Center', onClick: () => onNavigate('command-center') },
          { label: 'Operations' },
        ]} />

        {/* Lifecycle Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit">
          {[
            { id: 'purchase-orders' as const, label: 'Purchase Orders', icon: DocumentTextIcon },
            { id: 'acknowledgements' as const, label: 'Acknowledgements', icon: ClipboardDocumentCheckIcon },
            { id: 'exceptions' as const, label: 'Exceptions', icon: ExclamationTriangleIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setLifecycleTab(tab.id); setActiveTab('active'); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                lifecycleTab === tab.id
                  ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                  : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {currentKpis.map((kpi) => (
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

        {/* Status Tabs + View Mode + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-white/60 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit">
            {[
              { id: 'active' as const, label: 'Active', count: counts.active },
              { id: 'completed' as const, label: 'Completed', count: counts.completed },
              { id: 'all' as const, label: 'All', count: counts.all },
              { id: 'metrics' as const, label: 'Metrics', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:bg-brand-300/20 dark:hover:bg-brand-600/20 hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/60 dark:bg-zinc-800/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setViewMode('pipeline')}
                className={cn("p-1.5 rounded transition-colors", viewMode === 'pipeline' ? "bg-white dark:bg-zinc-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700/50")}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded transition-colors", viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700/50")}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none w-48"
              />
            </div>

            {/* Batch ACK button (ACKs tab only) */}
            {lifecycleTab === 'acknowledgements' && (
              <button
                onClick={() => setIsBatchAckOpen(true)}
                className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Batch Process
              </button>
            )}
          </div>
        </div>

        {/* Pipeline View */}
        {viewMode === 'pipeline' && activeTab !== 'metrics' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {currentPipelineStages.map(stage => {
              const stageItems = filteredData.filter(i => i.status === stage)
              return (
                <div key={stage} className="bg-white dark:bg-zinc-900 rounded-xl border border-border min-h-[200px]">
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{stage}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{stageItems.length}</span>
                  </div>
                  <div className="p-2 space-y-2">
                    {stageItems.map((item: any) => {
                      // Determine pipeline agents for this item
                      const agents: AgentStep[] = lifecycleTab === 'purchase-orders'
                        ? getPoPipeline(item.agentStage)
                        : lifecycleTab === 'acknowledgements'
                        ? getAckPipeline(item.status)
                        : getExcPipeline(item.status)
                      const showPipeline = ['AI Processing', 'AI Analyzing', 'AI Validated', 'Under Review', 'Pending Review', 'In Progress'].includes(item.status)
                      const isActiveAiCard = item.id === 'PO-2026-094' && aiProcessingPhase !== 'idle'
                      const isAckArriving = lifecycleTab === 'acknowledgements' && item.status === 'AI Validated' && ackArrivalPhase !== 'idle'

                      return (
                        <div
                          key={item.id}
                          onClick={() => onNavigateToDetail(lifecycleTab === 'purchase-orders' ? 'order-detail' : 'ack-detail')}
                          className={cn(
                            "p-2.5 rounded-lg border cursor-pointer transition-all bg-zinc-50 dark:bg-zinc-800",
                            // Default state
                            "border-border hover:border-primary/30 hover:shadow-sm",
                            // Active AI processing animation (demo step)
                            isActiveAiCard && aiProcessingPhase !== 'complete' && "border-indigo-300 dark:border-indigo-600 ring-1 ring-indigo-500/20",
                            isActiveAiCard && aiProcessingPhase === 'complete' && "border-green-300 dark:border-green-600 ring-1 ring-green-500/20",
                            // ACK arrival animation
                            isAckArriving && ackArrivalPhase === 'arriving' && "border-blue-300 dark:border-blue-600 ring-1 ring-blue-500/20 opacity-70 scale-95 transition-all duration-500",
                            isAckArriving && ackArrivalPhase === 'placed' && "border-blue-300 dark:border-blue-600 opacity-100 scale-100 transition-all duration-500",
                          )}
                        >
                          {/* Header: ID + Confidence */}
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-foreground">{item.id}</p>
                            {item.confidence > 0 && (
                              <span className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[9px] font-bold shrink-0",
                                item.confidence >= 90 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                : item.confidence >= 70 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                              )}>
                                {item.confidence}%
                              </span>
                            )}
                          </div>

                          {/* Supplier / Vendor */}
                          <p className="text-[10px] text-muted-foreground truncate">{item.supplier || item.vendor}</p>

                          {/* Amount (POs) */}
                          {item.amount && <p className="text-[10px] font-medium text-foreground mt-1">{item.amount}</p>}

                          {/* Severity badge (Exceptions) */}
                          {item.severity && (
                            <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block", severityColors[item.severity])}>
                              {item.problem}
                            </span>
                          )}

                          {/* Root cause (Exceptions) */}
                          {item.rootCause && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                              Root cause: <span className="font-medium text-foreground">{item.rootCause}</span>
                            </p>
                          )}

                          {/* Auto-resolvable indicator (Exceptions) */}
                          {item.autoResolvable && (
                            <div className="mt-1 flex items-center gap-1 text-[9px] text-green-600 dark:text-green-400">
                              <SparklesIcon className="w-3 h-3" />
                              <span className="font-medium">AI can auto-resolve</span>
                            </div>
                          )}

                          {/* Discrepancy summary (ACKs) */}
                          {item.discrepancyCount > 0 && (
                            <div className="mt-1.5 flex items-center gap-2 text-[9px]">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                {item.discrepancyCount} discrepancies
                              </span>
                              {item.autoResolved > 0 && (
                                <span className="text-green-600 dark:text-green-400">
                                  ({item.autoResolved} auto-fixed)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Matched lines progress (ACKs) */}
                          {item.matchedLines !== undefined && item.totalLines > 0 && item.matchedLines > 0 && (
                            <div className="mt-1.5">
                              <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-0.5">
                                <span>{item.matchedLines}/{item.totalLines} lines matched</span>
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all" style={{ width: `${(item.matchedLines / item.totalLines) * 100}%` }} />
                              </div>
                            </div>
                          )}

                          {/* Mini Agent Pipeline */}
                          {showPipeline && (
                            <div className="mt-2 flex items-center gap-1 flex-wrap">
                              {agents.map((agent, i, arr) => (
                                <Fragment key={agent.id}>
                                  <div className={cn(
                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-medium border",
                                    agent.status === 'done' && "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400",
                                    agent.status === 'running' && "border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400",
                                    agent.status === 'pending' && "border-border/20 bg-muted/30 text-muted-foreground"
                                  )}>
                                    {agent.status === 'done' && <CheckCircleIcon className="w-2.5 h-2.5" />}
                                    {agent.status === 'running' && <span className="w-2.5 h-2.5 border border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" />}
                                    <span className="uppercase tracking-wider">{agent.name}</span>
                                  </div>
                                  {i < arr.length - 1 && <span className="text-muted-foreground/30 text-[8px]">›</span>}
                                </Fragment>
                              ))}
                            </div>
                          )}

                          {/* AI Insight */}
                          {item.aiInsight && (
                            <div className="mt-1.5 flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                              <SparklesIcon className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                              <span className="text-[9px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
                                {item.aiInsight}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {stageItems.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">Empty</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && activeTab !== 'metrics' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    {lifecycleTab === 'exceptions' ? 'Problem' : 'Supplier'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">AI Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    {lifecycleTab === 'purchase-orders' ? 'Items' : 'Lines'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((item: any) => (
                  <tr
                    key={item.id}
                    onClick={() => onNavigateToDetail(lifecycleTab === 'purchase-orders' ? 'order-detail' : 'ack-detail')}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{item.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.problem || item.supplier || item.vendor}
                      {item.severity && (
                        <span className={cn("ml-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full", severityColors[item.severity])}>
                          {item.severity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[item.status] || 'bg-muted text-muted-foreground')}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.confidence > 0 && (
                          <span className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-bold shrink-0",
                            item.confidence >= 90 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : item.confidence >= 70 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          )}>
                            {item.confidence}%
                          </span>
                        )}
                        {item.aiInsight && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{item.aiInsight}</span>
                        )}
                        {!item.confidence && !item.aiInsight && (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.items || item.lines}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Metrics View */}
        {activeTab === 'metrics' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Volume', value: counts.all, sub: 'items in pipeline' },
                { label: 'Active', value: counts.active, sub: 'in progress' },
                { label: 'Completed', value: counts.completed, sub: 'resolved' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-3xl font-bold text-foreground">{m.value}</p>
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Batch ACK Modal */}
      <BatchAckModal
        isOpen={isBatchAckOpen}
        onClose={() => setIsBatchAckOpen(false)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useTenant } from './TenantContext'
import { useDemo } from './context/DemoContext'
import {
  EnvelopeIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ClockIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import Breadcrumbs from './components/Breadcrumbs'
import MACPunchList from './components/MACPunchList'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface ServiceCenterProps {
  onLogout: () => void
  onNavigateToDetail: () => void
  onNavigateToWorkspace: () => void
  onNavigate: (page: string) => void
}

// --- Communications Mock Data ---
const communications = [
  { id: 'DRAFT-001', subject: 'Qty Discrepancy — PO-2026-091', recipient: 'City Builders', status: 'AI Draft', linkedPo: 'PO-2026-091', date: 'Jan 15, 2026' },
  { id: 'DRAFT-002', subject: 'Ship Date Confirmation — PO-2026-085', recipient: 'Valley Homes', status: 'Review', linkedPo: 'PO-2026-085', date: 'Jan 14, 2026' },
  { id: 'DRAFT-003', subject: 'ACK Revision Request — ACK-8840', recipient: 'City Builders', status: 'Scheduled', linkedPo: 'ACK-8840', date: 'Jan 13, 2026' },
  { id: 'DRAFT-004', subject: 'Exception Resolved — EXC-005', recipient: 'Apex Tech', status: 'Sent', linkedPo: 'EXC-005', date: 'Jan 12, 2026' },
  { id: 'DRAFT-005', subject: 'Warranty Claim Update — ISS-1023', recipient: 'Coastal Props', status: 'Sent', linkedPo: 'ISS-1023', date: 'Jan 10, 2026' },
]

// --- Issues Mock Data ---
const issues = [
  { id: 'ISS-1025', title: 'Freight damage — 3 units', reporter: 'City Builders', category: 'Freight Damage', priority: 'high', status: 'Reported', date: 'Jan 15, 2026' },
  { id: 'ISS-1024', title: 'Wrong item shipped — Line 12', reporter: 'TechDealer Solutions', category: 'Wrong Item', priority: 'high', status: 'AI Validated', date: 'Jan 14, 2026' },
  { id: 'ISS-1023', title: 'Missing parts — hardware kit', reporter: 'Coastal Props', category: 'Missing Parts', priority: 'medium', status: 'In Repair', date: 'Jan 12, 2026' },
  { id: 'ISS-1022', title: 'Manufacturing defect — surface', reporter: 'Urban Living Inc.', category: 'Manufacturing Defect', priority: 'low', status: 'Fixed', date: 'Jan 10, 2026' },
]

const commStatusColors: Record<string, string> = {
  'AI Draft': 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Review': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'Scheduled': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Sent': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'Failed': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

const issueStatusColors: Record<string, string> = {
  'Reported': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
  'AI Validated': 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Verified': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'In Repair': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'Fixed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'Shipped': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  'Closed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300',
}

export default function ServiceCenter({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: ServiceCenterProps) {
  const { currentTenant } = useTenant()
  const { currentStep } = useDemo()
  const [activeTab, setActiveTab] = useState<'communications' | 'issues' | 'settings'>('communications')
  const [highlightedTab, setHighlightedTab] = useState<string | null>(null)

  // Auto-select tab from demo context
  useEffect(() => {
    if (['3.1', '3.2', '3.3', '3.4'].includes(currentStep?.id)) {
      setActiveTab('issues')
    }
  }, [currentStep?.id])

  useEffect(() => {
    const handleHighlight = (e: CustomEvent) => {
      if (e.detail === 'mac-punch-list') {
        setActiveTab('issues')
        setHighlightedTab('issues')
        setTimeout(() => setHighlightedTab(null), 4000)
      }
    }
    window.addEventListener('demo-highlight', handleHighlight as EventListener)
    return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener)
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-10">
      <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Command Center', onClick: () => onNavigate('command-center') },
          { label: 'Service Center' },
        ]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
              {currentTenant} Service Center
            </h1>
            <p className="text-muted-foreground mt-1">Communications, issues, and configuration management.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 dark:bg-zinc-800/50 p-1 rounded-lg w-fit overflow-x-auto max-w-full border border-zinc-200 dark:border-zinc-800">
          {[
            { id: 'communications' as const, label: 'Communications', count: communications.length, icon: EnvelopeIcon },
            { id: 'issues' as const, label: 'Issues', count: issues.length, icon: ExclamationTriangleIcon },
            { id: 'settings' as const, label: 'Settings', count: null, icon: Cog6ToothIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-sm border border-border"
                  : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white border border-transparent",
                highlightedTab === tab.id && "ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                  activeTab === tab.id
                    ? "bg-brand-500/20 text-brand-700 dark:text-brand-300"
                    : "bg-muted text-muted-foreground font-medium"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">

          {/* ==================== COMMUNICATIONS TAB ==================== */}
          {activeTab === 'communications' && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Recipient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Linked</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {communications.map(comm => (
                    <tr key={comm.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{comm.id}</td>
                      <td className="px-4 py-3 text-foreground">{comm.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground">{comm.recipient}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", commStatusColors[comm.status] || 'bg-muted text-muted-foreground')}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{comm.linkedPo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{comm.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==================== ISSUES TAB ==================== */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              {/* Issue List */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Issue</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Reporter</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {issues.map(issue => (
                      <tr key={issue.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{issue.id}</td>
                        <td className="px-4 py-3 text-foreground">{issue.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{issue.reporter}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{issue.category}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full", priorityColors[issue.priority])}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", issueStatusColors[issue.status] || 'bg-muted text-muted-foreground')}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{issue.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Punch List (reused from MAC) — for demo compatibility */}
              <MACPunchList />
            </div>
          )}

          {/* ==================== SETTINGS TAB ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Channel Configuration */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Channel Configuration</h2>
                  <p className="text-sm text-muted-foreground">Configure how you receive and send documents per supplier.</p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { supplier: 'Herman Miller', channel: 'EDI 850/855', status: 'Active' },
                    { supplier: 'Steelcase', channel: 'API / Web Service', status: 'Active' },
                    { supplier: 'Knoll', channel: 'Email / Manual', status: 'Active' },
                    { supplier: 'Haworth', channel: 'EDI 850/855', status: 'Pending Setup' },
                  ].map((config, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">{config.supplier}</p>
                        <p className="text-xs text-muted-foreground">{config.channel}</p>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        config.status === 'Active' ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      )}>
                        {config.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Rules */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Comparison & Auto-Accept Rules</h2>
                  <p className="text-sm text-muted-foreground">Define thresholds for automatic acceptance vs. manual review.</p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { rule: 'Price Tolerance', value: '±2%', description: 'Auto-accept if price difference is within this range' },
                    { rule: 'Qty Tolerance', value: 'Exact Match', description: 'Any quantity mismatch creates an exception' },
                    { rule: 'Ship Date Tolerance', value: '±5 days', description: 'Auto-accept if ship date is within range' },
                    { rule: 'Part Number Match', value: 'Fuzzy (95%)', description: 'AI-assisted matching with 95% confidence threshold' },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">{rule.rule}</p>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                      <span className="text-sm font-mono font-medium text-foreground bg-muted px-3 py-1 rounded-lg">
                        {rule.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Exception Alerts', description: 'Notify immediately on new exceptions', enabled: true },
                    { label: 'ACK Reminders', description: 'Daily digest of pending acknowledgements', enabled: true },
                    { label: 'Auto-Accept Summary', description: 'Weekly summary of auto-accepted items', enabled: false },
                    { label: 'Supplier Performance', description: 'Monthly scorecard reports', enabled: true },
                  ].map((pref, i) => (
                    <label key={i} className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-brand-300/10 dark:hover:bg-brand-600/10 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{pref.label}</p>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={pref.enabled}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

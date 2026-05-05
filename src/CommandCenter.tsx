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
  ChevronDownIcon,
  EyeIcon,
  ArrowDownTrayIcon,
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

// --- KPI Data by Period ---
type CCPeriod = 'Day' | 'Week' | 'Month' | 'Quarter';

const kpiDataByPeriod: Record<CCPeriod, { label: string; value: string; sub: string; icon: typeof ClockIcon; color: string }[]> = {
  Day: [
    { label: 'Pending ACKs', value: '4', sub: 'Today', icon: ClockIcon, color: 'orange' },
    { label: 'Open Exceptions', value: '2', sub: 'Today', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Auto-Accept Rate', value: '88%', sub: 'Today', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Response Time', value: '0.8d', sub: 'Today avg', icon: ArrowTrendingUpIcon, color: 'blue' },
    { label: 'Active POs', value: '12', sub: 'Today', icon: CubeIcon, color: 'indigo' },
  ],
  Week: [
    { label: 'Pending ACKs', value: '11', sub: 'This week', icon: ClockIcon, color: 'orange' },
    { label: 'Open Exceptions', value: '4', sub: 'This week', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Auto-Accept Rate', value: '85%', sub: 'Last 7 days', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Response Time', value: '1.0d', sub: 'Weekly avg', icon: ArrowTrendingUpIcon, color: 'blue' },
    { label: 'Active POs', value: '45', sub: 'This week', icon: CubeIcon, color: 'indigo' },
  ],
  Month: [
    { label: 'Pending ACKs', value: '23', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
    { label: 'Open Exceptions', value: '7', sub: 'Need resolution', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Auto-Accept Rate', value: '82%', sub: 'Last 30 days', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Response Time', value: '1.2d', sub: 'Days to acknowledge', icon: ArrowTrendingUpIcon, color: 'blue' },
    { label: 'Active POs', value: '156', sub: 'In pipeline', icon: CubeIcon, color: 'indigo' },
  ],
  Quarter: [
    { label: 'Pending ACKs', value: '42', sub: 'This quarter', icon: ClockIcon, color: 'orange' },
    { label: 'Open Exceptions', value: '15', sub: 'This quarter', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Auto-Accept Rate', value: '79%', sub: 'Last 90 days', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Response Time', value: '1.4d', sub: 'Quarterly avg', icon: ArrowTrendingUpIcon, color: 'blue' },
    { label: 'Active POs', value: '312', sub: 'This quarter', icon: CubeIcon, color: 'indigo' },
  ],
};

// Performance Overview metrics by period
const perfOverviewByPeriod: Record<CCPeriod, { label: string; value: number; target: string; color: string }[]> = {
  Day: [
    { label: 'Acknowledgement Turnaround', value: 92, target: '< 2 days', color: 'bg-green-500' },
    { label: 'Exception Resolution', value: 80, target: '< 4 hours', color: 'bg-green-500' },
    { label: 'On-Time Shipping', value: 96, target: '> 95%', color: 'bg-green-500' },
    { label: 'AI Auto-Accept', value: 88, target: '> 80%', color: 'bg-green-500' },
    { label: 'Clean Match Rate', value: 95, target: '> 90%', color: 'bg-green-500' },
  ],
  Week: [
    { label: 'Acknowledgement Turnaround', value: 88, target: '< 2 days', color: 'bg-green-500' },
    { label: 'Exception Resolution', value: 76, target: '< 4 hours', color: 'bg-amber-500' },
    { label: 'On-Time Shipping', value: 95, target: '> 95%', color: 'bg-green-500' },
    { label: 'AI Auto-Accept', value: 85, target: '> 80%', color: 'bg-green-500' },
    { label: 'Clean Match Rate', value: 93, target: '> 90%', color: 'bg-green-500' },
  ],
  Month: [
    { label: 'Acknowledgement Turnaround', value: 85, target: '< 2 days', color: 'bg-green-500' },
    { label: 'Exception Resolution', value: 72, target: '< 4 hours', color: 'bg-amber-500' },
    { label: 'On-Time Shipping', value: 94, target: '> 95%', color: 'bg-blue-500' },
    { label: 'AI Auto-Accept', value: 82, target: '> 80%', color: 'bg-indigo-500' },
    { label: 'Clean Match Rate', value: 91, target: '> 90%', color: 'bg-green-500' },
  ],
  Quarter: [
    { label: 'Acknowledgement Turnaround', value: 82, target: '< 2 days', color: 'bg-amber-500' },
    { label: 'Exception Resolution', value: 68, target: '< 4 hours', color: 'bg-red-500' },
    { label: 'On-Time Shipping', value: 92, target: '> 95%', color: 'bg-amber-500' },
    { label: 'AI Auto-Accept', value: 79, target: '> 80%', color: 'bg-amber-500' },
    { label: 'Clean Match Rate', value: 89, target: '> 90%', color: 'bg-amber-500' },
  ],
};

// Chart data by period for Command Center charts
const ccPoVolumeByPeriod: Record<CCPeriod, { points: string; fillPoints: string; labels: string[]; total: string; trend: string }> = {
  Day: { points: '0,70 33,55 67,62 100,42 133,48 167,35 200,28', fillPoints: '0,70 33,55 67,62 100,42 133,48 167,35 200,28 200,100 0,100', labels: ['8AM','10AM','12PM','2PM','4PM','6PM',''], total: '48', trend: '+8% ↑' },
  Week: { points: '0,65 40,50 80,58 120,38 160,32 200,25', fillPoints: '0,65 40,50 80,58 120,38 160,32 200,25 200,100 0,100', labels: ['Mon','Tue','Wed','Thu','Fri',''], total: '128', trend: '+15% ↑' },
  Month: { points: '0,82 25,70 50,74 75,55 100,60 125,40 150,45 175,30 200,24', fillPoints: '0,82 25,70 50,74 75,55 100,60 125,40 150,45 175,30 200,24 200,100 0,100', labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9'], total: '342', trend: '+12% ↑' },
  Quarter: { points: '0,60 50,45 100,50 150,32 200,20', fillPoints: '0,60 50,45 100,50 150,32 200,20 200,100 0,100', labels: ['Q1','Q2','Q3','Q4',''], total: '1,245', trend: '+22% ↑' },
};

const ccAckTurnaroundByPeriod: Record<CCPeriod, { bars: { label: string; h: number }[]; avg: string; trend: string }> = {
  Day: { bars: [{ label: '8AM', h: 48 },{ label: '10AM', h: 75 },{ label: '12PM', h: 55 },{ label: '2PM', h: 82 },{ label: '4PM', h: 38 },{ label: '6PM', h: 25 }], avg: '0.8d', trend: '-15% ↓' },
  Week: { bars: [{ label: 'Mon', h: 60 },{ label: 'Tue', h: 78 },{ label: 'Wed', h: 48 },{ label: 'Thu', h: 65 },{ label: 'Fri', h: 40 }], avg: '1.0d', trend: '-10% ↓' },
  Month: { bars: [{ label: 'Mon', h: 65 },{ label: 'Tue', h: 82 },{ label: 'Wed', h: 45 },{ label: 'Thu', h: 70 },{ label: 'Fri', h: 38 },{ label: 'Sat', h: 22 }], avg: '1.2d', trend: '-8% ↓' },
  Quarter: { bars: [{ label: 'Jan', h: 72 },{ label: 'Feb', h: 65 },{ label: 'Mar', h: 58 },{ label: 'Apr', h: 50 },{ label: 'May', h: 45 },{ label: 'Jun', h: 40 }], avg: '1.4d', trend: '-5% ↓' },
};

const ccExcRateByPeriod: Record<CCPeriod, { points: string; dotPoints: { x: number; y: number }[]; labels: string[]; rate: string; trend: string }> = {
  Day: { points: '0,38 33,30 67,42 100,28 133,35 167,40 200,32', dotPoints: [{x:0,y:38},{x:33,y:30},{x:67,y:42},{x:100,y:28},{x:133,y:35},{x:167,y:40},{x:200,y:32}], labels: ['8AM','10AM','12PM','2PM','4PM','6PM',''], rate: '3.8%', trend: '-0.4% ↓' },
  Week: { points: '0,30 40,38 80,28 120,40 160,32 200,42', dotPoints: [{x:0,y:30},{x:40,y:38},{x:80,y:28},{x:120,y:40},{x:160,y:32},{x:200,y:42}], labels: ['Mon','Tue','Wed','Thu','Fri',''], rate: '4.0%', trend: '-1.2% ↓' },
  Month: { points: '0,20 28,35 57,28 85,42 114,35 142,48 171,42 200,55', dotPoints: [{x:0,y:20},{x:28,y:35},{x:57,y:28},{x:85,y:42},{x:114,y:35},{x:142,y:48},{x:171,y:42},{x:200,y:55}], labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], rate: '4.2%', trend: '-1.8% ↓' },
  Quarter: { points: '0,48 50,40 100,35 150,28 200,22', dotPoints: [{x:0,y:48},{x:50,y:40},{x:100,y:35},{x:150,y:28},{x:200,y:22}], labels: ['Q1','Q2','Q3','Q4',''], rate: '3.5%', trend: '-3.0% ↓' },
};

const ccAutoAcceptByPeriod: Record<CCPeriod, { pct: number; dashPct: string; trend: string }> = {
  Day: { pct: 88, dashPct: '138.2', trend: '+8% ↑ vs yesterday' },
  Week: { pct: 85, dashPct: '133.5', trend: '+6% ↑ vs last week' },
  Month: { pct: 82, dashPct: '128.8', trend: '+5% ↑ vs last month' },
  Quarter: { pct: 79, dashPct: '124.1', trend: '+3% ↑ vs last quarter' },
};

const ccResolutionByPeriod: Record<CCPeriod, { bars: { label: string; value: number; hours: string }[]; avg: string; trend: string }> = {
  Day: { bars: [{ label: 'Qty Mismatch', value: 90, hours: '3.8h' },{ label: 'Price Disc.', value: 68, hours: '3.2h' },{ label: 'Ship Date', value: 42, hours: '2.0h' },{ label: 'Substitution', value: 55, hours: '2.8h' },{ label: 'Missing Info', value: 28, hours: '1.2h' }], avg: '2.8h', trend: '-0.6h ↓' },
  Week: { bars: [{ label: 'Qty Mismatch', value: 88, hours: '4.0h' },{ label: 'Price Disc.', value: 72, hours: '3.4h' },{ label: 'Ship Date', value: 44, hours: '2.1h' },{ label: 'Substitution', value: 58, hours: '2.9h' },{ label: 'Missing Info', value: 30, hours: '1.4h' }], avg: '3.0h', trend: '-0.4h ↓' },
  Month: { bars: [{ label: 'Qty Mismatch', value: 85, hours: '4.2h' },{ label: 'Price Disc.', value: 70, hours: '3.5h' },{ label: 'Ship Date', value: 45, hours: '2.2h' },{ label: 'Substitution', value: 60, hours: '3.0h' },{ label: 'Missing Info', value: 30, hours: '1.5h' }], avg: '3.4h', trend: '+0.2h ↑' },
  Quarter: { bars: [{ label: 'Qty Mismatch', value: 82, hours: '4.5h' },{ label: 'Price Disc.', value: 68, hours: '3.8h' },{ label: 'Ship Date', value: 48, hours: '2.4h' },{ label: 'Substitution', value: 62, hours: '3.2h' },{ label: 'Missing Info', value: 32, hours: '1.6h' }], avg: '3.8h', trend: '+0.4h ↑' },
};

const ccOnTimeByPeriod: Record<CCPeriod, { points: string; fillPoints: string; labels: string[]; pct: string; trend: string }> = {
  Day: { points: '0,18 33,12 67,22 100,10 133,15 167,8 200,10', fillPoints: '0,18 33,12 67,22 100,10 133,15 167,8 200,10 200,100 0,100', labels: ['8AM','10AM','12PM','2PM','4PM','6PM',''], pct: '96%', trend: 'target: 95%' },
  Week: { points: '0,22 40,15 80,25 120,12 160,18 200,10', fillPoints: '0,22 40,15 80,25 120,12 160,18 200,10 200,100 0,100', labels: ['Mon','Tue','Wed','Thu','Fri',''], pct: '95%', trend: 'target: 95%' },
  Month: { points: '0,25 28,20 57,30 85,18 114,22 142,12 171,18 200,15', fillPoints: '0,25 28,20 57,30 85,18 114,22 142,12 171,18 200,15 200,100 0,100', labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], pct: '94%', trend: 'target: 95%' },
  Quarter: { points: '0,30 50,22 100,28 150,18 200,12', fillPoints: '0,30 50,22 100,28 150,18 200,12 200,100 0,100', labels: ['Q1','Q2','Q3','Q4',''], pct: '92%', trend: 'target: 95%' },
};

// --- Urgent Actions ---
const urgentActions = [
  {
    id: 1, severity: 'critical', title: '3 ACKs pending >48h', description: 'Herman Miller, Steelcase, Knoll — exceeding SLA threshold', action: 'Review ACKs',
    details: {
      fields: [
        { label: 'DEALERS', value: 'Herman Miller, Steelcase, Knoll' },
        { label: 'SLA THRESHOLD', value: '24 hours (exceeded by 24h+)' },
        { label: 'OLDEST ACK', value: 'ACK-8835 — 52 hours pending' },
        { label: 'TOTAL ORDER VALUE', value: '$67,200.00 at risk' },
      ],
      items: [
        { name: 'Herman Miller — ACK-8835', status: '52h pending', severity: 'critical' as const },
        { name: 'Steelcase — ACK-8838', status: '49h pending', severity: 'critical' as const },
        { name: 'Knoll — ACK-8840', status: '36h pending', severity: 'high' as const },
      ],
    },
    aiSuggestion: 'These 3 ACKs have 95%+ match confidence. Auto-accepting would clear the backlog and restore SLA compliance within minutes.',
  },
  {
    id: 2, severity: 'high', title: 'Exception rate spike on Supplier XYZ', description: '12% exception rate (vs 4% avg) — 5 new discrepancies today', action: 'View Exceptions',
    details: {
      fields: [
        { label: 'DEALER', value: 'Supplier XYZ (Coastal Props)' },
        { label: 'CURRENT RATE', value: '12.4% (3× above average)' },
        { label: 'NEW EXCEPTIONS', value: '5 today (price & qty)' },
        { label: 'ROOT CAUSE', value: 'Outdated price list (Q4 2025)' },
      ],
    },
    aiSuggestion: 'Pattern detected: 85% of exceptions are price-related. Sending updated Q1 2026 price list to this dealer would eliminate most discrepancies.',
  },
  {
    id: 3, severity: 'medium', title: '5 POs missing ship dates', description: 'Orders from last week still awaiting confirmed ship dates', action: 'View POs',
    details: {
      fields: [
        { label: 'AFFECTED POs', value: 'PO-2026-082 through PO-2026-086' },
        { label: 'DEALER', value: 'Multiple (3 dealers)' },
        { label: 'DAYS OVERDUE', value: '3-5 business days' },
        { label: 'COMBINED VALUE', value: '$42,100.00' },
      ],
    },
  },
  {
    id: 4, severity: 'low', title: 'Quarterly supplier review due', description: 'Performance scorecards ready for top 10 suppliers', action: 'View Report',
    details: {
      fields: [
        { label: 'REVIEW PERIOD', value: 'Q1 2026 (Jan–Mar)' },
        { label: 'SUPPLIERS', value: '10 top-volume suppliers' },
        { label: 'METRICS TRACKED', value: 'On-time, exception rate, quality' },
        { label: 'DUE DATE', value: 'March 15, 2026' },
      ],
    },
  },
]

// --- Recent Activity ---
const recentActivity = [
  {
    id: 1, action: 'Acknowledgement auto-accepted', detail: 'PO-2026-089 — Herman Miller — all lines matched', time: '2 min ago', type: 'success',
    icon: CheckCircleIcon,
    meta: 'AI confidence: 98.5% — all 12 line items matched within tolerance',
    actions: [
      { label: 'View ACK', icon: EyeIcon, primary: true },
      { label: 'Download PDF', icon: ArrowDownTrayIcon, primary: false },
    ],
    details: {
      fields: [
        { label: 'PO NUMBER', value: 'PO-2026-089' },
        { label: 'DEALER', value: 'Herman Miller Direct' },
        { label: 'LINE ITEMS', value: '12 of 12 matched' },
        { label: 'ORDER VALUE', value: '$18,450.00' },
      ],
      timeline: [
        { step: 'PO Received', date: 'Mar 9', done: true },
        { step: 'AI Parsed', date: 'Mar 9', done: true },
        { step: 'Auto-Accepted', date: 'Mar 11', done: true },
        { step: 'ACK Sent', date: 'Mar 11', done: true },
      ],
    },
  },
  {
    id: 2, action: 'Exception created', detail: 'PO-2026-091 — Qty mismatch on 3 lines', time: '15 min ago', type: 'warning',
    icon: ExclamationTriangleIcon,
    meta: 'Requires manual review — quantities exceed production batch sizes',
    actions: [
      { label: 'Review Exception', icon: EyeIcon, primary: true },
      { label: 'Escalate', icon: ArrowRightIcon, primary: false },
    ],
    details: {
      fields: [
        { label: 'PO NUMBER', value: 'PO-2026-091' },
        { label: 'DEALER', value: 'Office Images Inc.' },
        { label: 'EXCEPTION TYPE', value: 'Quantity Mismatch' },
        { label: 'AFFECTED LINES', value: '3 of 18' },
      ],
      discrepancies: [
        { field: 'Task Chair x50', expected: '50 units', actual: '48 units', diff: '-2' },
        { field: 'Desk Frame x30', expected: '30 units', actual: '28 units', diff: '-2' },
        { field: 'Monitor Arm x25', expected: '25 units', actual: '20 units', diff: '-5' },
      ],
    },
  },
  {
    id: 3, action: 'Delta engine completed', detail: 'ACK-8842 — 2 auto-corrections, 1 escalated', time: '32 min ago', type: 'info',
    icon: BoltIcon,
    aiSuggestion: 'The escalated line has a price variance of 4.2% — within historical tolerance for this dealer. Consider auto-approving future variances under 5%.',
    actions: [
      { label: 'View Delta Report', icon: EyeIcon, primary: true },
    ],
    details: {
      fields: [
        { label: 'ACK NUMBER', value: 'ACK-8842' },
        { label: 'DEALER', value: 'Steelcase Distribution' },
        { label: 'AUTO-CORRECTED', value: '2 lines (ship date, packaging)' },
        { label: 'ESCALATED', value: '1 line (price variance 4.2%)' },
      ],
    },
  },
  {
    id: 4, action: 'PO received', detail: 'PO-2026-095 from Acme Corp — 45 line items', time: '1h ago', type: 'info',
    icon: DocumentTextIcon,
    actions: [
      { label: 'View PO', icon: EyeIcon, primary: true },
      { label: 'Download PDF', icon: ArrowDownTrayIcon, primary: false },
    ],
    details: {
      fields: [
        { label: 'PO NUMBER', value: 'PO-2026-095' },
        { label: 'DEALER', value: 'Acme Corp' },
        { label: 'LINE ITEMS', value: '45' },
        { label: 'ESTIMATED VALUE', value: '$32,800.00' },
      ],
    },
  },
  {
    id: 5, action: 'Claim submitted', detail: 'Issue #1023 — freight damage — carrier liability 70%', time: '2h ago', type: 'success',
    icon: ClipboardDocumentCheckIcon,
    meta: 'Carrier acknowledged liability — reimbursement expected within 5 business days',
    actions: [
      { label: 'View Claim', icon: EyeIcon, primary: true },
    ],
    details: {
      fields: [
        { label: 'CLAIM ID', value: 'Issue #1023' },
        { label: 'TYPE', value: 'Freight Damage' },
        { label: 'CARRIER', value: 'FastFreight Logistics' },
        { label: 'LIABILITY', value: '70% carrier / 30% insurance' },
      ],
      trackingSteps: [
        { location: 'Damage reported by dealer', date: 'Mar 8', status: 'done' as const },
        { location: 'Photos & documentation submitted', date: 'Mar 9', status: 'done' as const },
        { location: 'Carrier acknowledged claim', date: 'Mar 10', status: 'current' as const },
        { location: 'Reimbursement pending', date: 'Mar 15 (est)', status: 'pending' as const },
      ],
    },
  },
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
    details: {
      fields: [
        { label: 'DEALER', value: 'TechDealer Solutions' },
        { label: 'POs', value: '#PO-2026-092, #PO-2026-093, #PO-2026-094' },
        { label: 'SKU OVERLAP', value: '80% (36 of 45 items)' },
        { label: 'TIME SAVED', value: '2.5 hours validation' },
      ],
      reasoning: 'All 3 POs reference the same product family (ErgoSeries) and share common BOM components. Batch validation can apply shared pricing rules, availability checks, and shipping calculations simultaneously instead of processing each PO individually.',
      confidence: 96,
    },
  },
  {
    id: 2,
    title: 'Supplier Exception Pattern',
    description: 'Coastal Props has 3× average exception rate this month. Root cause: outdated price list.',
    impact: 'Reduce errors',
    icon: ExclamationTriangleIcon,
    type: 'action',
    details: {
      fields: [
        { label: 'DEALER', value: 'Coastal Props & Furniture' },
        { label: 'EXCEPTION RATE', value: '12.4% (vs 4.1% avg)' },
        { label: 'ROOT CAUSE', value: 'Outdated price list (Q4 2025)' },
        { label: 'AFFECTED POs', value: '7 POs this month' },
      ],
      reasoning: 'Price discrepancies account for 85% of exceptions from this dealer. Their current catalog references Q4 2025 pricing. Sending an updated price list would eliminate most exceptions and reduce manual review workload by approximately 3 hours per week.',
      confidence: 91,
    },
  },
  {
    id: 3,
    title: 'Raise Auto-Accept Threshold',
    description: 'Lowering confidence threshold from 90% to 85% would auto-process 12 more ACKs/week with <1% error risk.',
    impact: '+15% automation',
    icon: SparklesIcon,
    type: 'opportunity',
    details: {
      fields: [
        { label: 'CURRENT THRESHOLD', value: '90% confidence' },
        { label: 'PROPOSED THRESHOLD', value: '85% confidence' },
        { label: 'ADDITIONAL AUTO-ACCEPTS', value: '12 ACKs/week' },
        { label: 'ERROR RISK', value: '<1% (0.7% estimated)' },
      ],
      reasoning: 'Analysis of 500 ACKs in the 85-90% confidence band shows only 0.7% required corrections after auto-acceptance. The time saved (4.8 hours/week) significantly outweighs the minimal error risk. Recommendation based on 90-day historical data with 99.3% accuracy in this range.',
      confidence: 88,
    },
  },
  {
    id: 4,
    title: 'Consolidate Shipments',
    description: 'Combine 3 pending orders for Urban Living to save 12% on freight costs.',
    impact: 'Save $1,800',
    icon: TruckIcon,
    type: 'savings',
    details: {
      fields: [
        { label: 'DEALER', value: 'Urban Living Interiors' },
        { label: 'ORDERS', value: '#OR-4510, #OR-4511, #OR-4515' },
        { label: 'CURRENT FREIGHT', value: '$15,000 (3 separate)' },
        { label: 'CONSOLIDATED', value: '$13,200 (1 combined)' },
      ],
      reasoning: 'All 3 orders ship to the same distribution center in Chicago, IL. Combining shipments fills a single full-truckload (FTL) at 94% capacity, which is more cost-effective than 3 partial loads. Delivery dates are within a 3-day window, making consolidation feasible without impacting SLAs.',
      confidence: 94,
    },
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
  const [ccPeriod, setCcPeriod] = useState<CCPeriod>('Month')
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures)
  const [isFeatureManagerOpen, setIsFeatureManagerOpen] = useState(false)
  const [expandedUrgent, setExpandedUrgent] = useState<Set<number>>(new Set([1]))
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null)
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<number | null>(null)
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
                      className={cn("overflow-hidden rounded-xl border cursor-pointer transition-all duration-300",
                        expandedUrgent.has(action.id)
                          ? (action.severity === 'critical' ? "border-red-300 dark:border-red-500/30 bg-red-50/30 dark:bg-red-500/5 shadow-sm" :
                             action.severity === 'high' ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/5 shadow-sm" :
                             "border-zinc-400 bg-muted/30 shadow-sm")
                          : (action.severity === 'critical' ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 hover:border-red-300 dark:hover:border-red-500/30" :
                             action.severity === 'high' ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 hover:border-amber-300 dark:hover:border-amber-500/30" :
                             "border-border bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-primary/30")
                      )}
                      onClick={() => setExpandedUrgent(prev => {
                        const next = new Set(prev)
                        next.has(action.id) ? next.delete(action.id) : next.add(action.id)
                        return next
                      })}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0", severityColors[action.severity])}>
                          {action.severity}
                        </span>
                        <span className="text-sm font-medium text-foreground flex-1">{action.title}</span>
                        <button onClick={(e) => e.stopPropagation()} className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shrink-0">
                          {action.action}
                        </button>
                        <ChevronDownIcon className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0",
                          expandedUrgent.has(action.id) ? 'rotate-180' : ''
                        )} />
                      </div>
                      {/* Expandable Details */}
                      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden",
                        expandedUrgent.has(action.id) ? 'max-h-[500px] opacity-100 border-t border-border/50' : 'max-h-0 opacity-0'
                      )}>
                        <div className="p-4 bg-muted/20 space-y-3">
                          <p className="text-xs text-muted-foreground pl-2 border-l-2 border-border">{action.description}</p>
                          {action.details?.fields && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {action.details.fields.map((f, idx) => (
                                <div key={idx}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</p>
                                  <p className="text-xs font-medium text-foreground">{f.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {action.details?.items && (
                            <div className="rounded-lg border border-border bg-card/50 p-2.5 space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Affected Items</p>
                              {action.details.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-foreground">{item.name}</span>
                                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                                    item.severity === 'critical' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                                    'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                  )}>{item.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {action.aiSuggestion && (
                            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 p-3">
                              <div className="flex items-start gap-3">
                                <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">AI Insight</p>
                                  <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">{action.aiSuggestion}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2 shrink-0">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
                </div>
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
                  {recentActivity.map(item => (
                    <div
                      key={item.id}
                      className={cn("group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer",
                        expandedActivityId === item.id
                          ? 'bg-muted/30 border-zinc-400 shadow-sm'
                          : 'bg-secondary border-border hover:border-zinc-400 hover:bg-muted/10'
                      )}
                      onClick={() => setExpandedActivityId(expandedActivityId === item.id ? null : item.id)}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activityTypeColors[item.type])} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{item.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mr-1">{item.time}</span>
                        <ChevronDownIcon className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0",
                          expandedActivityId === item.id ? 'rotate-180' : ''
                        )} />
                      </div>
                      {/* Expandable Details */}
                      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden",
                        expandedActivityId === item.id ? 'max-h-[500px] opacity-100 border-t border-border/50' : 'max-h-0 opacity-0'
                      )}>
                        <div className="p-4 bg-muted/20 space-y-3">
                          {item.meta && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2 pl-2 border-l-2 border-border">
                              {item.meta}
                            </div>
                          )}
                          {item.details?.fields && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {item.details.fields.map((f, idx) => (
                                <div key={idx}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</p>
                                  <p className="text-xs font-medium text-foreground">{f.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.details?.timeline && (
                            <div className="flex items-center gap-0 mt-1">
                              {item.details.timeline.map((step, idx) => (
                                <div key={idx} className="flex items-center">
                                  <div className="flex flex-col items-center">
                                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold",
                                      step.done ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground'
                                    )}>
                                      {step.done ? '✓' : idx + 1}
                                    </div>
                                    <p className="text-[9px] font-medium text-foreground mt-0.5 whitespace-nowrap">{step.step}</p>
                                    <p className="text-[9px] text-muted-foreground">{step.date}</p>
                                  </div>
                                  {idx < item.details.timeline!.length - 1 && (
                                    <div className={cn("w-8 h-0.5 mx-0.5 mt-[-18px]", step.done ? 'bg-green-400' : 'bg-zinc-200 dark:bg-zinc-700')} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.details?.discrepancies && (
                            <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10 p-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">Discrepancies Found</p>
                              <div className="space-y-1.5">
                                {item.details.discrepancies.map((d, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">{d.field}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-muted-foreground">Expected: {d.expected}</span>
                                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Actual: {d.actual}</span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">{d.diff}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.details?.trackingSteps && (
                            <div className="space-y-0">
                              {item.details.trackingSteps.map((ts, idx) => (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <div className="flex flex-col items-center">
                                    <div className={cn("w-2.5 h-2.5 rounded-full mt-0.5",
                                      ts.status === 'done' ? 'bg-green-500' :
                                      ts.status === 'current' ? 'bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-500/30' :
                                      'bg-zinc-300 dark:bg-zinc-600'
                                    )} />
                                    {idx < item.details.trackingSteps!.length - 1 && (
                                      <div className={cn("w-0.5 h-5", ts.status === 'done' ? 'bg-green-300 dark:bg-green-700' : 'bg-zinc-200 dark:bg-zinc-700')} />
                                    )}
                                  </div>
                                  <div className="pb-2">
                                    <p className={cn("text-xs font-medium",
                                      ts.status === 'current' ? 'text-amber-600 dark:text-amber-400' :
                                      ts.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                                    )}>{ts.location}</p>
                                    <p className="text-[10px] text-muted-foreground">{ts.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.aiSuggestion && (
                            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 p-3">
                              <div className="flex items-start gap-3">
                                <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">AI Insight</p>
                                  <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">{item.aiSuggestion}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {item.actions && item.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                              {item.actions.map((action, idx) => (
                                <button key={idx} onClick={(e) => e.stopPropagation()} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border",
                                  action.primary
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent hover:bg-zinc-700 dark:hover:bg-zinc-200'
                                    : 'bg-white dark:bg-transparent text-foreground border-border hover:bg-muted'
                                )}>
                                  <action.icon className="w-3.5 h-3.5" />
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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
                    <div
                      key={suggestion.id}
                      className={cn("group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer",
                        expandedSuggestionId === suggestion.id
                          ? 'bg-muted/30 border-indigo-300 dark:border-indigo-500/30 shadow-sm'
                          : 'bg-secondary border-border hover:border-indigo-200 dark:hover:border-indigo-900/50'
                      )}
                      onClick={() => setExpandedSuggestionId(expandedSuggestionId === suggestion.id ? null : suggestion.id)}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 border border-zinc-100 dark:border-zinc-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <suggestion.icon className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{suggestion.title}</h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {suggestion.impact}
                              </span>
                              <ChevronDownIcon className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300",
                                expandedSuggestionId === suggestion.id ? 'rotate-180' : ''
                              )} />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                      {/* Expandable Details */}
                      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden",
                        expandedSuggestionId === suggestion.id ? 'max-h-[400px] opacity-100 border-t border-border/50' : 'max-h-0 opacity-0'
                      )}>
                        <div className="p-4 bg-muted/20 space-y-3">
                          {suggestion.details?.fields && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {suggestion.details.fields.map((f, idx) => (
                                <div key={idx}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</p>
                                  <p className="text-xs font-medium text-foreground">{f.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {suggestion.details?.reasoning && (
                            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 p-3">
                              <div className="flex items-start gap-2.5">
                                <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">AI Reasoning</p>
                                    {suggestion.details.confidence && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                                        {suggestion.details.confidence}% confidence
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
                                    {suggestion.details.reasoning}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="pt-2 border-t border-border/50">
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
                            >
                              <SparklesIcon className="w-3.5 h-3.5" />
                              Apply Suggestion
                            </button>
                          </div>
                        </div>
                      </div>
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
                  {perfOverviewByPeriod['Month'].map(metric => (
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
            {/* Config bar + Period Selector */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Metrics configured for you</span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700/50">
                  {(['Day', 'Week', 'Month', 'Quarter'] as CCPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCcPeriod(p)}
                      className={cn('px-3 py-1 text-[10px] font-medium rounded-md transition-all',
                        p === ccPeriod
                          ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent'
                          : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
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

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {kpiDataByPeriod[ccPeriod].map((kpi) => (
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
                          <p className="text-[10px] text-muted-foreground">Incoming POs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{ccPoVolumeByPeriod[ccPeriod].total}</p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{ccPoVolumeByPeriod[ccPeriod].trend}</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <polygon points={ccPoVolumeByPeriod[ccPeriod].fillPoints} fill="#6366f1" opacity="0.12" />
                          <polyline points={ccPoVolumeByPeriod[ccPeriod].points} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {ccPoVolumeByPeriod[ccPeriod].labels.map(w => <span key={w}>{w}</span>)}
                        </div>
                      </div>
                    </>)}

                    {/* ---- ACK Turnaround ---- */}
                    {chartId === 'ack_turnaround' && (<>
                      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <Bars3Icon className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">Acknowledgement Turnaround</h3>
                          <p className="text-[10px] text-muted-foreground">Hours to acknowledge</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{ccAckTurnaroundByPeriod[ccPeriod].avg}</p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{ccAckTurnaroundByPeriod[ccPeriod].trend}</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <div className="flex-1 flex items-end gap-2">
                          {ccAckTurnaroundByPeriod[ccPeriod].bars.map(bar => (
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
                          <p className="text-lg font-bold text-foreground">{ccExcRateByPeriod[ccPeriod].rate}</p>
                          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{ccExcRateByPeriod[ccPeriod].trend}</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <line x1="0" y1="30" x2="200" y2="30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                          <polyline points={ccExcRateByPeriod[ccPeriod].points} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {ccExcRateByPeriod[ccPeriod].dotPoints.map((p,i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f59e0b" />
                          ))}
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {ccExcRateByPeriod[ccPeriod].labels.map(m => <span key={m}>{m}</span>)}
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
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{ccAutoAcceptByPeriod[ccPeriod].trend}</p>
                      </div>
                      <div className="h-44 flex items-center justify-center">
                        <svg viewBox="0 0 120 75" className="w-44 h-28">
                          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" className="dark:hidden" />
                          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#3f3f46" strokeWidth="10" strokeLinecap="round" className="hidden dark:block" />
                          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${ccAutoAcceptByPeriod[ccPeriod].dashPct} 157`} />
                          <text x="60" y="55" textAnchor="middle" fill="currentColor" fontSize="22" fontWeight="bold">{ccAutoAcceptByPeriod[ccPeriod].pct}%</text>
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
                          <p className="text-lg font-bold text-foreground">{ccResolutionByPeriod[ccPeriod].avg}</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{ccResolutionByPeriod[ccPeriod].trend}</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 py-4 flex flex-col justify-center gap-3">
                        {ccResolutionByPeriod[ccPeriod].bars.map(bar => (
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
                          <p className="text-lg font-bold text-foreground">{ccOnTimeByPeriod[ccPeriod].pct}</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{ccOnTimeByPeriod[ccPeriod].trend}</p>
                        </div>
                      </div>
                      <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                        <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                          <line x1="0" y1="15" x2="200" y2="15" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                          <polygon points={ccOnTimeByPeriod[ccPeriod].fillPoints} fill="#3b82f6" opacity="0.08" />
                          <polyline points={ccOnTimeByPeriod[ccPeriod].points} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                          {ccOnTimeByPeriod[ccPeriod].labels.map(m => <span key={m}>{m}</span>)}
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

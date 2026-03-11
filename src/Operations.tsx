import { useState, useMemo, useEffect, Fragment } from 'react'
import { useTenant } from './TenantContext'
import { useDemo } from './context/DemoContext'
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
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
  SparklesIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  BoltIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import Breadcrumbs from './components/Breadcrumbs'
import BatchAckModal from './components/BatchAckModal'
import AIScanModal from './components/modals/AIScanModal'
import CompareDeltasModal from './components/modals/CompareDeltasModal'
import AIAutoResolveModal from './components/modals/AIAutoResolveModal'
import ContactVendorsModal from './components/modals/ContactVendorsModal'
import PEDExportModal, { getMockPEDData } from './components/modals/PEDExportModal'
import type { PEDData } from './components/modals/PEDExportModal'
import { useToast, ToastContainer } from './components/AuthToast'
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
const poPipelineStages = ['Received', 'AI Processing', 'Under Review', 'Acknowledgement Draft', 'Acknowledgement Sent', 'Completed']
const ackPipelineStages = ['Draft', 'AI Validated', 'Sent', 'Confirmed', 'Revision Pending']
const exceptionPipelineStages = ['New', 'AI Analyzing', 'Pending Review', 'In Progress', 'Resolved']

// --- KPI Data per tab per period ---
type OpsPeriod = 'Day' | 'Week' | 'Month' | 'Quarter';

const poKpisByPeriod: Record<OpsPeriod, { label: string; value: string; sub: string; icon: typeof CubeIcon; color: string }[]> = {
  Day: [
    { label: 'Active POs', value: '12', sub: 'Today', icon: CubeIcon, color: 'blue' },
    { label: 'Pending ACK', value: '4', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
    { label: 'With Exceptions', value: '1', sub: 'Need attention', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Clean Match Rate', value: '95%', sub: 'Auto-accepted', icon: CheckCircleIcon, color: 'green' },
    { label: 'Total Value', value: '$184K', sub: 'Today POs', icon: CurrencyDollarIcon, color: 'indigo' },
  ],
  Week: [
    { label: 'Active POs', value: '45', sub: 'This week', icon: CubeIcon, color: 'blue' },
    { label: 'Pending ACK', value: '11', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
    { label: 'With Exceptions', value: '3', sub: 'Need attention', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Clean Match Rate', value: '93%', sub: 'Auto-accepted', icon: CheckCircleIcon, color: 'green' },
    { label: 'Total Value', value: '$920K', sub: 'Weekly POs', icon: CurrencyDollarIcon, color: 'indigo' },
  ],
  Month: [
    { label: 'Active POs', value: '156', sub: 'In pipeline', icon: CubeIcon, color: 'blue' },
    { label: 'Pending ACK', value: '23', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
    { label: 'With Exceptions', value: '7', sub: 'Need attention', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Clean Match Rate', value: '91%', sub: 'Auto-accepted', icon: CheckCircleIcon, color: 'green' },
    { label: 'Total Value', value: '$3.8M', sub: 'Active POs', icon: CurrencyDollarIcon, color: 'indigo' },
  ],
  Quarter: [
    { label: 'Active POs', value: '312', sub: 'This quarter', icon: CubeIcon, color: 'blue' },
    { label: 'Pending ACK', value: '38', sub: 'Awaiting response', icon: ClockIcon, color: 'orange' },
    { label: 'With Exceptions', value: '15', sub: 'Need attention', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Clean Match Rate', value: '89%', sub: 'Auto-accepted', icon: CheckCircleIcon, color: 'green' },
    { label: 'Total Value', value: '$11.2M', sub: 'Quarterly POs', icon: CurrencyDollarIcon, color: 'indigo' },
  ],
};

const ackKpisByPeriod: Record<OpsPeriod, { label: string; value: string; sub: string; icon: typeof CubeIcon; color: string }[]> = {
  Day: [
    { label: 'Pending ACKs', value: '4', sub: 'Today', icon: ClockIcon, color: 'orange' },
    { label: 'Discrepancies', value: '1', sub: 'Action required', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Confirmed', value: '18', sub: 'On track', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Lead Time', value: '3.8w', sub: 'Weeks to ship', icon: CalendarIcon, color: 'blue' },
    { label: 'On-Time %', value: '96%', sub: 'Today perf.', icon: ArrowTrendingUpIcon, color: 'indigo' },
  ],
  Week: [
    { label: 'Pending ACKs', value: '11', sub: 'This week', icon: ClockIcon, color: 'orange' },
    { label: 'Discrepancies', value: '3', sub: 'Action required', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Confirmed', value: '62', sub: 'On track', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Lead Time', value: '4.0w', sub: 'Weeks to ship', icon: CalendarIcon, color: 'blue' },
    { label: 'On-Time %', value: '95%', sub: 'Weekly perf.', icon: ArrowTrendingUpIcon, color: 'indigo' },
  ],
  Month: [
    { label: 'Pending ACKs', value: '23', sub: 'Awaiting review', icon: ClockIcon, color: 'orange' },
    { label: 'Discrepancies', value: '5', sub: 'Action required', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Confirmed', value: '156', sub: 'On track', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Lead Time', value: '4.2w', sub: 'Weeks to ship', icon: CalendarIcon, color: 'blue' },
    { label: 'On-Time %', value: '94%', sub: 'Vendor perf.', icon: ArrowTrendingUpIcon, color: 'indigo' },
  ],
  Quarter: [
    { label: 'Pending ACKs', value: '42', sub: 'This quarter', icon: ClockIcon, color: 'orange' },
    { label: 'Discrepancies', value: '14', sub: 'Action required', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Confirmed', value: '480', sub: 'On track', icon: CheckCircleIcon, color: 'green' },
    { label: 'Avg Lead Time', value: '4.5w', sub: 'Weeks to ship', icon: CalendarIcon, color: 'blue' },
    { label: 'On-Time %', value: '92%', sub: 'Quarterly perf.', icon: ArrowTrendingUpIcon, color: 'indigo' },
  ],
};

const exceptionKpisByPeriod: Record<OpsPeriod, { label: string; value: string; sub: string; icon: typeof CubeIcon; color: string }[]> = {
  Day: [
    { label: 'Open Exceptions', value: '2', sub: 'Today', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Avg Resolution', value: '2.8h', sub: 'Hours today', icon: ClockIcon, color: 'orange' },
    { label: 'Auto-Resolved', value: '50%', sub: 'No human needed', icon: SparklesIcon, color: 'green' },
    { label: 'By Qty Mismatch', value: '1', sub: 'Most common', icon: ExclamationCircleIcon, color: 'blue' },
    { label: 'Today', value: '3', sub: 'Total exceptions', icon: CalendarIcon, color: 'indigo' },
  ],
  Week: [
    { label: 'Open Exceptions', value: '4', sub: 'This week', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Avg Resolution', value: '3.0h', sub: 'Hours avg', icon: ClockIcon, color: 'orange' },
    { label: 'Auto-Resolved', value: '40%', sub: 'No human needed', icon: SparklesIcon, color: 'green' },
    { label: 'By Qty Mismatch', value: '2', sub: 'Most common', icon: ExclamationCircleIcon, color: 'blue' },
    { label: 'This Week', value: '8', sub: 'Total exceptions', icon: CalendarIcon, color: 'indigo' },
  ],
  Month: [
    { label: 'Open Exceptions', value: '7', sub: 'Need resolution', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Avg Resolution', value: '3.2h', sub: 'Hours to resolve', icon: ClockIcon, color: 'orange' },
    { label: 'Auto-Resolved', value: '34%', sub: 'No human needed', icon: SparklesIcon, color: 'green' },
    { label: 'By Qty Mismatch', value: '3', sub: 'Most common', icon: ExclamationCircleIcon, color: 'blue' },
    { label: 'This Month', value: '12', sub: 'Total exceptions', icon: CalendarIcon, color: 'indigo' },
  ],
  Quarter: [
    { label: 'Open Exceptions', value: '15', sub: 'This quarter', icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Avg Resolution', value: '3.5h', sub: 'Hours avg', icon: ClockIcon, color: 'orange' },
    { label: 'Auto-Resolved', value: '28%', sub: 'No human needed', icon: SparklesIcon, color: 'green' },
    { label: 'By Qty Mismatch', value: '8', sub: 'Most common', icon: ExclamationCircleIcon, color: 'blue' },
    { label: 'This Quarter', value: '38', sub: 'Total exceptions', icon: CalendarIcon, color: 'indigo' },
  ],
};

// Chart data by period for PO Volume Trend
const poVolumeTrendByPeriod: Record<OpsPeriod, { points: string; fillPoints: string; labels: string[] }> = {
  Day: { points: '0,75 33,60 67,68 100,45 133,52 167,38 200,30', fillPoints: '0,75 33,60 67,68 100,45 133,52 167,38 200,30 200,100 0,100', labels: ['8AM','10AM','12PM','2PM','4PM','6PM',''] },
  Week: { points: '0,70 40,55 80,62 120,40 160,35 200,28', fillPoints: '0,70 40,55 80,62 120,40 160,35 200,28 200,100 0,100', labels: ['Mon','Tue','Wed','Thu','Fri',''] },
  Month: { points: '0,82 25,70 50,74 75,55 100,60 125,40 150,45 175,30 200,24', fillPoints: '0,82 25,70 50,74 75,55 100,60 125,40 150,45 175,30 200,24 200,100 0,100', labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9'] },
  Quarter: { points: '0,65 50,48 100,52 150,35 200,22', fillPoints: '0,65 50,48 100,52 150,35 200,22 200,100 0,100', labels: ['Q1','Q2','Q3','Q4',''] },
};

const poVolumeTrendPct: Record<OpsPeriod, string> = { Day: '+8% ↑', Week: '+15% ↑', Month: '+12% ↑', Quarter: '+22% ↑' };

// Chart data by period for Supplier Distribution
const supplierDistByPeriod: Record<OpsPeriod, { name: string; pct: number }[]> = {
  Day: [{ name: 'Acme Corp', pct: 35 }, { name: 'TechDealer', pct: 25 }, { name: 'Urban Living', pct: 20 }, { name: 'Modern Homes', pct: 12 }, { name: 'Others', pct: 8 }],
  Week: [{ name: 'Acme Corp', pct: 32 }, { name: 'TechDealer', pct: 24 }, { name: 'Urban Living', pct: 19 }, { name: 'Modern Homes', pct: 15 }, { name: 'Others', pct: 10 }],
  Month: [{ name: 'Acme Corp', pct: 30 }, { name: 'TechDealer', pct: 22 }, { name: 'Urban Living', pct: 18 }, { name: 'Modern Homes', pct: 17 }, { name: 'Others', pct: 13 }],
  Quarter: [{ name: 'Acme Corp', pct: 28 }, { name: 'TechDealer', pct: 23 }, { name: 'Urban Living', pct: 20 }, { name: 'Modern Homes', pct: 18 }, { name: 'Others', pct: 11 }],
};

// Chart data by period for ACK Response Time
const ackResponseByPeriod: Record<OpsPeriod, { bars: { label: string; h: number }[]; avg: string; trend: string }> = {
  Day: { bars: [{ label: '8AM', h: 45 },{ label: '10AM', h: 72 },{ label: '12PM', h: 58 },{ label: '2PM', h: 80 },{ label: '4PM', h: 35 },{ label: '6PM', h: 22 }], avg: '0.8d', trend: '-12% ↓' },
  Week: { bars: [{ label: 'Mon', h: 62 },{ label: 'Tue', h: 78 },{ label: 'Wed', h: 50 },{ label: 'Thu', h: 68 },{ label: 'Fri', h: 42 }], avg: '1.0d', trend: '-10% ↓' },
  Month: { bars: [{ label: 'Mon', h: 65 },{ label: 'Tue', h: 82 },{ label: 'Wed', h: 45 },{ label: 'Thu', h: 70 },{ label: 'Fri', h: 38 },{ label: 'Sat', h: 22 }], avg: '1.2d', trend: '-8% ↓' },
  Quarter: { bars: [{ label: 'Jan', h: 70 },{ label: 'Feb', h: 62 },{ label: 'Mar', h: 55 },{ label: 'Apr', h: 48 },{ label: 'May', h: 42 },{ label: 'Jun', h: 38 }], avg: '1.4d', trend: '-5% ↓' },
};

// Chart data by period for ACK Match Quality
const ackMatchByPeriod: Record<OpsPeriod, { clean: number; autoCorrected: number; discrepancies: number }> = {
  Day: { clean: 92, autoCorrected: 5, discrepancies: 3 },
  Week: { clean: 88, autoCorrected: 7, discrepancies: 5 },
  Month: { clean: 84, autoCorrected: 9, discrepancies: 7 },
  Quarter: { clean: 82, autoCorrected: 10, discrepancies: 8 },
};

// Chart data by period for Exception Resolution
const excResolutionByPeriod: Record<OpsPeriod, { bars: { label: string; value: number; hours: string }[]; avg: string; trend: string }> = {
  Day: { bars: [{ label: 'Qty Mismatch', value: 90, hours: '3.8h' },{ label: 'Price Disc.', value: 65, hours: '3.2h' },{ label: 'Ship Date', value: 40, hours: '2.0h' },{ label: 'Part Mismatch', value: 55, hours: '2.8h' },{ label: 'Spec Issue', value: 25, hours: '1.2h' }], avg: '2.8h', trend: '-0.4h ↓' },
  Week: { bars: [{ label: 'Qty Mismatch', value: 88, hours: '4.0h' },{ label: 'Price Disc.', value: 72, hours: '3.4h' },{ label: 'Ship Date', value: 42, hours: '2.1h' },{ label: 'Part Mismatch', value: 58, hours: '2.9h' },{ label: 'Spec Issue', value: 28, hours: '1.4h' }], avg: '3.0h', trend: '-0.2h ↓' },
  Month: { bars: [{ label: 'Qty Mismatch', value: 85, hours: '4.2h' },{ label: 'Price Disc.', value: 70, hours: '3.5h' },{ label: 'Ship Date', value: 45, hours: '2.2h' },{ label: 'Part Mismatch', value: 60, hours: '3.0h' },{ label: 'Spec Issue', value: 30, hours: '1.5h' }], avg: '3.2h', trend: '+0.2h ↑' },
  Quarter: { bars: [{ label: 'Qty Mismatch', value: 82, hours: '4.5h' },{ label: 'Price Disc.', value: 68, hours: '3.8h' },{ label: 'Ship Date', value: 48, hours: '2.4h' },{ label: 'Part Mismatch', value: 62, hours: '3.2h' },{ label: 'Spec Issue', value: 32, hours: '1.6h' }], avg: '3.5h', trend: '+0.3h ↑' },
};

// Chart data by period for Exception Trend
const excTrendByPeriod: Record<OpsPeriod, { points: string; dotPoints: { x: number; y: number }[]; labels: string[]; pctChange: string }> = {
  Day: { points: '0,35 33,28 67,42 100,30 133,38 167,45 200,40', dotPoints: [{x:0,y:35},{x:33,y:28},{x:67,y:42},{x:100,y:30},{x:133,y:38},{x:167,y:45},{x:200,y:40}], labels: ['8AM','10AM','12PM','2PM','4PM','6PM',''], pctChange: '-0.5% ↓' },
  Week: { points: '0,28 40,38 80,32 120,42 160,35 200,48', dotPoints: [{x:0,y:28},{x:40,y:38},{x:80,y:32},{x:120,y:42},{x:160,y:35},{x:200,y:48}], labels: ['Mon','Tue','Wed','Thu','Fri',''], pctChange: '-1.2% ↓' },
  Month: { points: '0,20 28,35 57,28 85,42 114,35 142,48 171,42 200,55', dotPoints: [{x:0,y:20},{x:28,y:35},{x:57,y:28},{x:85,y:42},{x:114,y:35},{x:142,y:48},{x:171,y:42},{x:200,y:55}], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], pctChange: '-1.8% ↓' },
  Quarter: { points: '0,45 50,38 100,32 150,28 200,22', dotPoints: [{x:0,y:45},{x:50,y:38},{x:100,y:32},{x:150,y:28},{x:200,y:22}], labels: ['Q1','Q2','Q3','Q4',''], pctChange: '-3.2% ↓' },
};

// --- Mock Data ---
const purchaseOrders = [
  { id: 'PO-2026-095', supplier: 'Acme Corp', items: 45, amount: '$124,500', status: 'Received', date: 'Jan 15, 2026',
    confidence: 0, aiInsight: '', agentStage: 'intake' as const, flaggedFields: 0,
    shipEta: 'Feb 12, 2026', priority: 'standard' as const, channel: 'EDI' },
  { id: 'PO-2026-094', supplier: 'TechDealer Solutions', items: 12, amount: '$62,500', status: 'AI Processing', date: 'Jan 14, 2026',
    confidence: 87, aiInsight: '10 SKUs auto-mapped, 2 need expert review', agentStage: 'validator' as const, flaggedFields: 2,
    shipEta: 'Feb 8, 2026', priority: 'rush' as const, channel: 'Portal' },
  { id: 'PO-2026-093', supplier: 'Urban Living Inc.', items: 28, amount: '$112,000', status: 'Under Review', date: 'Jan 13, 2026',
    confidence: 94, aiInsight: 'All line items validated — freight zone flagged', agentStage: 'complete' as const, flaggedFields: 1,
    shipEta: 'Feb 20, 2026', priority: 'standard' as const, channel: 'EDI' },
  { id: 'PO-2026-092', supplier: 'Global Logistics', items: 8, amount: '$45,000', status: 'Acknowledgement Sent', date: 'Jan 12, 2026',
    confidence: 98, aiInsight: 'Clean match — auto-acknowledged', agentStage: 'complete' as const, flaggedFields: 0,
    shipEta: 'Jan 28, 2026', priority: 'standard' as const, channel: 'Email' },
  { id: 'PO-2026-091', supplier: 'City Builders', items: 15, amount: '$89,000', status: 'Acknowledgement Draft', date: 'Jan 11, 2026',
    confidence: 76, aiInsight: '3 pricing discrepancies detected, draft pending review', agentStage: 'complete' as const, flaggedFields: 3,
    shipEta: 'Feb 5, 2026', priority: 'rush' as const, channel: 'Portal' },
  { id: 'PO-2026-090', supplier: 'Modern Homes', items: 32, amount: '$210,000', status: 'Completed', date: 'Jan 10, 2026',
    confidence: 99, aiInsight: 'Fully processed — 0 exceptions', agentStage: 'complete' as const, flaggedFields: 0,
    shipEta: 'Jan 25, 2026', priority: 'standard' as const, channel: 'EDI' },
]

const acknowledgements = [
  { id: 'ACK-8843', relatedPo: 'PO-2026-094', vendor: 'TechDealer Solutions', status: 'Draft', lines: 12, date: 'Jan 14, 2026',
    discrepancy: 'None', confidence: 0, aiInsight: '', matchedLines: 0, totalLines: 12, discrepancyCount: 0, autoResolved: 0,
    amount: '$62,500', responseTime: '—', leadTime: '3.2w' },
  { id: 'ACK-8842', relatedPo: 'PO-2026-093', vendor: 'Urban Living Inc.', status: 'AI Validated', lines: 28, date: 'Jan 13, 2026',
    discrepancy: '2 auto-corrected', confidence: 92, aiInsight: '26 lines matched, 2 auto-corrected (grommet config, ship date)', matchedLines: 26, totalLines: 28, discrepancyCount: 2, autoResolved: 2,
    amount: '$112,000', responseTime: '4h', leadTime: '5.1w' },
  { id: 'ACK-8841', relatedPo: 'PO-2026-092', vendor: 'Global Logistics', status: 'Sent', lines: 8, date: 'Jan 12, 2026',
    discrepancy: 'None', confidence: 99, aiInsight: 'Perfect match — all 8 lines confirmed', matchedLines: 8, totalLines: 8, discrepancyCount: 0, autoResolved: 0,
    amount: '$45,000', responseTime: '2h', leadTime: '2.4w' },
  { id: 'ACK-8840', relatedPo: 'PO-2026-091', vendor: 'City Builders', status: 'Revision Pending', lines: 15, date: 'Jan 11, 2026',
    discrepancy: 'Price Mismatch ($500)', confidence: 68, aiInsight: 'Price mismatch on 3 lines — vendor revision requested', matchedLines: 12, totalLines: 15, discrepancyCount: 3, autoResolved: 0,
    amount: '$89,000', responseTime: '18h', leadTime: '3.8w' },
  { id: 'ACK-8839', relatedPo: 'PO-2026-090', vendor: 'Modern Homes', status: 'Confirmed', lines: 32, date: 'Jan 10, 2026',
    discrepancy: 'None', confidence: 99, aiInsight: 'All 32 lines confirmed — zero discrepancies', matchedLines: 32, totalLines: 32, discrepancyCount: 0, autoResolved: 0,
    amount: '$210,000', responseTime: '1h', leadTime: '4.5w' },
]

const exceptions = [
  { id: 'EXC-001', relatedPo: 'PO-2026-091', vendor: 'City Builders', problem: 'Qty Mismatch', severity: 'critical', status: 'New', lines: 3, date: 'Jan 15, 2026',
    confidence: 0, aiInsight: '', rootCause: '', autoResolvable: false,
    affectedAmount: '$12,400', slaHours: 4, elapsedHours: 2 },
  { id: 'EXC-002', relatedPo: 'PO-2026-088', vendor: 'Coastal Props', problem: 'Price Discrepancy', severity: 'high', status: 'AI Analyzing', lines: 1, date: 'Jan 14, 2026',
    confidence: 82, aiInsight: 'Vendor applied outdated price list — suggesting correction', rootCause: 'Outdated vendor price list', autoResolvable: true,
    affectedAmount: '$3,200', slaHours: 8, elapsedHours: 5 },
  { id: 'EXC-003', relatedPo: 'PO-2026-085', vendor: 'Valley Homes', problem: 'Ship Date', severity: 'medium', status: 'Pending Review', lines: 5, date: 'Jan 13, 2026',
    confidence: 91, aiInsight: 'Ship date shifted +7 days — within tolerance threshold', rootCause: 'Production delay at vendor', autoResolvable: false,
    affectedAmount: '$28,500', slaHours: 24, elapsedHours: 14 },
  { id: 'EXC-004', relatedPo: 'PO-2026-082', vendor: 'Elite Builders', problem: 'Part # Mismatch', severity: 'high', status: 'In Progress', lines: 2, date: 'Jan 12, 2026',
    confidence: 74, aiInsight: 'Vendor substituted part — checking compatibility', rootCause: 'Vendor substitution without approval', autoResolvable: false,
    affectedAmount: '$8,900', slaHours: 8, elapsedHours: 7 },
  { id: 'EXC-005', relatedPo: 'PO-2026-080', vendor: 'Apex Tech', problem: 'Spec Issue', severity: 'low', status: 'Resolved', lines: 1, date: 'Jan 10, 2026',
    confidence: 97, aiInsight: 'Spec deviation within tolerance — auto-accepted', rootCause: 'Minor spec variation', autoResolvable: true,
    affectedAmount: '$1,100', slaHours: 48, elapsedHours: 3 },
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
  'Acknowledgement Draft': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Acknowledgement Sent': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
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
  const [isAIScanOpen, setIsAIScanOpen] = useState(false)
  const [isCompareDeltasOpen, setIsCompareDeltasOpen] = useState(false)
  const [isAutoResolveOpen, setIsAutoResolveOpen] = useState(false)
  const [isContactVendorsOpen, setIsContactVendorsOpen] = useState(false)
  const [isPEDExportOpen, setIsPEDExportOpen] = useState(false)
  const [pedExportData, setPedExportData] = useState<PEDData | null>(null)
  const { toasts, addToast, dismissToast } = useToast()
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [metricsPeriod, setMetricsPeriod] = useState<OpsPeriod>('Month')

  const handleQuickAction = (actionId: string, infoMsg: string, successMsg: string, delay = 1500) => {
    setProcessingAction(actionId)
    addToast('info', infoMsg)
    setTimeout(() => {
      setProcessingAction(null)
      addToast('success', successMsg)
    }, delay)
  }

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

  const currentKpis = lifecycleTab === 'purchase-orders' ? poKpisByPeriod[metricsPeriod]
    : lifecycleTab === 'acknowledgements' ? ackKpisByPeriod[metricsPeriod]
    : exceptionKpisByPeriod[metricsPeriod]

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

          </div>
        </div>

        {/* Quick Actions Bar — contextual per tab */}
        {activeTab !== 'metrics' && (
          <div className="flex items-center gap-2 flex-wrap">
            {lifecycleTab === 'purchase-orders' && (<>
              <button
                onClick={() => setIsAIScanOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <BoltIcon className="w-3.5 h-3.5 text-indigo-500" />
                Run AI Scan
              </button>
              <button
                disabled={processingAction === 'po-reminders'}
                onClick={() => handleQuickAction('po-reminders', 'Sending vendor reminders...', 'Reminders sent to 3 vendors with pending POs')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all disabled:opacity-60"
              >
                {processingAction === 'po-reminders' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <PaperAirplaneIcon className="w-3.5 h-3.5 text-blue-500" />}
                Send Reminders
              </button>
              <button
                onClick={() => { setPedExportData(getMockPEDData('order')); setIsPEDExportOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5 text-zinc-500" />
                Export POs
              </button>
              <button
                disabled={processingAction === 'validate-pos'}
                onClick={() => handleQuickAction('validate-pos', 'Running validation on pending POs...', '12 POs validated — 2 flagged for review')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all disabled:opacity-60"
              >
                {processingAction === 'validate-pos' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-green-500" /> : <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />}
                Validate All Pending
              </button>
            </>)}
            {lifecycleTab === 'acknowledgements' && (<>
              <button
                onClick={() => setIsBatchAckOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Batch Approve
              </button>
              <button
                disabled={processingAction === 'ack-reminders'}
                onClick={() => handleQuickAction('ack-reminders', 'Sending acknowledgement reminders...', 'Reminders sent to 4 vendors awaiting acknowledgement')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all disabled:opacity-60"
              >
                {processingAction === 'ack-reminders' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <PaperAirplaneIcon className="w-3.5 h-3.5 text-blue-500" />}
                Send Reminders
              </button>
              <button
                onClick={() => setIsCompareDeltasOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <EyeIcon className="w-3.5 h-3.5 text-indigo-500" />
                Compare Deltas
              </button>
              <button
                onClick={() => { setPedExportData(getMockPEDData('acknowledgment')); setIsPEDExportOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5 text-zinc-500" />
                Export ACKs
              </button>
            </>)}
            {lifecycleTab === 'exceptions' && (<>
              <button
                onClick={() => setIsAutoResolveOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                AI Auto-Resolve ({exceptions.filter(e => e.autoResolvable).length})
              </button>
              <button
                disabled={processingAction === 'escalate'}
                onClick={() => handleQuickAction('escalate', 'Escalating critical exceptions...', '2 critical exceptions escalated to procurement manager')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all disabled:opacity-60"
              >
                {processingAction === 'escalate' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-amber-500" /> : <ArrowPathIcon className="w-3.5 h-3.5 text-amber-500" />}
                Escalate Critical
              </button>
              <button
                onClick={() => setIsContactVendorsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-blue-500" />
                Contact Vendors
              </button>
              <button
                disabled={processingAction === 'export-report'}
                onClick={() => handleQuickAction('export-report', 'Generating exception report...', 'Exception report exported — 15 items across 3 categories')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/30 hover:shadow-sm transition-all disabled:opacity-60"
              >
                {processingAction === 'export-report' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-zinc-500" /> : <ArrowDownTrayIcon className="w-3.5 h-3.5 text-zinc-500" />}
                Export Report
              </button>
            </>)}
          </div>
        )}

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

                          {/* --- PO-specific details --- */}
                          {lifecycleTab === 'purchase-orders' && (<>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-foreground">{item.amount}</span>
                              <span className="text-[9px] text-muted-foreground">{item.items} items</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[9px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <TruckIcon className="w-3 h-3" /> {item.shipEta}
                              </span>
                              {item.priority === 'rush' && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold uppercase text-[8px] border border-red-200 dark:border-red-500/20">Rush</span>
                              )}
                            </div>
                            {item.flaggedFields > 0 && (
                              <div className="mt-1 flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400">
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                <span className="font-medium">{item.flaggedFields} fields flagged</span>
                              </div>
                            )}
                          </>)}

                          {/* --- ACK-specific details --- */}
                          {lifecycleTab === 'acknowledgements' && (<>
                            <div className="mt-1.5 flex items-center justify-between text-[9px]">
                              <span className="text-muted-foreground">{item.relatedPo}</span>
                              <span className="font-medium text-foreground">{item.amount}</span>
                            </div>
                            {/* Discrepancy summary */}
                            {item.discrepancyCount > 0 && (
                              <div className="mt-1 flex items-center gap-2 text-[9px]">
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
                            {/* Matched lines progress */}
                            {item.matchedLines > 0 && (
                              <div className="mt-1.5">
                                <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-0.5">
                                  <span>{item.matchedLines}/{item.totalLines} matched</span>
                                  <span>Lead: {item.leadTime}</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all" style={{ width: `${(item.matchedLines / item.totalLines) * 100}%` }} />
                                </div>
                              </div>
                            )}
                          </>)}

                          {/* --- Exception-specific details --- */}
                          {lifecycleTab === 'exceptions' && (<>
                            <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block", severityColors[item.severity])}>
                              {item.problem}
                            </span>
                            <div className="mt-1 flex items-center justify-between text-[9px]">
                              <span className="text-muted-foreground">{item.relatedPo}</span>
                              <span className="font-medium text-foreground">{item.affectedAmount}</span>
                            </div>
                            {/* SLA timer */}
                            {item.status !== 'Resolved' && (
                              <div className="mt-1.5">
                                <div className="flex items-center justify-between text-[8px] mb-0.5">
                                  <span className="text-muted-foreground">SLA: {item.elapsedHours}h / {item.slaHours}h</span>
                                  <span className={cn("font-bold",
                                    item.elapsedHours / item.slaHours > 0.8 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                  )}>
                                    {Math.max(0, item.slaHours - item.elapsedHours)}h left
                                  </span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full transition-all",
                                    item.elapsedHours / item.slaHours > 0.8 ? "bg-red-500" : "bg-green-500"
                                  )} style={{ width: `${Math.min(100, (item.elapsedHours / item.slaHours) * 100)}%` }} />
                                </div>
                              </div>
                            )}
                            {/* Root cause */}
                            {item.rootCause && (
                              <p className="text-[9px] text-muted-foreground mt-1">
                                Root: <span className="font-medium text-foreground">{item.rootCause}</span>
                              </p>
                            )}
                            {/* Auto-resolvable */}
                            {item.autoResolvable && (
                              <div className="mt-1 flex items-center gap-1 text-[9px] text-green-600 dark:text-green-400">
                                <SparklesIcon className="w-3 h-3" />
                                <span className="font-medium">AI can auto-resolve</span>
                              </div>
                            )}
                          </>)}

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
                    {lifecycleTab === 'exceptions' ? 'Vendor / Problem' : 'Supplier'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">AI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    {lifecycleTab === 'purchase-orders' ? 'Value' : lifecycleTab === 'exceptions' ? 'Impact' : 'Lines'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{item.id}</span>
                      {item.relatedPo && <p className="text-[10px] text-muted-foreground">{item.relatedPo}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-foreground">{item.supplier || item.vendor}</span>
                      {item.problem && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full", severityColors[item.severity])}>
                            {item.severity}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.problem}</span>
                        </div>
                      )}
                      {lifecycleTab === 'purchase-orders' && item.priority === 'rush' && (
                        <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 ml-1">Rush</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[item.status] || 'bg-muted text-muted-foreground')}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.confidence > 0 ? (
                          <span className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-bold shrink-0",
                            item.confidence >= 90 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : item.confidence >= 70 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          )}>
                            {item.confidence}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium text-xs">
                      {lifecycleTab === 'purchase-orders' && (<>{item.amount}<span className="text-muted-foreground font-normal ml-1">({item.items})</span></>)}
                      {lifecycleTab === 'acknowledgements' && (<>{item.matchedLines}/{item.totalLines}<span className="text-muted-foreground font-normal ml-1">lines</span></>)}
                      {lifecycleTab === 'exceptions' && (<>{item.affectedAmount}<span className="text-muted-foreground font-normal ml-1">({item.lines} lines)</span></>)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{item.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lifecycleTab === 'purchase-orders' && (<>
                          <button onClick={() => onNavigateToDetail('order-detail')} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">View</button>
                          {item.status === 'Under Review' && <button className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-medium hover:bg-green-500/20 transition-colors">Approve</button>}
                          {item.status === 'AI Processing' && <button className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium hover:bg-indigo-500/20 transition-colors">Review AI</button>}
                        </>)}
                        {lifecycleTab === 'acknowledgements' && (<>
                          <button onClick={() => onNavigateToDetail('ack-detail')} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">View</button>
                          {item.status === 'AI Validated' && <button className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-medium hover:bg-green-500/20 transition-colors">Approve</button>}
                          {item.status === 'Revision Pending' && <button className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium hover:bg-amber-500/20 transition-colors">Follow Up</button>}
                        </>)}
                        {lifecycleTab === 'exceptions' && (<>
                          <button onClick={() => onNavigateToDetail('order-detail')} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">View</button>
                          {item.autoResolvable && <button className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-medium hover:bg-green-500/20 transition-colors">Auto-Fix</button>}
                          {item.severity === 'critical' && <button className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-700 dark:text-red-400 font-medium hover:bg-red-500/20 transition-colors">Escalate</button>}
                        </>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Metrics View */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Performance Metrics</h3>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700/50">
                {(['Day', 'Week', 'Month', 'Quarter'] as OpsPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setMetricsPeriod(p)}
                    className={cn('px-3 py-1 text-[10px] font-medium rounded-md transition-all',
                      p === metricsPeriod
                        ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Volume / Pipeline Summary */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Pipeline Summary</h3>
                    <p className="text-[10px] text-muted-foreground">Items by status</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{counts.all}</p>
                    <p className="text-[10px] text-muted-foreground">total</p>
                  </div>
                </div>
                <div className="h-44 px-5 py-4 flex flex-col justify-center gap-2.5">
                  {currentPipelineStages.map(stage => {
                    const count = currentData.filter(i => i.status === stage).length
                    const pct = counts.all > 0 ? (count / counts.all) * 100 : 0
                    return (
                      <div key={stage} className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground w-24 text-right shrink-0 truncate">{stage}</span>
                        <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-foreground w-5 shrink-0">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PO tab charts */}
              {lifecycleTab === 'purchase-orders' && (<>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">PO Volume Trend</h3>
                      <p className="text-[10px] text-muted-foreground">Incoming POs</p>
                    </div>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{poVolumeTrendPct[metricsPeriod]}</p>
                  </div>
                  <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                    <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                      <polygon points={poVolumeTrendByPeriod[metricsPeriod].fillPoints} fill="#6366f1" opacity="0.12" />
                      <polyline points={poVolumeTrendByPeriod[metricsPeriod].points} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                      {poVolumeTrendByPeriod[metricsPeriod].labels.map(w => <span key={w}>{w}</span>)}
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Supplier Distribution</h3>
                      <p className="text-[10px] text-muted-foreground">Active POs by supplier</p>
                    </div>
                  </div>
                  <div className="h-44 px-5 py-4 flex flex-col justify-center gap-2.5">
                    {supplierDistByPeriod[metricsPeriod].map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground w-20 text-right shrink-0 truncate">{s.name}</span>
                        <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 dark:bg-blue-500 rounded-full" style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-foreground w-8 shrink-0">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* ACK tab charts */}
              {lifecycleTab === 'acknowledgements' && (<>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Response Time</h3>
                      <p className="text-[10px] text-muted-foreground">Hours to acknowledge</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{ackResponseByPeriod[metricsPeriod].avg}</p>
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{ackResponseByPeriod[metricsPeriod].trend}</p>
                    </div>
                  </div>
                  <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                    <div className="flex-1 flex items-end gap-2">
                      {ackResponseByPeriod[metricsPeriod].bars.map(bar => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%' }}>
                          <div className="w-full flex-1" />
                          <div className="w-full rounded-t bg-indigo-400 dark:bg-indigo-500 shrink-0" style={{ height: `${bar.h}%` }} />
                          <span className="text-[9px] text-muted-foreground shrink-0">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Match Quality</h3>
                      <p className="text-[10px] text-muted-foreground">Line-level match results</p>
                    </div>
                  </div>
                  <div className="h-44 flex items-center justify-center gap-6 px-5">
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from -90deg, #22c55e 0deg ${ackMatchByPeriod[metricsPeriod].clean * 3.6}deg, #f59e0b ${ackMatchByPeriod[metricsPeriod].clean * 3.6}deg ${(ackMatchByPeriod[metricsPeriod].clean + ackMatchByPeriod[metricsPeriod].autoCorrected) * 3.6}deg, #ef4444 ${(ackMatchByPeriod[metricsPeriod].clean + ackMatchByPeriod[metricsPeriod].autoCorrected) * 3.6}deg 360deg)` }} />
                      <div className="absolute inset-3 rounded-full bg-white dark:bg-zinc-800" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{ackMatchByPeriod[metricsPeriod].clean}%</p>
                          <p className="text-[8px] text-muted-foreground">clean</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                        <div>
                          <p className="text-[10px] font-medium text-foreground">{ackMatchByPeriod[metricsPeriod].clean}%</p>
                          <p className="text-[8px] text-muted-foreground">Exact Match</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                        <div>
                          <p className="text-[10px] font-medium text-foreground">{ackMatchByPeriod[metricsPeriod].autoCorrected}%</p>
                          <p className="text-[8px] text-muted-foreground">Auto-Corrected</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                        <div>
                          <p className="text-[10px] font-medium text-foreground">{ackMatchByPeriod[metricsPeriod].discrepancies}%</p>
                          <p className="text-[8px] text-muted-foreground">Discrepancies</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>)}

              {/* Exceptions tab charts */}
              {lifecycleTab === 'exceptions' && (<>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Resolution Time</h3>
                      <p className="text-[10px] text-muted-foreground">Avg hours by type</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{excResolutionByPeriod[metricsPeriod].avg}</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{excResolutionByPeriod[metricsPeriod].trend}</p>
                    </div>
                  </div>
                  <div className="h-44 px-5 py-4 flex flex-col justify-center gap-3">
                    {excResolutionByPeriod[metricsPeriod].bars.map(bar => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground w-20 text-right shrink-0">{bar.label}</span>
                        <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 dark:bg-amber-500 rounded-full" style={{ width: `${bar.value}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-foreground w-8 shrink-0">{bar.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Exception Trend</h3>
                      <p className="text-[10px] text-muted-foreground">Exception rate</p>
                    </div>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{excTrendByPeriod[metricsPeriod].pctChange}</p>
                  </div>
                  <div className="h-44 px-5 pt-4 pb-2 flex flex-col">
                    <svg viewBox="0 0 200 100" className="flex-1 w-full" preserveAspectRatio="none">
                      <line x1="0" y1="30" x2="200" y2="30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                      <polyline points={excTrendByPeriod[metricsPeriod].points} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {excTrendByPeriod[metricsPeriod].dotPoints.map((p,i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f59e0b" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                      {excTrendByPeriod[metricsPeriod].labels.map(w => <span key={w}>{w}</span>)}
                    </div>
                  </div>
                </div>
              </>)}

            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <BatchAckModal isOpen={isBatchAckOpen} onClose={() => setIsBatchAckOpen(false)} />
      <AIScanModal isOpen={isAIScanOpen} onClose={() => { setIsAIScanOpen(false); addToast('success', 'AI Scan complete — 3 anomalies detected, 2 auto-corrected') }} />
      <CompareDeltasModal isOpen={isCompareDeltasOpen} onClose={() => setIsCompareDeltasOpen(false)} onAccept={() => { setIsCompareDeltasOpen(false); addToast('success', 'All matching fields accepted — 2 mismatches flagged for review') }} />
      <AIAutoResolveModal isOpen={isAutoResolveOpen} onClose={() => setIsAutoResolveOpen(false)} onApply={() => { setIsAutoResolveOpen(false); addToast('success', '3 exceptions auto-resolved and applied successfully') }} />
      <ContactVendorsModal isOpen={isContactVendorsOpen} onClose={() => setIsContactVendorsOpen(false)} onSend={() => { setIsContactVendorsOpen(false); addToast('success', 'Messages sent to 2 vendors regarding pending exceptions') }} />
      <PEDExportModal isOpen={isPEDExportOpen} onClose={() => setIsPEDExportOpen(false)} data={pedExportData} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

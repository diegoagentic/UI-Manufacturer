import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  SparklesIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

interface AIScanModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ScanLog {
  agent: string
  message: string
  type: 'info' | 'success' | 'warning'
}

const PIPELINE_AGENTS = [
  { id: 'scanner', name: 'DocScanner', icon: DocumentMagnifyingGlassIcon },
  { id: 'extractor', name: 'DataExtractor', icon: CpuChipIcon },
  { id: 'validator', name: 'Validator', icon: ShieldCheckIcon },
  { id: 'reporter', name: 'Reporter', icon: ClipboardDocumentListIcon },
]

const SCAN_RESULTS = [
  { label: 'POs Scanned', value: '24', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Anomalies Detected', value: '3', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Auto-Corrected', value: '2', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { label: 'Needs Review', value: '1', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
]

export default function AIScanModal({ isOpen, onClose }: AIScanModalProps) {
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [activeAgent, setActiveAgent] = useState(0)
  const [phase, setPhase] = useState<'processing' | 'complete'>('processing')

  useEffect(() => {
    if (!isOpen) return
    setProgress(0)
    setLogs([])
    setActiveAgent(0)
    setPhase('processing')

    const timeline: Array<{ delay: number; log: ScanLog; progress: number; agent: number }> = [
      { delay: 800, log: { agent: 'DocScanner', message: 'Scanning 24 purchase orders for structural anomalies...', type: 'info' }, progress: 10, agent: 0 },
      { delay: 2000, log: { agent: 'DocScanner', message: 'Identified 6 POs with potential data inconsistencies.', type: 'warning' }, progress: 25, agent: 0 },
      { delay: 3200, log: { agent: 'DataExtractor', message: 'Extracting line items and pricing data for comparison...', type: 'info' }, progress: 40, agent: 1 },
      { delay: 4400, log: { agent: 'DataExtractor', message: 'Cross-referencing catalog prices — 3 discrepancies found.', type: 'warning' }, progress: 55, agent: 1 },
      { delay: 5600, log: { agent: 'Validator', message: 'Validating quantities and delivery dates against contracts...', type: 'info' }, progress: 70, agent: 2 },
      { delay: 6800, log: { agent: 'Validator', message: 'Auto-corrected 2 rounding errors in unit pricing.', type: 'success' }, progress: 85, agent: 2 },
      { delay: 8000, log: { agent: 'Reporter', message: 'Generating scan report — 1 item requires manual review.', type: 'success' }, progress: 100, agent: 3 },
    ]

    const timers: ReturnType<typeof setTimeout>[] = []

    timeline.forEach(({ delay, log, progress: p, agent }) => {
      timers.push(setTimeout(() => {
        setProgress(p)
        setLogs(prev => [...prev, log])
        setActiveAgent(agent)
      }, delay))
    })

    timers.push(setTimeout(() => {
      setPhase('complete')
    }, 9000))

    return () => timers.forEach(clearTimeout)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                {/* Header */}
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      {phase === 'processing' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />}
                      {phase === 'complete' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />}
                    </div>
                    <div>
                      <Dialog.Title className="text-sm font-bold text-foreground">
                        {phase === 'processing' ? 'AI Scan — Analyzing Purchase Orders' : 'Scan Complete'}
                      </Dialog.Title>
                      <p className="text-[11px] text-muted-foreground">
                        {phase === 'processing' ? '4 agents scanning for anomalies and discrepancies' : '24 POs analyzed — report ready'}
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Pipeline strip */}
                <div className="px-6 pb-3 flex gap-1">
                  {PIPELINE_AGENTS.map((agent, i) => {
                    const status = phase === 'complete' ? 'done' : i < activeAgent ? 'done' : i === activeAgent ? 'running' : 'pending'
                    return (
                      <div key={agent.id} className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border bg-muted/30">
                        <agent.icon className={`w-3.5 h-3.5 ${status === 'done' ? 'text-emerald-500' : status === 'running' ? 'text-indigo-500' : 'text-muted-foreground/50'}`} />
                        <span className={`text-[10px] font-medium truncate ${status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : status === 'running' ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground/50'}`}>
                          {agent.name}
                        </span>
                        {status === 'done' && <CheckCircleIcon className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />}
                        {status === 'running' && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse ml-auto shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {phase === 'processing' ? 'Scanning...' : 'All agents completed'}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${phase === 'complete' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-indigo-600 to-purple-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {phase === 'processing' ? (
                  <div className="px-6 pb-5">
                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl p-4 max-h-[200px] overflow-y-auto">
                      <div className="space-y-2">
                        {logs.map((log, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-muted-foreground font-mono text-[10px] mt-0.5 select-none">{'>'}</span>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] font-bold mr-1.5 ${log.type === 'success' ? 'text-emerald-500' : log.type === 'warning' ? 'text-amber-500' : 'text-indigo-500'}`}>
                                {log.agent}:
                              </span>
                              <span className={`text-[11px] font-mono ${i === logs.length - 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {log.message}
                              </span>
                            </div>
                          </div>
                        ))}
                        {progress < 100 && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-muted-foreground font-mono text-[10px]">{'>'}</span>
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 pb-5">
                    <div className="grid grid-cols-4 gap-3">
                      {SCAN_RESULTS.map(r => (
                        <div key={r.label} className={`${r.bg} rounded-xl p-3 text-center border border-border`}>
                          <p className={`text-2xl font-bold ${r.color}`}>{r.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{r.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Strata Intelligence Engine</span>
                  </div>
                  {phase === 'complete' && (
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

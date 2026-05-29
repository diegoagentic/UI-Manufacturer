import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  SparklesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface AIAutoResolveModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}

const RESOLVABLE_EXCEPTIONS = [
  {
    id: '#EXC-4010',
    problem: 'Price rounding error',
    detail: '$0.50 difference on unit price',
    resolution: 'Auto-corrected to PO price ($226.00)',
  },
  {
    id: '#EXC-4012',
    problem: 'Date format mismatch',
    detail: 'MM/DD/YYYY vs YYYY-MM-DD',
    resolution: 'Converted to ISO-8601 standard format',
  },
  {
    id: '#EXC-4015',
    problem: 'Unit code mapping',
    detail: '"EA" vs "Each" — different labels, same unit',
    resolution: 'Mapped to standard unit code "EA"',
  },
]

export default function AIAutoResolveModal({ isOpen, onClose, onApply }: AIAutoResolveModalProps) {
  const [resolvedCount, setResolvedCount] = useState(0)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setResolvedCount(0)
    setIsApplying(false)

    const timers: ReturnType<typeof setTimeout>[] = []
    RESOLVABLE_EXCEPTIONS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setResolvedCount(i + 1)
      }, 1500 + i * 2000))
    })

    return () => timers.forEach(clearTimeout)
  }, [isOpen])

  const allResolved = resolvedCount === RESOLVABLE_EXCEPTIONS.length

  const handleApply = () => {
    setIsApplying(true)
    setTimeout(() => {
      onApply()
    }, 1000)
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ai/20 border border-purple-500/30 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-ai dark:text-purple-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-sm font-bold text-foreground">AI Auto-Resolution</Dialog.Title>
                      <p className="text-[11px] text-muted-foreground">{RESOLVABLE_EXCEPTIONS.length} exceptions can be auto-resolved</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="px-6 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {allResolved ? 'All exceptions resolved' : 'Resolving...'}
                    </span>
                    <span className="text-xs font-bold text-foreground">{resolvedCount}/{RESOLVABLE_EXCEPTIONS.length}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${(resolvedCount / RESOLVABLE_EXCEPTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Exception list */}
                <div className="px-6 py-4 space-y-3 max-h-[350px] overflow-y-auto">
                  {RESOLVABLE_EXCEPTIONS.map((exc, i) => {
                    const status = i < resolvedCount ? 'resolved' : i === resolvedCount ? 'processing' : 'pending'
                    return (
                      <div key={exc.id} className={`p-3 rounded-xl border transition-all ${
                        status === 'resolved' ? 'border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10' :
                        status === 'processing' ? 'border-indigo-200 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10' :
                        'border-border bg-muted/30'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {status === 'resolved' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                            {status === 'processing' && <ArrowPathIcon className="w-5 h-5 text-indigo-500 animate-spin" />}
                            {status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-border" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-foreground">{exc.id}</span>
                              <span className={`text-[10px] font-medium ${
                                status === 'resolved' ? 'text-green-600 dark:text-green-400' :
                                status === 'processing' ? 'text-indigo-600 dark:text-indigo-400' :
                                'text-muted-foreground'
                              }`}>
                                {exc.problem}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{exc.detail}</p>
                            {status === 'resolved' && (
                              <p className="text-[11px] text-green-600 dark:text-green-400 font-medium mt-1">{exc.resolution}</p>
                            )}
                            {status === 'processing' && (
                              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">Analyzing and resolving...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Strata Intelligence Engine</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Cancel
                    </button>
                    <button
                      disabled={!allResolved || isApplying}
                      onClick={handleApply}
                      className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${
                        allResolved && !isApplying
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {isApplying && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                      {isApplying ? 'Applying...' : 'Apply All Resolutions'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

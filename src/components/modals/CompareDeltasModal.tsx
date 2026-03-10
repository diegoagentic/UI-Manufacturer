import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface CompareDeltasModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

const DELTA_ROWS = [
  { field: 'Unit Price', poValue: '$226.00', ackValue: '$231.50', match: false, detail: '+$5.50' },
  { field: 'Delivery Date', poValue: 'Mar 15, 2026', ackValue: 'Mar 22, 2026', match: false, detail: '+7 days' },
  { field: 'Quantity', poValue: '200 units', ackValue: '200 units', match: true },
  { field: 'Ship Method', poValue: 'Ground', ackValue: 'Ground', match: true },
  { field: 'Payment Terms', poValue: 'Net 30', ackValue: 'Net 45', match: false, detail: '+15 days' },
  { field: 'Part Number', poValue: 'ETC-200X', ackValue: 'ETC-200X', match: true },
  { field: 'Warehouse', poValue: 'Chicago, IL', ackValue: 'Chicago, IL', match: true },
]

const mismatches = DELTA_ROWS.filter(r => !r.match).length
const matches = DELTA_ROWS.filter(r => r.match).length

export default function CompareDeltasModal({ isOpen, onClose, onAccept }: CompareDeltasModalProps) {
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
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-foreground">PO vs ACK Delta Comparison</Dialog.Title>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      #ORD-2056 — Steelcase
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                        {mismatches} mismatches
                      </span>
                    </p>
                  </div>
                  <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Summary bar */}
                <div className="px-6 py-3 border-b border-border flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="font-medium">{matches} matched</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="font-medium">{mismatches} mismatched</span>
                  </div>
                </div>

                {/* Comparison table */}
                <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <th className="text-left py-2 pr-4">Field</th>
                        <th className="text-left py-2 pr-4">PO Value</th>
                        <th className="text-left py-2 pr-4">ACK Value</th>
                        <th className="text-right py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {DELTA_ROWS.map(row => (
                        <tr key={row.field} className={row.match ? '' : 'bg-amber-50/50 dark:bg-amber-900/5'}>
                          <td className="py-3 pr-4 text-sm font-medium text-foreground">{row.field}</td>
                          <td className="py-3 pr-4 text-sm text-muted-foreground font-mono">{row.poValue}</td>
                          <td className={`py-3 pr-4 text-sm font-mono ${row.match ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-400 font-semibold'}`}>
                            {row.ackValue}
                          </td>
                          <td className="py-3 text-right">
                            {row.match ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium ring-1 ring-inset ring-green-600/20">
                                <CheckCircleIcon className="w-3 h-3" />
                                Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium ring-1 ring-inset ring-amber-600/20">
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                {row.detail}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{matches} of {DELTA_ROWS.length} fields match</p>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={onAccept}
                      className="px-5 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                    >
                      Accept All Matches
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

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

interface ContactVendorsModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: () => void
}

const VENDORS = [
  { id: 'haworth', name: 'Haworth', email: 'orders@haworth.com', exceptions: 1, issue: 'Price Mismatch (+$450)' },
  { id: 'millerknoll', name: 'MillerKnoll', email: 'ack@millerknoll.com', exceptions: 1, issue: 'Delivery Date Mismatch (Late)' },
]

const MESSAGE_TEMPLATE = `Subject: Action Required — Purchase Order Discrepancy

Dear [Vendor Name],

We've identified discrepancies in your recent order acknowledgement that require your attention:

• Order Reference: [Order ID]
• Issue: [Discrepancy Details]

Please review the flagged items at your earliest convenience and submit a corrected acknowledgement through the Strata portal.

If you have questions, please contact our procurement team directly.

Best regards,
Procurement Operations
Strata Manufacturing`

export default function ContactVendorsModal({ isOpen, onClose, onSend }: ContactVendorsModalProps) {
  const [selected, setSelected] = useState<string[]>(VENDORS.map(v => v.id))
  const [isSending, setIsSending] = useState(false)

  const toggleVendor = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])
  }

  const handleSend = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      onSend()
    }, 1500)
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
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-sm font-bold text-foreground">Contact Vendors</Dialog.Title>
                      <p className="text-[11px] text-muted-foreground">{VENDORS.length} vendors with pending exceptions</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Vendor list */}
                <div className="px-6 py-4 space-y-2 border-b border-border">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Select vendors to contact</p>
                  {VENDORS.map(vendor => (
                    <div
                      key={vendor.id}
                      onClick={() => toggleVendor(vendor.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selected.includes(vendor.id)
                          ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-200/50 dark:ring-blue-800/50'
                          : 'border-border hover:border-blue-200 dark:hover:border-blue-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(vendor.id)}
                          onChange={() => {}}
                          className="rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{vendor.name}</span>
                            <span className="text-[10px] text-muted-foreground">{vendor.email}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {vendor.exceptions} exception — <span className="text-amber-600 dark:text-amber-400 font-medium">{vendor.issue}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message preview */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Message Preview</p>
                  </div>
                  <div className="bg-muted dark:bg-zinc-950 border border-border rounded-xl p-4 max-h-[160px] overflow-y-auto">
                    <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{MESSAGE_TEMPLATE}</pre>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{selected.length} vendor{selected.length !== 1 ? 's' : ''} selected</p>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Cancel
                    </button>
                    <button
                      disabled={selected.length === 0 || isSending}
                      onClick={handleSend}
                      className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${
                        selected.length > 0 && !isSending
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {isSending && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                      {isSending ? 'Sending...' : `Send Messages (${selected.length})`}
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

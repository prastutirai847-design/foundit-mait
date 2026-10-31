import { Check, Clock3, FlaskConical, X } from 'lucide-react'
import type { ClaimStatus, ItemType } from '../types'

export function TypeBadge({ type, className = '' }: { type: ItemType; className?: string }) {
  return (
    <span className={`badge ${type === 'lost' ? 'badge-lost' : 'badge-found'} ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {type === 'lost' ? 'Lost' : 'Found'}
    </span>
  )
}

export function ClaimStatusBadge({
  status,
  className = '',
}: {
  status: ClaimStatus
  className?: string
}) {
  const config = {
    pending: { label: 'Pending', className: 'badge-pending', Icon: Clock3 },
    approved: { label: 'Approved', className: 'badge-approved', Icon: Check },
    rejected: { label: 'Rejected', className: 'badge-rejected', Icon: X },
  }[status]

  return (
    <span className={`badge ${config.className} ${className}`}>
      <config.Icon aria-hidden="true" size={11} strokeWidth={2.6} />
      {config.label}
    </span>
  )
}

export function SampleBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted shadow-sm backdrop-blur ${className}`}
    >
      <FlaskConical aria-hidden="true" size={10} />
      Sample
    </span>
  )
}

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  Database,
  FileQuestion,
  Inbox,
  Info,
  Loader2,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import type { Claim, Listing } from '../types'
import { getErrorMessage } from '../api/client'
import { useFoundIt } from '../store/FoundItProvider'
import { CATEGORY_MAP, LOCATION_MAP } from '../data/constants'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  formatDateTime,
  formatRelative,
  initials,
} from '../utils/format'
import { ItemImage } from '../components/ItemImage'
import { ClaimStatusBadge, SampleBadge, TypeBadge } from '../components/Badges'
import { EmptyState } from '../components/EmptyState'
import { PageError, PageLoading } from '../components/PageState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

type ActivityTab = 'reports' | 'incoming' | 'requests'
type ReportFilter = 'all' | 'lost' | 'found'
type PendingAction =
  | { kind: 'delete'; listing: Listing }
  | { kind: 'return'; listing: Listing }
  | { kind: 'reject'; claim: Claim; listing: Listing }

const TABS: { id: ActivityTab; label: string; icon: typeof ClipboardList }[] = [
  { id: 'reports', label: 'My reports', icon: ClipboardList },
  { id: 'incoming', label: 'Incoming requests', icon: Inbox },
  { id: 'requests', label: 'My requests', icon: Send },
]

function OpenBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-found-line bg-found-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-found">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      Open
    </span>
  )
}

function ReturnedBadge() {
  return (
    <span className="badge badge-returned">
      <Check aria-hidden="true" size={11} strokeWidth={2.6} />
      Returned
    </span>
  )
}

function ReportCard({
  listing,
  pendingRequests,
  onDelete,
  onReturn,
}: {
  listing: Listing
  pendingRequests: number
  onDelete: () => void
  onReturn: () => void
}) {
  const location = LOCATION_MAP[listing.location]
  const category = CATEGORY_MAP[listing.category]
  const CategoryIcon = category.icon
  const isReturned = listing.status === 'returned'

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link
          to={`/items/${listing.id}`}
          className="block shrink-0 overflow-hidden rounded-xl focus-visible:outline-offset-4"
          aria-label={`View ${listing.name}`}
        >
          <ItemImage
            src={listing.image}
            alt={listing.imageAlt}
            category={listing.category}
            className="h-[88px] w-full rounded-xl sm:w-[116px]"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={listing.type} />
            {isReturned ? <ReturnedBadge /> : <OpenBadge />}
            {listing.isSample && <SampleBadge />}
          </div>
          <Link
            to={`/items/${listing.id}`}
            className="mt-2 block text-[15px] font-semibold leading-snug text-ink underline-offset-4 hover:underline"
          >
            {listing.name}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" size={11} />
              {location.label}
            </span>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
            <span className="inline-flex items-center gap-1">
              <CategoryIcon aria-hidden="true" size={11} />
              {category.label}
            </span>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
            <span>Reported {formatRelative(listing.createdAt)}</span>
          </p>
          {pendingRequests > 0 && (
            <Link
              to="/activity?tab=incoming"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#EBD9B6] bg-[#FBF3E2] px-2.5 py-1 text-[10.5px] font-semibold text-[#8A5A0A] transition hover:border-[#DFC595]"
            >
              <MessageSquare aria-hidden="true" size={11} />
              {pendingRequests} pending {pendingRequests === 1 ? 'request' : 'requests'}
            </Link>
          )}
          {isReturned && listing.returnedAt && (
            <p className="mt-2 text-[11px] text-ink-faint">
              Marked returned {formatRelative(listing.returnedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        <Link to={`/items/${listing.id}`} className="btn-secondary btn-small">
          <ArrowUpRight aria-hidden="true" size={13} />
          View
        </Link>
        {!isReturned && (
          <>
            <Link to={`/items/${listing.id}/edit`} className="btn-ghost btn-small">
              <Pencil aria-hidden="true" size={13} />
              Edit
            </Link>
            <button type="button" className="btn-ghost btn-small" onClick={onReturn}>
              <Check aria-hidden="true" size={13} />
              Mark returned
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="btn-ghost btn-small ml-auto text-ink-faint hover:bg-[#FBEFED] hover:text-[#9A3B2C]"
        >
          <Trash2 aria-hidden="true" size={13} />
          Delete
        </button>
      </div>
    </article>
  )
}

function IncomingCard({
  claim,
  listing,
  busy,
  onApprove,
  onReject,
  onReturn,
}: {
  claim: Claim
  listing: Listing
  busy: boolean
  onApprove: () => void
  onReject: () => void
  onReturn: () => void
}) {
  const isClaim = claim.kind === 'claim'

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-[12px] font-semibold text-accent">
            {initials(claim.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13.5px] font-semibold text-ink">{claim.name}</p>
              {claim.isSample && <SampleBadge />}
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] leading-5 text-ink-muted">
              {isClaim ? 'Claim for' : 'Lead on'}
              <Link
                to={`/items/${listing.id}`}
                className="font-medium text-ink underline-offset-4 hover:underline"
              >
                {listing.name}
              </Link>
              <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
              {formatRelative(claim.createdAt)}
            </p>
          </div>
        </div>
        <ClaimStatusBadge status={claim.status} className="w-fit shrink-0" />
      </div>

      <div className="mt-3.5 rounded-xl border border-line/80 bg-[#FBF8F2] p-3.5">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {isClaim ? 'Why they think it is theirs' : 'Where they saw it'}
        </p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">{claim.reason}</p>
        <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {isClaim ? 'Identifying details' : 'What they noticed'}
        </p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">{claim.details}</p>
      </div>

      {claim.status === 'approved' && (
        <div className="mt-3.5 rounded-xl border border-found-line bg-found-soft p-3.5">
          <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-found">
            <LockKeyhole aria-hidden="true" size={11} />
            Your private handover note
          </p>
          <p className="mt-1.5 text-[12.5px] leading-5 text-found">{listing.handover}</p>
          <p className="mt-2 text-[11px] leading-5 text-found/80">
            The approved claimant sees this note when they open the listing. Arrange the handover
            in person.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        <Link to={`/items/${listing.id}`} className="btn-secondary btn-small">
          View item
          <ArrowUpRight aria-hidden="true" size={12} />
        </Link>

        {claim.status === 'pending' && (
          <>
            <button
              type="button"
              onClick={onApprove}
              disabled={busy}
              className="btn btn-small bg-found text-white hover:bg-[#095544] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 aria-hidden="true" size={13} className="animate-spin" />
              ) : (
                <Check aria-hidden="true" size={13} strokeWidth={2.4} />
              )}
              {isClaim ? 'Approve claim' : 'Approve lead'}
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={busy}
              className="btn-ghost btn-small hover:bg-[#FBEFED] hover:text-[#9A3B2C] disabled:opacity-60"
            >
              <X aria-hidden="true" size={13} />
              Decline
            </button>
          </>
        )}

        {claim.status === 'approved' && listing.status === 'open' && (
          <button
            type="button"
            onClick={onReturn}
            disabled={busy}
            className="btn btn-small bg-ink text-white hover:bg-ink-soft disabled:opacity-60"
          >
            <Check aria-hidden="true" size={13} strokeWidth={2.4} />
            Mark item returned
          </button>
        )}

        {claim.status === 'approved' && listing.status === 'returned' && (
          <span className="inline-flex items-center gap-1.5 px-1 text-[11.5px] font-medium text-ink-muted">
            <Check aria-hidden="true" size={12} className="text-found" />
            Item marked returned
          </span>
        )}

        {claim.status === 'rejected' && (
          <span className="px-1 text-[11.5px] text-ink-faint">
            Declined{claim.decidedAt ? ` ${formatRelative(claim.decidedAt)}` : ''}
          </span>
        )}

        <span className="ml-auto text-[10.5px] text-ink-faint">
          Sent {formatDateTime(claim.createdAt)}
        </span>
      </div>
    </article>
  )
}

function MyRequestCard({ claim, listing }: { claim: Claim; listing: Listing }) {
  const location = LOCATION_MAP[listing.location]
  const isClaim = claim.kind === 'claim'

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to={`/items/${listing.id}`}
          className="block shrink-0 overflow-hidden rounded-xl focus-visible:outline-offset-4"
          aria-label={`View ${listing.name}`}
        >
          <ItemImage
            src={listing.image}
            alt={listing.imageAlt}
            category={listing.category}
            className="h-[88px] w-full rounded-xl sm:w-[116px]"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={listing.type} />
            <ClaimStatusBadge status={claim.status} />
          </div>
          <Link
            to={`/items/${listing.id}`}
            className="mt-2 block text-[15px] font-semibold leading-snug text-ink underline-offset-4 hover:underline"
          >
            {listing.name}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" size={11} />
              {location.label}
            </span>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
            <span>
              {isClaim ? 'Claim' : 'Lead'} sent {formatRelative(claim.createdAt)}
            </span>
          </p>
          <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-6 text-ink-muted">{claim.reason}</p>

          {claim.status === 'pending' && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#EBD9B6] bg-[#FBF3E2] px-2.5 py-1 text-[10.5px] font-semibold text-[#8A5A0A]">
              Waiting for the reporter to review
            </p>
          )}
          {claim.status === 'rejected' && (
            <p className="mt-3 text-[11.5px] leading-5 text-ink-faint">
              Declined by the reporter
              {claim.decidedAt ? ` ${formatRelative(claim.decidedAt)}` : ''}. The item may still be
              unclaimed —{' '}
              <Link to="/" className="font-semibold text-accent underline-offset-4 hover:underline">
                browse other reports
              </Link>
              .
            </p>
          )}
          {claim.status === 'approved' && (
            <div className="mt-3 rounded-xl border border-found-line bg-found-soft p-3.5">
              <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-found">
                <LockKeyhole aria-hidden="true" size={11} />
                Handover details
              </p>
              <p className="mt-1.5 text-[12.5px] leading-5 text-found">{listing.handover}</p>
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2 border-t border-line pt-3">
            <Link to={`/items/${listing.id}`} className="btn-secondary btn-small">
              View listing
              <ArrowRight aria-hidden="true" size={12} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ActivityPage() {
  usePageTitle('My activity')
  const {
    listings,
    claims,
    loading,
    error,
    refresh,
    setClaimStatus,
    markReturned,
    deleteListing,
  } = useFoundIt()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [busy, setBusy] = useState(false)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const rawTab = searchParams.get('tab')
  const activeTab: ActivityTab =
    rawTab === 'incoming' || rawTab === 'requests' ? rawTab : 'reports'

  const listingMap = useMemo(() => new Map(listings.map((listing) => [listing.id, listing])), [listings])

  const myListings = useMemo(
    () =>
      listings
        .filter((listing) => listing.owner === 'me')
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [listings],
  )

  const incoming = useMemo(() => {
    const statusRank = { pending: 0, approved: 1, rejected: 2 }
    return claims
      .filter((claim) => listingMap.get(claim.listingId)?.owner === 'me')
      .sort((a, b) => {
        const rank = statusRank[a.status] - statusRank[b.status]
        return rank !== 0 ? rank : Date.parse(b.createdAt) - Date.parse(a.createdAt)
      })
  }, [claims, listingMap])

  const myRequests = useMemo(
    () =>
      claims
        .filter((claim) => claim.submittedLocally && listingMap.has(claim.listingId))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [claims, listingMap],
  )

  const pendingIncoming = incoming.filter((claim) => claim.status === 'pending').length
  const lostCount = myListings.filter((listing) => listing.type === 'lost').length
  const foundCount = myListings.filter((listing) => listing.type === 'found').length
  const hasSamples =
    myListings.some((listing) => listing.isSample) || incoming.some((claim) => claim.isSample)

  const visibleReports = myListings.filter(
    (listing) => reportFilter === 'all' || listing.type === reportFilter,
  )

  const counts: Record<ActivityTab, number> = {
    reports: myListings.length,
    incoming: incoming.length,
    requests: myRequests.length,
  }

  function changeTab(tab: ActivityTab) {
    const next = new URLSearchParams(searchParams)
    if (tab === 'reports') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next, { replace: true })
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = TABS.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    const nextTab = TABS[nextIndex]
    changeTab(nextTab.id)
    window.setTimeout(() => tabRefs.current[nextTab.id]?.focus(), 0)
  }

  async function approveRequest(claim: Claim) {
    if (busy) return
    setBusy(true)
    try {
      await setClaimStatus(claim.id, 'approved')
      toast(
        claim.kind === 'claim'
          ? 'Claim approved. Arrange the handover, then mark the item returned.'
          : 'Lead approved. Arrange the handover, then mark the item returned.',
      )
    } catch (cause) {
      toast(getErrorMessage(cause), 'error')
    } finally {
      setBusy(false)
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction || busy) return
    setBusy(true)
    try {
      if (pendingAction.kind === 'delete') {
        await deleteListing(pendingAction.listing.id)
        toast('Report deleted.')
      } else if (pendingAction.kind === 'return') {
        await markReturned(pendingAction.listing.id)
        toast('Listing marked as returned.')
      } else {
        await setClaimStatus(pendingAction.claim.id, 'rejected')
        toast('Request declined.')
      }
      setPendingAction(null)
    } catch (cause) {
      toast(getErrorMessage(cause), 'error')
    } finally {
      setBusy(false)
    }
  }

  const confirmContent = (() => {
    if (!pendingAction) {
      return {
        title: '',
        description: '',
        confirmLabel: '',
        tone: 'primary' as const,
      }
    }
    if (pendingAction.kind === 'delete') {
      return {
        title: 'Delete this report?',
        description: `“${pendingAction.listing.name}” and every request attached to it will be permanently deleted from the demo database. This cannot be undone.`,
        confirmLabel: 'Delete report',
        tone: 'danger' as const,
      }
    }
    if (pendingAction.kind === 'return') {
      return {
        title: 'Mark this item as returned?',
        description: `This closes “${pendingAction.listing.name}” and declines any other pending requests. You can still view the listing.`,
        confirmLabel: 'Mark as returned',
        tone: 'primary' as const,
      }
    }
    return {
      title: 'Decline this request?',
      description: `${pendingAction.claim.name} will see the request as declined. This cannot be undone.`,
      confirmLabel: 'Decline request',
      tone: 'danger' as const,
    }
  })()

  if (loading && listings.length === 0 && claims.length === 0) {
    return <PageLoading label="Loading your activity…" />
  }

  if (error && listings.length === 0 && claims.length === 0) {
    return (
      <PageError
        title="Your activity could not load"
        message={error}
        onRetry={() => void refresh()}
      />
    )
  }

  return (
    <div className="page-shell py-8 sm:py-11">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">My activity</p>
          <h1 className="display-lg mt-2">Your corner of the board.</h1>
          <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-5 text-ink-muted">
            <Database aria-hidden="true" size={13} className="mt-0.5 shrink-0 text-ink-faint" />
            Reports and requests are stored in the FoundIt demo database. Everyone running this
            demo sees the same board.
          </p>
        </div>
        <Link to="/report" className="btn-primary w-fit shrink-0">
          <Plus aria-hidden="true" size={16} strokeWidth={2.3} />
          Report an item
        </Link>
      </div>

      {hasSamples && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-[#FBF8F2] px-4 py-3.5">
          <Info aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-ink-faint" />
          <p className="text-[11.5px] leading-5 text-ink-muted">
            Sample reports and requests are seeded into the demo database so the full review flow
            can be tried immediately. They are labelled{' '}
            <span className="font-semibold text-ink-soft">Sample</span>, and reports you own can be
            deleted at any time.
          </p>
        </div>
      )}

      <div className="no-scrollbar mt-6 flex overflow-x-auto">
        <div
          role="tablist"
          aria-label="My activity sections"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-[#F2EDE3]/70 p-1"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls="activity-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => changeTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[12.5px] font-semibold transition sm:px-4 ${
                  selected
                    ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(17,24,39,0.08)] ring-1 ring-line'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon aria-hidden="true" size={14} strokeWidth={1.9} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] tabular-nums ${
                    selected ? 'bg-accent-soft text-accent' : 'bg-[#E6DED1] text-ink-muted'
                  }`}
                >
                  {counts[tab.id]}
                </span>
                {tab.id === 'incoming' && pendingIncoming > 0 && (
                  <span className="sr-only">{pendingIncoming} pending</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <section
        role="tabpanel"
        id="activity-panel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="mt-6 focus-visible:outline-offset-4"
      >
        {activeTab === 'reports' && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-ink">Your reports</h2>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Edit details, mark a handover complete, or remove a demo report.
                </p>
              </div>
              <div
                role="group"
                aria-label="Filter your reports by type"
                className="flex gap-1.5"
              >
                {(
                  [
                    { id: 'all' as const, label: 'All', count: myListings.length },
                    { id: 'lost' as const, label: 'Lost', count: lostCount },
                    { id: 'found' as const, label: 'Found', count: foundCount },
                  ]
                ).map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={reportFilter === filter.id}
                    onClick={() => setReportFilter(filter.id)}
                    className={`chip ${
                      reportFilter === filter.id ? 'chip-active' : ''
                    } text-[12px]`}
                  >
                    {filter.label}
                    <span className="text-[10px] tabular-nums opacity-70">{filter.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {myListings.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="You haven't reported anything yet"
                  description="Put a lost or found item on the board and it will show up here with its requests."
                >
                  <Link to="/report" className="btn-primary">
                    <Plus aria-hidden="true" size={16} />
                    Report an item
                  </Link>
                  <Link to="/" className="btn-secondary">
                    Browse the board
                  </Link>
                </EmptyState>
              ) : visibleReports.length === 0 ? (
                <EmptyState
                  icon={FileQuestion}
                  title={`No ${reportFilter} reports`}
                  description={`You have ${myListings.length} ${
                    myListings.length === 1 ? 'report' : 'reports'
                  } in total, but none of that type.`}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setReportFilter('all')}
                  >
                    Show all reports
                  </button>
                </EmptyState>
              ) : (
                visibleReports.map((listing) => (
                  <ReportCard
                    key={listing.id}
                    listing={listing}
                    pendingRequests={
                      incoming.filter(
                        (claim) =>
                          claim.listingId === listing.id && claim.status === 'pending',
                      ).length
                    }
                    onDelete={() => setPendingAction({ kind: 'delete', listing })}
                    onReturn={() => setPendingAction({ kind: 'return', listing })}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'incoming' && (
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-semibold text-ink">Incoming requests</h2>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Claims on your found items and leads on your lost reports.
                </p>
              </div>
              {pendingIncoming > 0 && (
                <span className="shrink-0 rounded-full border border-[#EBD9B6] bg-[#FBF3E2] px-2.5 py-1 text-[10.5px] font-semibold text-[#8A5A0A]">
                  {pendingIncoming} pending
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {incoming.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No incoming requests yet"
                  description="When someone claims one of your found items or sends a lead on a lost report, their request will appear here for review."
                >
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => changeTab('reports')}
                  >
                    View my reports
                  </button>
                  <Link to="/report" className="btn-secondary">
                    Report an item
                  </Link>
                </EmptyState>
              ) : (
                incoming.map((claim) => {
                  const listing = listingMap.get(claim.listingId)
                  if (!listing) return null
                  return (
                    <IncomingCard
                      key={claim.id}
                      claim={claim}
                      listing={listing}
                      busy={busy}
                      onApprove={() => void approveRequest(claim)}
                      onReject={() => setPendingAction({ kind: 'reject', claim, listing })}
                      onReturn={() => setPendingAction({ kind: 'return', listing })}
                    />
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <div>
              <h2 className="text-[17px] font-semibold text-ink">My requests</h2>
              <p className="mt-1 text-[12.5px] text-ink-muted">
                Claims and leads you have sent with the demo identity.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {myRequests.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title="You haven't sent any requests"
                  description="Found a report that belongs to you? Send a claim with details only the owner would know. Its status will show up here."
                >
                  <Link to="/?type=found" className="btn-primary">
                    Browse found items
                  </Link>
                  <Link to="/report" className="btn-secondary">
                    Report an item
                  </Link>
                </EmptyState>
              ) : (
                myRequests.map((claim) => {
                  const listing = listingMap.get(claim.listingId)
                  if (!listing) return null
                  return <MyRequestCard key={claim.id} claim={claim} listing={listing} />
                })
              )}
            </div>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingAction !== null}
        title={confirmContent.title}
        description={confirmContent.description}
        confirmLabel={confirmContent.confirmLabel}
        tone={confirmContent.tone}
        busy={busy}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void confirmPendingAction()}
      />
    </div>
  )
}

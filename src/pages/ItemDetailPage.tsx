import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  FileQuestion,
  LockKeyhole,
  MapPin,
  Pencil,
  ShieldQuestion,
  Trash2,
} from 'lucide-react'
import { useFoundIt } from '../store/FoundItProvider'
import { getErrorMessage } from '../api/client'
import { CATEGORY_MAP, LOCATION_MAP } from '../data/constants'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCalendarDate, formatDateTime, formatRelative } from '../utils/format'
import { ItemImage } from '../components/ItemImage'
import { ClaimStatusBadge, SampleBadge, TypeBadge } from '../components/Badges'
import { EmptyState } from '../components/EmptyState'
import { PageError, PageLoading } from '../components/PageState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

export function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings, claims, loading, error, refresh, markReturned, deleteListing } = useFoundIt()
  const { toast } = useToast()
  const [confirmAction, setConfirmAction] = useState<'returned' | 'delete' | null>(null)
  const [busy, setBusy] = useState(false)

  const listing = listings.find((item) => item.id === id)
  usePageTitle(listing ? listing.name : 'Listing not found')

  const myClaim = useMemo(() => {
    if (!listing) return undefined
    return claims
      .filter((claim) => claim.listingId === listing.id && claim.submittedLocally)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]
  }, [claims, listing])

  const incoming = useMemo(
    () => (listing ? claims.filter((claim) => claim.listingId === listing.id) : []),
    [claims, listing],
  )

  if (!listing && loading) {
    return <PageLoading label="Loading this report…" />
  }

  if (!listing && error) {
    return (
      <PageError
        title="This report could not load"
        message={error}
        onRetry={() => void refresh()}
      />
    )
  }

  if (!listing) {
    return (
      <div className="page-shell py-16 sm:py-24">
        <EmptyState
          icon={FileQuestion}
          title="This listing is no longer here"
          headingLevel={1}
          description="It may have been deleted, or the link may be incomplete."
        >
          <Link to="/" className="btn-primary">
            Back to Discover
          </Link>
          <Link to="/report" className="btn-secondary">
            Report an item
          </Link>
        </EmptyState>
      </div>
    )
  }

  const category = CATEGORY_MAP[listing.category]
  const location = LOCATION_MAP[listing.location]
  const CategoryIcon = category.icon
  const isOwner = listing.owner === 'me'
  const isReturned = listing.status === 'returned'
  const pendingCount = incoming.filter((claim) => claim.status === 'pending').length
  const actionNoun = listing.type === 'found' ? 'Claim this item' : 'I found this item'

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('Listing link copied.')
    } catch {
      toast('Could not copy the link. You can copy it from the address bar.', 'error')
    }
  }

  const handleMarkReturned = async () => {
    setBusy(true)
    try {
      await markReturned(listing.id)
      setConfirmAction(null)
      toast('Listing marked as returned.')
    } catch (cause) {
      toast(getErrorMessage(cause), 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteListing(listing.id)
      setConfirmAction(null)
      toast('Report deleted.')
      navigate('/activity?tab=reports')
    } catch (cause) {
      toast(getErrorMessage(cause), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full text-[12.5px] font-medium text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={14} />
          Back to Discover
        </Link>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[11.5px] font-semibold text-ink-muted transition hover:border-[#D5CCBD] hover:text-ink"
        >
          <Copy aria-hidden="true" size={13} />
          Copy link
        </button>
      </div>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-3xl border border-line bg-surface p-2 shadow-card">
            <div className="relative overflow-hidden rounded-[20px]">
              <ItemImage
                src={listing.image}
                alt={listing.imageAlt}
                category={listing.category}
                priority
                className="aspect-[4/3] w-full"
              />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                <TypeBadge type={listing.type} className="shadow-sm" />
                {listing.isSample && <SampleBadge />}
              </div>
              {isReturned && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-ink/80 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                  <Check aria-hidden="true" size={12} strokeWidth={2.6} />
                  Returned to owner
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-line bg-[#FBF8F2] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted">
              <ShieldQuestion aria-hidden="true" size={15} />
            </span>
            <p className="text-[11.5px] leading-5 text-ink-muted">
              FoundIt does not verify ownership. The reporter reviews each request, and handovers
              are arranged in person on campus.
            </p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={listing.type} />
            <span className="badge border-line bg-[#F5F0E7] text-ink-muted">
              <CategoryIcon aria-hidden="true" size={11} />
              {category.label}
            </span>
            {isReturned && (
              <span className="badge badge-returned">
                <Check aria-hidden="true" size={11} strokeWidth={2.6} />
                Returned
              </span>
            )}
            {listing.isSample && <SampleBadge />}
          </div>

          <h1 className="display-lg mt-4">{listing.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" size={13} />
              {location.label}
            </span>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
            <span>Reported {formatRelative(listing.createdAt)}</span>
          </p>

          <p className="mt-5 text-[14.5px] leading-7 text-ink-muted">{listing.description}</p>

          <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="border-b border-r border-line p-4">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                Campus location
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <MapPin aria-hidden="true" size={13} className="text-ink-faint" />
                {location.label}
              </dd>
            </div>
            <div className="border-b border-line p-4">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                {listing.type === 'lost' ? 'Date lost' : 'Date found'}
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <CalendarDays aria-hidden="true" size={13} className="text-ink-faint" />
                {formatCalendarDate(listing.eventDate)}
              </dd>
            </div>
            <div className="border-r border-line p-4">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                Reported on
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                <Clock3 aria-hidden="true" size={13} className="shrink-0 text-ink-faint" />
                {formatDateTime(listing.createdAt)}
              </dd>
            </div>
            <div className="p-4">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                Listing status
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${isReturned ? 'bg-ink-faint' : 'bg-found'}`}
                />
                {isReturned ? 'Returned to owner' : 'Open'}
              </dd>
            </div>
          </dl>

          {listing.isSample && (
            <p className="mt-4 rounded-xl border border-line bg-[#FBF8F2] px-3.5 py-3 text-[11.5px] leading-5 text-ink-muted">
              This is a sample report seeded into the FoundIt demo database. It exists so the full
              review flow can be explored without inventing a real listing.
            </p>
          )}

          {isReturned ? (
            <div className="mt-6 rounded-2xl border border-found-line bg-found-soft p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-found">
                  <Check aria-hidden="true" size={17} strokeWidth={2.6} />
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-found">Returned to owner</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-found/85">
                    This listing is closed.
                    {listing.returnedAt
                      ? ` Marked returned on ${formatCalendarDate(listing.returnedAt.slice(0, 10))}.`
                      : ''}
                  </p>
                  <Link
                    to="/"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-found underline-offset-4 hover:underline"
                  >
                    Browse open reports
                    <ArrowRight aria-hidden="true" size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ) : isOwner ? (
            <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Your report</p>
                  <p className="mt-1 text-[14px] font-semibold text-ink">
                    {pendingCount > 0
                      ? `${pendingCount} pending ${pendingCount === 1 ? 'request' : 'requests'}`
                      : incoming.length > 0
                        ? 'Requests reviewed'
                        : 'No requests yet'}
                  </p>
                </div>
                <span className="rounded-full border border-line bg-[#FBF8F2] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Owner
                </span>
              </div>
              <p className="mt-2 text-[12.5px] leading-5 text-ink-muted">
                {pendingCount > 0
                  ? 'Open My activity to read the details and approve or decline each request.'
                  : 'New claims or leads for this item will appear in My activity.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/activity?tab=incoming"
                  className="btn-primary btn-small justify-center"
                >
                  {incoming.length > 0 ? 'Review requests' : 'Go to My activity'}
                  <ArrowRight aria-hidden="true" size={13} />
                </Link>
                <Link
                  to={`/items/${listing.id}/edit`}
                  className="btn-secondary btn-small justify-center"
                >
                  <Pencil aria-hidden="true" size={13} />
                  Edit report
                </Link>
                <button
                  type="button"
                  className="btn-secondary btn-small justify-center"
                  onClick={() => setConfirmAction('returned')}
                >
                  <Check aria-hidden="true" size={13} />
                  Mark returned
                </button>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAction('delete')}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[11.5px] font-medium text-ink-faint transition hover:text-[#9A3B2C]"
              >
                <Trash2 aria-hidden="true" size={12} />
                Delete this report
              </button>
              <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[11px] text-ink-faint">
                <LockKeyhole aria-hidden="true" size={11} />
                Your handover note stays private. View it in My activity.
              </p>
            </div>
          ) : myClaim ? (
            <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="eyebrow">Your {listing.type === 'found' ? 'claim' : 'lead'}</p>
                <ClaimStatusBadge status={myClaim.status} />
              </div>
              <p className="mt-2 text-[12.5px] leading-5 text-ink-muted">
                {myClaim.status === 'pending'
                  ? 'Sent and waiting for the reporter to review. You can check the status in My activity.'
                  : myClaim.status === 'approved'
                    ? 'Approved by the reporter. Use the handover details below to arrange collection.'
                    : 'The reporter declined this request. You can browse other open reports.'}
              </p>
              {myClaim.status === 'approved' && (
                <div className="mt-4 rounded-xl border border-found-line bg-found-soft p-3.5">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-found">
                    <LockKeyhole aria-hidden="true" size={11} />
                    Handover details
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-found">{listing.handover}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/activity?tab=requests" className="btn-primary btn-small justify-center">
                  Track in My activity
                  <ArrowRight aria-hidden="true" size={13} />
                </Link>
                <Link to="/" className="btn-ghost btn-small justify-center">
                  Browse items
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-line bg-[#FCFAF6] p-5">
              <p className="text-[14px] font-semibold text-ink">
                {listing.type === 'found' ? 'Is this yours?' : 'Have you seen this item?'}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-5 text-ink-muted">
                {listing.type === 'found'
                  ? 'Send a claim with details only the owner would know. The reporter decides whether to approve it.'
                  : 'Send a lead with where and when you spotted it. The reporter will review your note.'}
              </p>
              <Link
                to={`/items/${listing.id}/claim`}
                className="btn-primary mt-4 w-full justify-center py-3"
              >
                {actionNoun}
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-ink-faint">
                <LockKeyhole aria-hidden="true" size={11} className="mt-0.5 shrink-0" />
                Contact details and handover notes are never shown publicly.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === 'returned'}
        title="Mark this item as returned?"
        description="This closes the listing, marks it as returned and declines any other pending requests. You can still view it in My activity."
        confirmLabel="Mark as returned"
        busy={busy}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void handleMarkReturned()}
      />

      <ConfirmDialog
        open={confirmAction === 'delete'}
        title="Delete this report?"
        description="The listing and all its requests will be permanently deleted from the demo database. This cannot be undone."
        confirmLabel="Delete report"
        cancelLabel="Keep report"
        tone="danger"
        busy={busy}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void handleDelete()}
      />

    </div>
  )
}

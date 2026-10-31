import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileQuestion,
  Loader2,
  LockKeyhole,
  MapPin,
  Send,
  ShieldCheck,
} from 'lucide-react'
import type { Claim } from '../types'
import { useFoundIt } from '../store/FoundItProvider'
import { CATEGORY_MAP, LOCATION_MAP } from '../data/constants'
import { usePageTitle } from '../hooks/usePageTitle'
import { ItemImage } from '../components/ItemImage'
import { ClaimStatusBadge, TypeBadge } from '../components/Badges'
import { EmptyState } from '../components/EmptyState'
import { FormField, describedBy } from '../components/FormField'
import { formatDateTime } from '../utils/format'

interface FormState {
  name: string
  reason: string
  details: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const ERROR_FOCUS: Record<keyof FormState, string> = {
  name: 'claim-name',
  reason: 'claim-reason',
  details: 'claim-details',
}

export function ClaimPage() {
  const { id } = useParams()
  const { listings, claims, addClaim } = useFoundIt()
  const listing = listings.find((item) => item.id === id)
  const [form, setForm] = useState<FormState>({ name: '', reason: '', details: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Claim | null>(null)

  usePageTitle(
    submitted
      ? listing?.type === 'found'
        ? 'Claim sent'
        : 'Lead sent'
      : listing
        ? listing.type === 'found'
          ? `Claim ${listing.name}`
          : `Found ${listing.name}`
        : 'Request unavailable',
  )

  if (!listing) {
    return (
      <div className="page-shell py-16 sm:py-24">
        <EmptyState
          icon={FileQuestion}
          title="This listing is no longer here"
          headingLevel={1}
          description="It may have been deleted from this browser, or the link may be incomplete."
        >
          <Link to="/" className="btn-primary">
            Back to Discover
          </Link>
        </EmptyState>
      </div>
    )
  }

  const listingId = listing.id
  const isClaim = listing.type === 'found'
  const location = LOCATION_MAP[listing.location]
  const category = CATEGORY_MAP[listing.category]
  const existingClaim = claims
    .filter((claim) => claim.listingId === listing.id && claim.submittedLocally)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]

  if (submitted) {
    return (
      <div className="page-shell flex min-h-[calc(100vh-68px)] items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-xl animate-fade-up">
          <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card sm:p-9">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-found-line bg-found-soft text-found">
              <Send aria-hidden="true" size={23} strokeWidth={2.2} />
            </span>
            <div className="mt-5 flex justify-center">
              <ClaimStatusBadge status="pending" />
            </div>
            <h1 className="display-lg mt-3">
              {isClaim ? 'Claim sent.' : 'Lead sent.'}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-6 text-ink-muted">
              {isClaim
                ? `Your request for “${listing.name}” is waiting for the reporter to review it. Check My activity for the decision.`
                : `Your note about “${listing.name}” is waiting for the reporter to review it. Check My activity for an update.`}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link to="/activity?tab=requests" className="btn-primary justify-center">
                Track in My activity
              </Link>
              <Link to={`/items/${listing.id}`} className="btn-secondary justify-center">
                Back to listing
              </Link>
            </div>
            <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-line pt-4 text-[11.5px] leading-5 text-ink-faint">
              <LockKeyhole aria-hidden="true" size={12} className="shrink-0" />
              This request is stored in this browser. The reporter is not notified outside it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (listing.owner === 'me') {
    return (
      <div className="page-shell py-16">
        <EmptyState
          icon={LockKeyhole}
          title="This is your own report"
          headingLevel={1}
          description="Claims and leads for your reports are reviewed from My activity, where you can approve or decline each request."
        >
          <Link to="/activity?tab=incoming" className="btn-primary">
            Review requests
          </Link>
          <Link to={`/items/${listing.id}`} className="btn-secondary">
            Back to listing
          </Link>
        </EmptyState>
      </div>
    )
  }

  if (listing.status === 'returned') {
    return (
      <div className="page-shell py-16">
        <EmptyState
          icon={Check}
          title="This item has been returned"
          headingLevel={1}
          description="The reporter has closed this listing, so new requests are not being accepted."
        >
          <Link to="/" className="btn-primary">
            Browse open reports
          </Link>
        </EmptyState>
      </div>
    )
  }

  if (existingClaim) {
    return (
      <div className="page-shell py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <Link
            to={`/items/${listing.id}`}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted transition hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back to listing
          </Link>
          <div className="mt-5 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow">Your {isClaim ? 'claim' : 'lead'}</p>
              <ClaimStatusBadge status={existingClaim.status} />
            </div>
            <h1 className="display-md mt-3">You already sent a request.</h1>
            <p className="mt-2 text-[13px] leading-6 text-ink-muted">
              {existingClaim.status === 'pending'
                ? 'The reporter has not reviewed it yet. You can keep track of it in My activity.'
                : existingClaim.status === 'approved'
                  ? 'This request was approved. You can find the private handover details on the listing and in My activity.'
                  : 'This request was declined by the reporter. If you think this was a mistake, use your campus channels to follow up.'}
            </p>
            <blockquote className="mt-5 rounded-xl border border-line bg-[#FBF8F2] p-4 text-[12.5px] leading-6 text-ink-soft">
              {existingClaim.reason}
            </blockquote>
            <p className="mt-2 text-[11px] text-ink-faint">
              Sent {formatDateTime(existingClaim.createdAt)}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link to="/activity?tab=requests" className="btn-primary justify-center">
                Open My activity
              </Link>
              <Link to={`/items/${listing.id}`} className="btn-secondary justify-center">
                View listing
              </Link>
            </div>
            {existingClaim.status === 'approved' && (
              <div className="mt-5 rounded-xl border border-found-line bg-found-soft p-3.5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-found">
                  <LockKeyhole aria-hidden="true" size={11} />
                  Handover details
                </p>
                <p className="mt-1.5 text-[12.5px] leading-5 text-found">{listing.handover}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setSubmitError(null)
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (form.name.trim().length < 2) next.name = 'Add the name the reporter should see.'
    else if (form.name.trim().length > 60) next.name = 'Keep your name under 60 characters.'
    if (form.reason.trim().length < 20)
      next.reason = isClaim
        ? 'Add at least 20 characters explaining why this is yours.'
        : 'Add at least 20 characters about where and when you saw it.'
    else if (form.reason.trim().length > 500) next.reason = 'Keep this under 500 characters.'
    if (form.details.trim().length < 10)
      next.details = 'Add at least 10 characters of identifying or helpful detail.'
    else if (form.details.trim().length > 400) next.details = 'Keep this under 400 characters.'
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstKey = Object.keys(nextErrors)[0] as keyof FormErrors
      window.setTimeout(() => document.getElementById(ERROR_FOCUS[firstKey])?.focus(), 0)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      const claim = addClaim({
        listingId,
        kind: isClaim ? 'claim' : 'lead',
        name: form.name.trim(),
        reason: form.reason.trim(),
        details: form.details.trim(),
      })
      setSubmitted(claim)
      window.scrollTo(0, 0)
    } catch {
      setSubmitError('The request could not be saved. Please try again.')
      setSubmitting(false)
    }
  }

  const reasonHint = `${form.reason.length}/500 characters`
  const detailsHint = `${form.details.length}/400 characters`
  const reasonPlaceholder = isClaim
    ? 'e.g. I lost these in Lab 2 on Thursday and can describe the small scuff near the hinge.'
    : 'e.g. I saw this at the library return trolley around 5 PM and handed it to the front desk.'
  const detailsPlaceholder = isClaim
    ? 'e.g. The left earcup has a scuff, the headband is stretched, and the cable has a red tie.'
    : 'e.g. Navy cover, white spiral, my name is on the inside cover.'
  const detailsLabel = isClaim ? 'Distinctive identifying details' : 'Anything else that helps'
  const CategoryIcon = category.icon

  return (
    <div className="page-shell py-8 sm:py-11">
      <Link
        to={`/items/${listing.id}`}
        className="inline-flex items-center gap-1.5 rounded-full text-[12.5px] font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={14} />
        Back to listing
      </Link>

      <div className="mt-6 max-w-2xl">
        <p className="eyebrow">{isClaim ? 'Claim request' : 'Found item lead'}</p>
        <h1 className="display-lg mt-2">
          {isClaim ? 'Tell them what you know.' : 'Share where you saw it.'}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-ink-muted">
          {isClaim
            ? 'Describe details only the real owner would know. The reporter reviews every claim and decides what happens next.'
            : 'Tell the reporter where and when you spotted the item. They will review your note and decide how to proceed.'}
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex gap-3.5">
              <ItemImage
                src={listing.image}
                alt={listing.imageAlt}
                category={listing.category}
                className="h-[76px] w-[92px] shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <TypeBadge type={listing.type} />
                <p className="mt-1.5 truncate text-[13px] font-semibold text-ink">{listing.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-muted">
                  <MapPin aria-hidden="true" size={11} />
                  {location.label}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-faint">
                  <CategoryIcon aria-hidden="true" size={11} />
                  {category.label}
                </p>
              </div>
            </div>
            <Link
              to={`/items/${listing.id}`}
              className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11.5px] font-semibold text-ink-muted transition hover:text-ink"
            >
              View full listing
              <ArrowRight aria-hidden="true" size={13} />
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-[#FBF8F2] p-5">
            <h2 className="text-[13px] font-semibold text-ink">How review works</h2>
            <ol className="mt-3.5 space-y-3">
              {[
                'The reporter reads your note.',
                'They approve or decline the request.',
                'If approved, handover details appear in My activity.',
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-2.5 text-[12px] leading-5 text-ink-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[10px] font-semibold text-ink-muted">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="flex items-start gap-2 px-1 text-[11.5px] leading-5 text-ink-faint">
            <ShieldCheck aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
            No automatic approval. Never share ID numbers or financial details in a request.
          </p>
        </aside>

        <div className="order-2 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7 lg:order-1">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormField
              id="claim-name"
              label="Your name"
              required
              error={errors.name}
              hint="Only the reporter sees this, in My activity on this browser."
            >
              <input
                id="claim-name"
                type="text"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                required
                maxLength={60}
                autoComplete="name"
                placeholder="e.g. Ananya Sharma"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy('claim-name', errors.name, 'Only the reporter sees this, in My activity on this browser.')}
                className="field-control"
              />
            </FormField>

            <FormField
              id="claim-reason"
              label={
                isClaim ? 'Why do you believe this item is yours?' : 'Where and when did you see it?'
              }
              required
              error={errors.reason}
              hint={reasonHint}
            >
              <textarea
                id="claim-reason"
                rows={4}
                value={form.reason}
                onChange={(event) => update('reason', event.target.value)}
                required
                maxLength={500}
                placeholder={reasonPlaceholder}
                aria-invalid={Boolean(errors.reason)}
                aria-describedby={describedBy('claim-reason', errors.reason, reasonHint)}
                className="field-control resize-y leading-6"
              />
            </FormField>

            <FormField
              id="claim-details"
              label={detailsLabel}
              required
              error={errors.details}
              hint={detailsHint}
            >
              <textarea
                id="claim-details"
                rows={3}
                value={form.details}
                onChange={(event) => update('details', event.target.value)}
                required
                maxLength={400}
                placeholder={detailsPlaceholder}
                aria-invalid={Boolean(errors.details)}
                aria-describedby={describedBy('claim-details', errors.details, detailsHint)}
                className="field-control resize-y leading-6"
              />
            </FormField>

            <div className="rounded-xl border border-line bg-[#FBF8F2] p-3.5">
              <p className="flex items-start gap-2 text-[11.5px] leading-5 text-ink-muted">
                <LockKeyhole aria-hidden="true" size={12} className="mt-0.5 shrink-0" />
                Your name and note are shown to the reporter in My activity in this browser. They
                are not posted publicly or shared outside this device.
              </p>
            </div>

            {submitError && (
              <p role="alert" className="rounded-xl border border-[#EAD6D2] bg-[#FBEFED] px-3.5 py-3 text-[12.5px] text-[#8C3220]">
                {submitError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row sm:justify-end">
              <Link to={`/items/${listing.id}`} className="btn-ghost justify-center py-2.5 text-[13px]">
                Cancel
              </Link>
              <button type="submit" className="btn-primary justify-center py-2.5" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    {isClaim ? 'Send claim request' : 'Send lead to reporter'}
                    <Send aria-hidden="true" size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

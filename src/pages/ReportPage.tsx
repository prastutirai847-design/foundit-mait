import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Database, MapPin, Plus } from 'lucide-react'
import type { Listing } from '../types'
import { useFoundIt } from '../store/FoundItProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { ListingForm } from '../components/ListingForm'
import { ReportAside } from '../components/ReportAside'
import { ItemImage } from '../components/ItemImage'
import { SampleBadge, TypeBadge } from '../components/Badges'
import { LOCATION_MAP } from '../data/constants'
import { formatRelative } from '../utils/format'

function SuccessPanel({ listing, onReset }: { listing: Listing; onReset: () => void }) {
  const location = LOCATION_MAP[listing.location]

  return (
    <div className="page-shell flex min-h-[calc(100vh-68px)] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-xl animate-fade-up">
        <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card sm:p-9">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-found-line bg-found-soft text-found">
            <Check aria-hidden="true" size={26} strokeWidth={2.4} />
          </span>
          <p className="eyebrow mt-5">Report published</p>
          <h1 className="display-lg mt-2">You&apos;re on the board.</h1>
          <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-6 text-ink-muted">
            {listing.type === 'found'
              ? 'Anyone can now browse this found item. Claim requests will appear in My activity for you to review.'
              : 'Anyone can now browse this lost item. Leads and sightings will appear in My activity.'}
          </p>

          <Link
            to={`/items/${listing.id}`}
            className="mt-7 flex items-center gap-3.5 rounded-2xl border border-line bg-[#FBF8F2] p-3 text-left transition hover:border-[#D5CCBD] hover:bg-[#F8F3EA]"
          >
            <ItemImage
              src={listing.image}
              alt={listing.imageAlt}
              category={listing.category}
              className="h-[72px] w-[88px] shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <TypeBadge type={listing.type} />
                <SampleBadge className={listing.isSample ? '' : 'hidden'} />
              </div>
              <p className="mt-1.5 truncate text-[13.5px] font-semibold text-ink">{listing.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                <MapPin aria-hidden="true" size={11} />
                {location.label} · {formatRelative(listing.createdAt)}
              </p>
            </div>
            <ArrowRight aria-hidden="true" size={16} className="shrink-0 text-ink-faint" />
          </Link>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link to={`/items/${listing.id}`} className="btn-primary justify-center">
              View your listing
            </Link>
            <Link to="/activity?tab=reports" className="btn-secondary justify-center">
              Go to My activity
            </Link>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-semibold text-ink-muted transition hover:text-ink"
          >
            <Plus aria-hidden="true" size={14} />
            Report another item
          </button>

          <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-line pt-4 text-[11.5px] text-ink-faint">
            <Database aria-hidden="true" size={12} />
            Saved to the demo database. Anyone using this demo can see the listing.
          </p>
        </div>
        <p className="mt-4 text-center text-[12px] text-ink-faint">
          <Link to="/" className="link-quiet">
            Back to Discover
          </Link>
        </p>
      </div>
    </div>
  )
}

export function ReportPage() {
  usePageTitle('Report an item')
  const { addListing } = useFoundIt()
  const [created, setCreated] = useState<Listing | null>(null)

  if (created) {
    return <SuccessPanel listing={created} onReset={() => setCreated(null)} />
  }

  return (
    <div className="page-shell py-8 sm:py-11">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-full text-[12.5px] font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={14} />
        Back to Discover
      </Link>

      <div className="mt-6 max-w-2xl">
        <p className="eyebrow">Report an item</p>
        <h1 className="display-lg mt-2">Put it on the board.</h1>
        <p className="mt-3 text-[14px] leading-6 text-ink-muted">
          A few clear details go a long way. Your report is saved to the FoundIt demo API and appears
          in Discover right away.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
          <ListingForm
            submitLabel="Publish report"
            cancelTo="/"
            onSubmit={async (draft) => {
              const listing = await addListing(draft)
              setCreated(listing)
              window.scrollTo(0, 0)
            }}
          />
        </div>
        <ReportAside />
      </div>
    </div>
  )
}

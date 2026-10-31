import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileQuestion, LockKeyhole } from 'lucide-react'
import { useFoundIt } from '../store/FoundItProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { ListingForm } from '../components/ListingForm'
import { ReportAside } from '../components/ReportAside'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'

export function EditListingPage() {
  const { id } = useParams()
  const { listings, updateListing } = useFoundIt()
  const { toast } = useToast()
  const navigate = useNavigate()
  const listing = listings.find((item) => item.id === id)

  usePageTitle(listing ? `Edit ${listing.name}` : 'Report unavailable')

  if (!listing) {
    return (
      <div className="page-shell py-16">
        <EmptyState
          icon={FileQuestion}
          title="That report isn't here"
          headingLevel={1}
          description="It may have been deleted in this browser, or the link is incomplete."
        >
          <Link to="/" className="btn-primary">
            Back to Discover
          </Link>
        </EmptyState>
      </div>
    )
  }

  if (listing.owner !== 'me') {
    return (
      <div className="page-shell py-16">
        <EmptyState
          icon={LockKeyhole}
          title="This report is read-only"
          headingLevel={1}
          description="Only the student who created a report can edit it. Sample reports by the demo reporter can be viewed but not changed."
        >
          <Link to={`/items/${listing.id}`} className="btn-primary">
            View the listing
          </Link>
          <Link to="/activity" className="btn-secondary">
            Go to My activity
          </Link>
        </EmptyState>
      </div>
    )
  }

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
        <p className="eyebrow">Edit report</p>
        <h1 className="display-lg mt-2">Keep it accurate.</h1>
        <p className="mt-3 text-[14px] leading-6 text-ink-muted">
          Update the details below. Changes are reflected in Discover and your listing immediately.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
          <ListingForm
            key={listing.id}
            initial={listing}
            submitLabel="Save changes"
            cancelTo={`/items/${listing.id}`}
            onSubmit={(draft) => {
              updateListing(listing.id, draft)
              toast('Report updated.')
              navigate(`/items/${listing.id}`)
            }}
          />
        </div>
        <ReportAside />
      </div>
    </div>
  )
}

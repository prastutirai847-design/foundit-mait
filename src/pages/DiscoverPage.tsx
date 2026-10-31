import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Handshake,
  HardDrive,
  MapPin,
  MessagesSquare,
  PackageOpen,
  PenLine,
  Plus,
  SearchX,
  ShieldCheck,
} from 'lucide-react'
import { useFoundIt } from '../store/FoundItProvider'
import { CATEGORY_MAP, LOCATION_MAP } from '../data/constants'
import { isCategoryId, isLocationId } from '../data/storage'
import type { CategoryId, ItemType, LocationId, SortOrder } from '../types'
import { formatRelative } from '../utils/format'
import { BrowseFilters } from '../components/BrowseFilters'
import { ItemCard } from '../components/ItemCard'
import { ItemImage } from '../components/ItemImage'
import { EmptyState } from '../components/EmptyState'
import { SampleBadge, TypeBadge } from '../components/Badges'
import { usePageTitle } from '../hooks/usePageTitle'

type TypeFilter = ItemType | 'all'
type CategoryFilter = CategoryId | 'all'
type LocationFilter = LocationId | 'all'

const steps = [
  {
    icon: PenLine,
    title: 'Report it',
    text: 'Add a lost or found item with a clear description and a private handover note.',
  },
  {
    icon: MessagesSquare,
    title: 'Review requests',
    text: 'Claims and leads land in My activity, where the reporter can approve or decline.',
  },
  {
    icon: Handshake,
    title: 'Meet and hand over',
    text: 'Arrange a handover on campus, then mark the listing as returned.',
  },
]

export function DiscoverPage() {
  usePageTitle()

  const { listings } = useFoundIt()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const rawType = searchParams.get('type')
  const type: TypeFilter = rawType === 'lost' || rawType === 'found' ? rawType : 'all'
  const rawCategory = searchParams.get('category')
  const category: CategoryFilter = isCategoryId(rawCategory) ? rawCategory : 'all'
  const rawLocation = searchParams.get('location')
  const location: LocationFilter = isLocationId(rawLocation) ? rawLocation : 'all'
  const sort: SortOrder = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest'

  const hasFilters = Boolean(query || type !== 'all' || category !== 'all' || location !== 'all' || sort !== 'newest')

  const filteredListings = useMemo(() => {
    const needle = query.trim().toLowerCase()

    const matches = listings.filter((listing) => {
      if (type !== 'all' && listing.type !== type) return false
      if (category !== 'all' && listing.category !== category) return false
      if (location !== 'all' && listing.location !== location) return false
      if (!needle) return true

      const haystack = [
        listing.name,
        listing.description,
        CATEGORY_MAP[listing.category].label,
        LOCATION_MAP[listing.location].label,
        listing.type,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })

    return [...matches].sort((a, b) => {
      const difference = Date.parse(b.createdAt) - Date.parse(a.createdAt)
      return sort === 'newest' ? difference : -difference
    })
  }, [listings, query, type, category, location, sort])

  const featured = useMemo(() => {
    const preferred = listings.find(
      (listing) => listing.id === 'sample-headphones' && listing.status === 'open',
    )
    return (
      preferred ??
      listings.find((listing) => listing.status === 'open' && listing.type === 'found') ??
      listings.find((listing) => listing.status === 'open') ??
      listings[0]
    )
  }, [listings])

  const featuredLocation = featured ? LOCATION_MAP[featured.location] : null

  function setParam(key: string, value: string, defaultValue: string) {
    const next = new URLSearchParams(searchParams)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return (
    <>
      <section className="page-shell pt-10 sm:pt-14 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/75 px-3.5 py-1.5 text-[11px] font-medium text-ink-muted">
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-found opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-found" />
              </span>
              A student-built lost &amp; found for MAIT
            </p>

            <h1 className="display-xl mt-5">
              Lost something on campus?
              <span className="mt-1 block italic text-accent">Let&apos;s find it.</span>
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-ink-muted">
              Report what&apos;s missing, browse what&apos;s been found, and coordinate a safe
              handover — in one calm place instead of a dozen chat forwards.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/report" className="btn-primary px-6 py-3.5">
                <Plus aria-hidden="true" size={17} strokeWidth={2.3} />
                Report an item
              </Link>
              <a href="#browse" className="btn-secondary px-6 py-3.5">
                Browse items
                <ArrowDown aria-hidden="true" size={16} />
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-[12px] text-ink-muted">
              {['No account needed', 'Private handover notes', 'Built for campus handovers'].map(
                (item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check aria-hidden="true" size={12.5} strokeWidth={2.4} className="text-found" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[540px] lg:mx-0">
            <div
              aria-hidden="true"
              className="absolute -inset-2.5 -z-10 rounded-[34px] border border-line/80 bg-[#F2ECE1]"
            />
            {featured && featuredLocation ? (
              <div className="animate-fade-up [animation-delay:120ms]">
                <div className="overflow-hidden rounded-[28px] border border-line bg-surface p-2 shadow-lift">
                  <div className="relative overflow-hidden rounded-[22px]">
                    <ItemImage
                      src={featured.image}
                      alt={featured.imageAlt}
                      category={featured.category}
                      priority
                      className="aspect-[5/4] w-full"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                      <TypeBadge type={featured.type} className="shadow-sm" />
                      {featured.isSample && <SampleBadge />}
                    </div>
                  </div>
                  <Link
                    to={`/items/${featured.id}`}
                    className="group flex items-center justify-between gap-4 px-3.5 py-4 sm:px-4"
                  >
                    <div className="min-w-0">
                      <p className="eyebrow">
                        {featured.type === 'found' ? 'Recently found' : 'Recently lost'}
                      </p>
                      <p className="mt-1.5 truncate text-[15px] font-semibold text-ink">
                        {featured.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-muted">
                        <MapPin aria-hidden="true" size={12} />
                        {featuredLocation.label}
                        <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
                        {formatRelative(featured.createdAt)}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">
                      <ArrowUpRight aria-hidden="true" size={17} />
                    </span>
                  </Link>
                </div>
                <p className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-line bg-[#FBF8F2]/85 px-4 py-3 text-center text-[11.5px] leading-5 text-ink-muted">
                  <ShieldCheck aria-hidden="true" size={14} className="shrink-0 text-found" />
                  Every request is reviewed by the reporter before a handover.
                </p>
              </div>
            ) : (
              <div className="texture-paper flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-line bg-surface p-8 text-center shadow-lift">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-canvas text-ink-muted">
                  <PackageOpen aria-hidden="true" size={24} />
                </span>
                <p className="mt-4 font-display text-[22px] text-ink">The board is empty</p>
                <p className="mt-2 max-w-xs text-[13px] leading-6 text-ink-muted">
                  Start with something you&apos;ve lost or found on campus.
                </p>
                <Link to="/report" className="btn-primary mt-5">
                  <Plus aria-hidden="true" size={16} />
                  Report an item
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="page-shell mt-14 sm:mt-16" aria-label="How FoundIt works">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface/70">
          <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex gap-3.5 p-5 sm:p-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink-muted">
                    <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="flex items-baseline gap-2 text-[13.5px] font-semibold text-ink">
                      <span className="text-[10px] font-semibold tabular-nums text-ink-faint">
                        0{index + 1}
                      </span>
                      {step.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-5 text-ink-muted">{step.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="browse" className="page-shell mt-16 scroll-mt-24 sm:mt-20" aria-labelledby="browse-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">The board</p>
            <h2 id="browse-heading" className="display-lg mt-2">
              Recent reports
            </h2>
            <p className="mt-2 max-w-xl text-[13.5px] leading-6 text-ink-muted">
              Sample reports are included so you can explore. Anything you add is saved in this
              browser only.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[11.5px] font-medium text-ink-muted">
            <HardDrive aria-hidden="true" size={13} className="text-ink-faint" />
            Browser-local prototype
          </div>
        </div>

        <div className="mt-7">
          <BrowseFilters
            query={query}
            type={type}
            category={category}
            location={location}
            sort={sort}
            hasFilters={hasFilters}
            onQueryChange={(value) => setParam('q', value, '')}
            onTypeChange={(value) => setParam('type', value, 'all')}
            onCategoryChange={(value) => setParam('category', value, 'all')}
            onLocationChange={(value) => setParam('location', value, 'all')}
            onSortChange={(value) => setParam('sort', value, 'newest')}
            onClear={clearFilters}
          />
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <p className="text-[13px] text-ink-muted">
            Showing <span className="font-semibold text-ink">{filteredListings.length}</span>{' '}
            {filteredListings.length === 1 ? 'report' : 'reports'}
            {hasFilters ? ' matching your filters' : ' from this browser'}
          </p>
          <p aria-live="polite" className="sr-only">
            {filteredListings.length} {filteredListings.length === 1 ? 'report' : 'reports'} found.
          </p>
        </div>

        {filteredListings.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ItemCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="The board is empty"
            description="No reports have been added in this browser yet. Be the first to put a lost or found item on the board."
          >
            <Link to="/report" className="btn-primary">
              <Plus aria-hidden="true" size={16} />
              Report an item
            </Link>
          </EmptyState>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No reports match these filters"
            description="Try a different keyword, widen the location, or clear the filters to see everything on the board."
          >
            <button type="button" onClick={clearFilters} className="btn-primary">
              Clear filters
            </button>
            <Link to="/report" className="btn-secondary">
              Report an item
            </Link>
          </EmptyState>
        )}
      </section>
    </>
  )
}

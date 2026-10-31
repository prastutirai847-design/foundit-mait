import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, MapPin } from 'lucide-react'
import type { Listing } from '../types'
import { CATEGORY_MAP, LOCATION_MAP } from '../data/constants'
import { formatCalendarDate, formatRelative } from '../utils/format'
import { ItemImage } from './ItemImage'
import { SampleBadge, TypeBadge } from './Badges'

export function ItemCard({ listing }: { listing: Listing }) {
  const category = CATEGORY_MAP[listing.category]
  const CategoryIcon = category.icon
  const location = LOCATION_MAP[listing.location]

  return (
    <article className="h-full">
      <Link
        to={`/items/${listing.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-[#D8CFC0] hover:shadow-lift"
        aria-label={`${listing.type === 'lost' ? 'Lost' : 'Found'} item: ${listing.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ItemImage
            src={listing.image}
            alt={listing.imageAlt}
            category={listing.category}
            className="h-full w-full"
            imageClassName="transition duration-500 ease-out group-hover:scale-[1.035]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
            <TypeBadge type={listing.type} className="shadow-sm" />
            {listing.isSample && <SampleBadge />}
          </div>
          {listing.status === 'returned' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-ink/80 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
              <Check aria-hidden="true" size={12} strokeWidth={2.6} />
              Returned to owner
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="eyebrow flex items-center gap-1.5">
            <CategoryIcon aria-hidden="true" size={12.5} strokeWidth={1.9} />
            {category.label}
          </p>
          <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">
            {listing.name}
          </h3>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" size={12.5} />
              {location.label}
            </span>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-ink-faint" />
            <span>{formatCalendarDate(listing.eventDate)}</span>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-line/80 pt-4">
            <span className="text-[11.5px] text-ink-faint">
              Reported {formatRelative(listing.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted transition group-hover:text-accent">
              View details
              <ArrowUpRight
                aria-hidden="true"
                size={13}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

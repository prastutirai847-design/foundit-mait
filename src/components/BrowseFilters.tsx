import { ChevronDown, Search, X } from 'lucide-react'
import type { CategoryId, ItemType, LocationId, SortOrder } from '../types'
import { CATEGORIES, LOCATIONS, SORT_OPTIONS } from '../data/constants'

type TypeFilter = ItemType | 'all'
type CategoryFilter = CategoryId | 'all'
type LocationFilter = LocationId | 'all'

interface BrowseFiltersProps {
  query: string
  type: TypeFilter
  category: CategoryFilter
  location: LocationFilter
  sort: SortOrder
  hasFilters: boolean
  onQueryChange: (value: string) => void
  onTypeChange: (value: TypeFilter) => void
  onCategoryChange: (value: CategoryFilter) => void
  onLocationChange: (value: LocationFilter) => void
  onSortChange: (value: SortOrder) => void
  onClear: () => void
}

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lost', label: 'Lost' },
  { id: 'found', label: 'Found' },
]

export function BrowseFilters({
  query,
  type,
  category,
  location,
  sort,
  hasFilters,
  onQueryChange,
  onTypeChange,
  onCategoryChange,
  onLocationChange,
  onSortChange,
  onClear,
}: BrowseFiltersProps) {
  return (
    <div className="rounded-3xl border border-line bg-surface/80 p-4 shadow-card backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="item-search" className="sr-only">
            Search reports by item, place or keyword
          </label>
          <Search
            aria-hidden="true"
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="item-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onQueryChange('')
            }}
            placeholder="Search an item, place or keyword…"
            autoComplete="off"
            className="field-control py-3 pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition hover:bg-sand hover:text-ink"
            >
              <X aria-hidden="true" size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Filter by report type"
            className="flex rounded-full border border-line bg-[#F5F0E7] p-1"
          >
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={type === option.id}
                onClick={() => onTypeChange(option.id)}
                className={`rounded-full px-4 py-2 text-[12.5px] font-semibold transition ${
                  type === option.id
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <label htmlFor="location-filter" className="sr-only">
              Filter by campus location
            </label>
            <select
              id="location-filter"
              value={location}
              onChange={(event) => onLocationChange(event.target.value as LocationFilter)}
              className="field-control appearance-none py-2.5 pl-3.5 pr-9 text-[12.5px] font-medium sm:w-[168px]"
            >
              <option value="all">All locations</option>
              {LOCATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
          </div>

          <div className="relative">
            <label htmlFor="sort-order" className="sr-only">
              Sort reports
            </label>
            <select
              id="sort-order"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortOrder)}
              className="field-control appearance-none py-2.5 pl-3.5 pr-8 text-[12.5px] font-medium sm:w-[144px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-line/80 pt-4">
        <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint sm:block">
          Category
        </span>
        <div
          role="group"
          aria-label="Filter by category"
          className="no-scrollbar flex flex-1 gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible"
        >
          <button
            type="button"
            aria-pressed={category === 'all'}
            onClick={() => onCategoryChange('all')}
            className={`chip ${category === 'all' ? 'chip-active' : ''}`}
          >
            All items
          </button>
          {CATEGORIES.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                onClick={() => onCategoryChange(item.id)}
                className={`chip ${category === item.id ? 'chip-active' : ''}`}
              >
                <Icon aria-hidden="true" size={13.5} strokeWidth={1.9} />
                {item.shortLabel}
              </button>
            )
          })}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="hidden shrink-0 text-[12px] font-semibold text-accent underline-offset-4 hover:underline sm:block"
          >
            Clear all
          </button>
        )}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-[12px] font-semibold text-accent underline-offset-4 hover:underline sm:hidden"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

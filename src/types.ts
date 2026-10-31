export type ItemType = 'lost' | 'found'

export type ListingStatus = 'open' | 'returned'

export type ClaimStatus = 'pending' | 'approved' | 'rejected'

/** A returning user is claiming a found item; a lead is a response to a lost report. */
export type ResponseKind = 'claim' | 'lead'

export type CategoryId =
  | 'electronics'
  | 'bags'
  | 'books-stationery'
  | 'wallets-ids'
  | 'keys'
  | 'bottles-flasks'
  | 'clothing'
  | 'other'

export type LocationId =
  | 'academic-blocks'
  | 'classrooms'
  | 'computer-labs'
  | 'library'
  | 'canteen'
  | 'auditorium'
  | 'sports-area'
  | 'parking-area'
  | 'other'

export interface Listing {
  id: string
  type: ItemType
  name: string
  category: CategoryId
  description: string
  location: LocationId
  /** Calendar date the item was lost or found (YYYY-MM-DD). */
  eventDate: string
  /** ISO timestamp of when the report was created. */
  createdAt: string
  /** Path to a bundled sample image, or a compressed data URL from an upload. */
  image?: string
  imageAlt?: string
  /** Private handover/contact note. Only the reporter and an approved claimant see this. */
  handover: string
  owner: 'me' | 'demo'
  isSample: boolean
  status: ListingStatus
  returnedAt?: string
}

export interface Claim {
  id: string
  listingId: string
  kind: ResponseKind
  name: string
  /** Claim: why the item is theirs. Lead: where they saw the item. */
  reason: string
  /** Distinctive details / what they noticed. */
  details: string
  createdAt: string
  status: ClaimStatus
  /** True for requests submitted from this browser. */
  submittedLocally: boolean
  isSample: boolean
  decidedAt?: string
}

export interface ListingDraft {
  type: ItemType
  name: string
  category: CategoryId
  description: string
  location: LocationId
  eventDate: string
  handover: string
  image?: string
  imageAlt?: string
}

export interface ClaimDraft {
  listingId: string
  kind: ResponseKind
  name: string
  reason: string
  details: string
}

export type SortOrder = 'newest' | 'oldest'

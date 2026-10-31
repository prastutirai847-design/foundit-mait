import type {
  CategoryId,
  Claim,
  ClaimDraft,
  ClaimStatus,
  ItemType,
  Listing,
  ListingDraft,
  ListingStatus,
  LocationId,
} from '../types'
import { apiRequest } from './client'

interface ApiListing {
  id: string
  type: ItemType
  name: string
  category: CategoryId
  description: string
  location: LocationId
  event_date: string
  created_at: string
  image: string | null
  image_alt: string | null
  status: ListingStatus
  returned_at: string | null
  owner_id: string
  is_demo: boolean
  viewer_is_owner: boolean
  handover: string | null
}

interface ApiClaim {
  id: string
  listing_id: string
  kind: 'claim' | 'lead'
  name: string
  reason: string
  details: string
  status: ClaimStatus
  created_at: string
  decided_at: string | null
  claimant_id: string
  is_demo: boolean
  viewer_is_claimant: boolean
}

interface ApiListingPayload {
  type: ItemType
  name: string
  category: CategoryId
  description: string
  location: LocationId
  event_date: string
  image: string | null
  image_alt: string | null
  handover_note: string
}

function toListing(item: ApiListing): Listing {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    category: item.category,
    description: item.description,
    location: item.location,
    eventDate: item.event_date,
    createdAt: item.created_at,
    image: item.image ?? undefined,
    imageAlt: item.image_alt ?? undefined,
    handover: item.handover ?? '',
    owner: item.viewer_is_owner ? 'me' : 'demo',
    isSample: item.is_demo,
    status: item.status,
    returnedAt: item.returned_at ?? undefined,
  }
}

function toClaim(item: ApiClaim): Claim {
  return {
    id: item.id,
    listingId: item.listing_id,
    kind: item.kind,
    name: item.name,
    reason: item.reason,
    details: item.details,
    createdAt: item.created_at,
    status: item.status,
    submittedLocally: item.viewer_is_claimant,
    isSample: item.is_demo,
    decidedAt: item.decided_at ?? undefined,
  }
}

function toListingPayload(draft: ListingDraft): ApiListingPayload {
  return {
    type: draft.type,
    name: draft.name,
    category: draft.category,
    description: draft.description,
    location: draft.location,
    event_date: draft.eventDate,
    image: draft.image ?? null,
    image_alt: draft.imageAlt ?? null,
    handover_note: draft.handover,
  }
}

export async function fetchListings(): Promise<Listing[]> {
  const data = await apiRequest<ApiListing[]>('/listings')
  return data.map(toListing)
}

export async function fetchClaims(): Promise<Claim[]> {
  const data = await apiRequest<ApiClaim[]>('/claims')
  return data.map(toClaim)
}

export async function createListing(draft: ListingDraft): Promise<Listing> {
  const data = await apiRequest<ApiListing>('/listings', {
    method: 'POST',
    body: toListingPayload(draft),
  })
  return toListing(data)
}

export async function updateListing(
  id: string,
  draft: ListingDraft,
): Promise<Listing> {
  const data = await apiRequest<ApiListing>(`/listings/${id}`, {
    method: 'PUT',
    body: toListingPayload(draft),
  })
  return toListing(data)
}

export async function deleteListing(id: string): Promise<void> {
  await apiRequest<void>(`/listings/${id}`, { method: 'DELETE' })
}

export async function markListingReturned(id: string): Promise<Listing> {
  const data = await apiRequest<ApiListing>(`/listings/${id}/returned`, {
    method: 'PATCH',
  })
  return toListing(data)
}

export async function createClaim(
  listingId: string,
  draft: ClaimDraft,
): Promise<Claim> {
  const data = await apiRequest<ApiClaim>(`/listings/${listingId}/claims`, {
    method: 'POST',
    body: {
      kind: draft.kind,
      name: draft.name,
      reason: draft.reason,
      details: draft.details,
    },
  })
  return toClaim(data)
}

export async function approveClaim(id: string): Promise<Claim> {
  const data = await apiRequest<ApiClaim>(`/claims/${id}/approve`, {
    method: 'PATCH',
  })
  return toClaim(data)
}

export async function rejectClaim(id: string): Promise<Claim> {
  const data = await apiRequest<ApiClaim>(`/claims/${id}/reject`, {
    method: 'PATCH',
  })
  return toClaim(data)
}

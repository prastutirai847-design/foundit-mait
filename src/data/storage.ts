import type { CategoryId, Claim, Listing, LocationId } from '../types'
import { CATEGORY_MAP, LOCATION_MAP } from './constants'
import { SAMPLE_CLAIMS, SAMPLE_LISTINGS } from './seed'

const LISTINGS_KEY = 'foundit.listings.v1'
const CLAIMS_KEY = 'foundit.claims.v1'

export class StorageWriteError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageWriteError'
  }
}

interface LoadResult<T> {
  data: T
  /** A human-readable explanation when saved data could not be read. */
  issue?: string
}

function readRaw(key: string): string | null {
  return window.localStorage.getItem(key)
}

function writeRaw(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    throw new StorageWriteError(
      isQuota
        ? 'This browser’s storage is full, so the change could not be saved. Try a smaller image, or delete an old listing.'
        : 'This browser blocked local storage, so the change could not be saved. Check your privacy settings and try again.',
    )
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isCalendarDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isListing(value: unknown): value is Listing {
  if (!isRecord(value)) return false
  return (
    isNonEmptyString(value.id) &&
    (value.type === 'lost' || value.type === 'found') &&
    isNonEmptyString(value.name) &&
    typeof value.category === 'string' &&
    value.category in CATEGORY_MAP &&
    isNonEmptyString(value.description) &&
    typeof value.location === 'string' &&
    value.location in LOCATION_MAP &&
    isCalendarDate(value.eventDate) &&
    isTimestamp(value.createdAt) &&
    (value.image === undefined || typeof value.image === 'string') &&
    (value.imageAlt === undefined || typeof value.imageAlt === 'string') &&
    isNonEmptyString(value.handover) &&
    (value.owner === 'me' || value.owner === 'demo') &&
    typeof value.isSample === 'boolean' &&
    (value.status === 'open' || value.status === 'returned') &&
    (value.returnedAt === undefined || isTimestamp(value.returnedAt))
  )
}

function isClaim(value: unknown): value is Claim {
  if (!isRecord(value)) return false
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.listingId) &&
    (value.kind === 'claim' || value.kind === 'lead') &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.reason) &&
    isNonEmptyString(value.details) &&
    isTimestamp(value.createdAt) &&
    (value.status === 'pending' || value.status === 'approved' || value.status === 'rejected') &&
    typeof value.submittedLocally === 'boolean' &&
    typeof value.isSample === 'boolean' &&
    (value.decidedAt === undefined || isTimestamp(value.decidedAt))
  )
}

function readCollection<T>(
  key: string,
  fallback: T[],
  isValid: (value: unknown) => value is T,
): LoadResult<T[]> {
  let raw: string | null
  try {
    raw = readRaw(key)
  } catch {
    return {
      data: fallback,
      issue:
        'This browser is blocking local storage in this context, so FoundIt is running with temporary demo data.',
    }
  }

  if (raw === null) return { data: fallback }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return {
        data: fallback,
        issue: 'Saved data had an unexpected format, so the sample data was restored.',
      }
    }
    const valid = parsed.filter(isValid)
    if (valid.length !== parsed.length) {
      console.warn(
        `[FoundIt] Skipped ${parsed.length - valid.length} unreadable entries from ${key}.`,
      )
    }
    return { data: valid }
  } catch {
    return {
      data: fallback,
      issue: 'Saved data could not be read, so the sample data was restored.',
    }
  }
}

export function loadListings(): LoadResult<Listing[]> {
  return readCollection(LISTINGS_KEY, SAMPLE_LISTINGS, isListing)
}

export function loadClaims(): LoadResult<Claim[]> {
  return readCollection(CLAIMS_KEY, SAMPLE_CLAIMS, isClaim)
}

export function persistListings(listings: Listing[]) {
  writeRaw(LISTINGS_KEY, JSON.stringify(listings))
}

export function persistClaims(claims: Claim[]) {
  writeRaw(CLAIMS_KEY, JSON.stringify(claims))
}

export function isCategoryId(value: string | null): value is CategoryId {
  return value !== null && value in CATEGORY_MAP
}

export function isLocationId(value: string | null): value is LocationId {
  return value !== null && value in LOCATION_MAP
}

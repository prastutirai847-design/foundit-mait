import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Claim, ClaimDraft, ClaimStatus, Listing, ListingDraft } from '../types'
import {
  loadClaims,
  loadListings,
  persistClaims,
  persistListings,
  StorageWriteError,
} from '../data/storage'
import { createId } from '../utils/id'

interface FoundItContextValue {
  listings: Listing[]
  claims: Claim[]
  storageError: string | null
  clearStorageError: () => void
  addListing: (draft: ListingDraft) => Listing
  updateListing: (id: string, draft: ListingDraft) => void
  deleteListing: (id: string) => void
  markReturned: (id: string) => void
  addClaim: (draft: ClaimDraft) => Claim
  setClaimStatus: (claimId: string, status: Exclude<ClaimStatus, 'pending'>) => void
}

const FoundItContext = createContext<FoundItContextValue | null>(null)

function loadInitialState() {
  const listingsResult = loadListings()
  const claimsResult = loadClaims()
  const listingIds = new Set(listingsResult.data.map((listing) => listing.id))
  const claims = claimsResult.data.filter((claim) => listingIds.has(claim.listingId))
  const issues = [listingsResult.issue, claimsResult.issue].filter(Boolean) as string[]
  return {
    listings: listingsResult.data,
    claims,
    issue: issues.length ? Array.from(new Set(issues)).join(' ') : null,
  }
}

export function FoundItProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialState)
  const [listings, setListings] = useState<Listing[]>(initial.listings)
  const [claims, setClaims] = useState<Claim[]>(initial.claims)
  const [storageError, setStorageError] = useState<string | null>(initial.issue)

  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    try {
      persistListings(listings)
      persistClaims(claims)
    } catch (error) {
      setStorageError(
        error instanceof StorageWriteError
          ? error.message
          : 'Your change could not be saved in this browser.',
      )
    }
  }, [listings, claims])

  const addListing = useCallback((draft: ListingDraft): Listing => {
    const listing: Listing = {
      ...draft,
      id: createId('listing'),
      createdAt: new Date().toISOString(),
      owner: 'me',
      isSample: false,
      status: 'open',
    }
    setListings((current) => [listing, ...current])
    return listing
  }, [])

  const updateListing = useCallback((id: string, draft: ListingDraft) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === id && listing.owner === 'me' ? { ...listing, ...draft } : listing,
      ),
    )
  }, [])

  const deleteListing = useCallback((id: string) => {
    setListings((current) => current.filter((listing) => listing.id !== id))
    setClaims((current) => current.filter((claim) => claim.listingId !== id))
  }, [])

  const markReturned = useCallback((id: string) => {
    const decidedAt = new Date().toISOString()
    setListings((current) =>
      current.map((listing) =>
        listing.id === id && listing.status === 'open'
          ? { ...listing, status: 'returned', returnedAt: decidedAt }
          : listing,
      ),
    )
    setClaims((current) =>
      current.map((claim) =>
        claim.listingId === id && claim.status === 'pending'
          ? { ...claim, status: 'rejected', decidedAt }
          : claim,
      ),
    )
  }, [])

  const addClaim = useCallback((draft: ClaimDraft): Claim => {
    const claim: Claim = {
      ...draft,
      id: createId('request'),
      createdAt: new Date().toISOString(),
      status: 'pending',
      submittedLocally: true,
      isSample: false,
    }
    setClaims((current) => [claim, ...current])
    return claim
  }, [])

  const setClaimStatus = useCallback(
    (claimId: string, status: Exclude<ClaimStatus, 'pending'>) => {
      const decidedAt = new Date().toISOString()
      setClaims((current) => {
        const target = current.find((claim) => claim.id === claimId)
        if (!target) return current
        return current.map((claim) => {
          if (claim.id === claimId) return { ...claim, status, decidedAt }
          if (
            status === 'approved' &&
            claim.listingId === target.listingId &&
            claim.status === 'pending'
          ) {
            return { ...claim, status: 'rejected', decidedAt }
          }
          return claim
        })
      })
    },
    [],
  )

  const clearStorageError = useCallback(() => setStorageError(null), [])

  const value = useMemo<FoundItContextValue>(
    () => ({
      listings,
      claims,
      storageError,
      clearStorageError,
      addListing,
      updateListing,
      deleteListing,
      markReturned,
      addClaim,
      setClaimStatus,
    }),
    [
      listings,
      claims,
      storageError,
      clearStorageError,
      addListing,
      updateListing,
      deleteListing,
      markReturned,
      addClaim,
      setClaimStatus,
    ],
  )

  return <FoundItContext.Provider value={value}>{children}</FoundItContext.Provider>
}

export function useFoundIt(): FoundItContextValue {
  const context = useContext(FoundItContext)
  if (!context) throw new Error('useFoundIt must be used inside FoundItProvider')
  return context
}

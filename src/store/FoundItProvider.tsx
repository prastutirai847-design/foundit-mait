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
import { getErrorMessage } from '../api/client'
import {
  approveClaim,
  createClaim,
  createListing,
  deleteListing as deleteListingRequest,
  fetchClaims,
  fetchListings,
  markListingReturned,
  rejectClaim,
  updateListing as updateListingRequest,
} from '../api/foundit'

interface FoundItContextValue {
  listings: Listing[]
  claims: Claim[]
  /** True while the first load or an explicit refresh is in flight. */
  loading: boolean
  /** Set when the API could not be reached or returned an error. */
  error: string | null
  clearError: () => void
  refresh: () => Promise<void>
  addListing: (draft: ListingDraft) => Promise<Listing>
  updateListing: (id: string, draft: ListingDraft) => Promise<Listing>
  deleteListing: (id: string) => Promise<void>
  markReturned: (id: string) => Promise<Listing>
  addClaim: (draft: ClaimDraft) => Promise<Claim>
  setClaimStatus: (claimId: string, status: Exclude<ClaimStatus, 'pending'>) => Promise<void>
}

const FoundItContext = createContext<FoundItContextValue | null>(null)

export function FoundItProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guards against an older request resolving after a newer one.
  const loadId = useRef(0)

  const refresh = useCallback(async () => {
    const id = loadId.current + 1
    loadId.current = id
    setLoading(true)
    try {
      const [nextListings, nextClaims] = await Promise.all([fetchListings(), fetchClaims()])
      if (loadId.current !== id) return
      setListings(nextListings)
      setClaims(nextClaims)
      setError(null)
    } catch (cause) {
      if (loadId.current !== id) return
      setError(getErrorMessage(cause))
    } finally {
      if (loadId.current === id) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addListing = useCallback(
    async (draft: ListingDraft) => {
      const listing = await createListing(draft)
      await refresh()
      return listing
    },
    [refresh],
  )

  const updateListing = useCallback(
    async (id: string, draft: ListingDraft) => {
      const listing = await updateListingRequest(id, draft)
      await refresh()
      return listing
    },
    [refresh],
  )

  const deleteListing = useCallback(
    async (id: string) => {
      await deleteListingRequest(id)
      await refresh()
    },
    [refresh],
  )

  const markReturned = useCallback(
    async (id: string) => {
      const listing = await markListingReturned(id)
      await refresh()
      return listing
    },
    [refresh],
  )

  const addClaim = useCallback(
    async (draft: ClaimDraft) => {
      const claim = await createClaim(draft.listingId, draft)
      await refresh()
      return claim
    },
    [refresh],
  )

  const setClaimStatus = useCallback(
    async (claimId: string, status: Exclude<ClaimStatus, 'pending'>) => {
      if (status === 'approved') await approveClaim(claimId)
      else await rejectClaim(claimId)
      await refresh()
    },
    [refresh],
  )

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<FoundItContextValue>(
    () => ({
      listings,
      claims,
      loading,
      error,
      clearError,
      refresh,
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
      loading,
      error,
      clearError,
      refresh,
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

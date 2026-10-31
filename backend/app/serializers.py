from sqlalchemy.orm import Session

from .models import Claim, Listing
from .schemas import ClaimOut, ListingOut


def listing_to_out(listing: Listing, viewer: str | None, db: Session) -> ListingOut:
    """Serialize a listing without leaking its private handover note.

    The note is included only for the reporter or a claimant whose request has
    been approved. Public/anonymous responses get handover=None.
    """
    is_owner = viewer is not None and listing.owner_id == viewer
    can_view_handover = is_owner

    if not can_view_handover and viewer is not None:
        approved_claim = (
            db.query(Claim.id)
            .filter(
                Claim.listing_id == listing.id,
                Claim.claimant_id == viewer,
                Claim.status == "approved",
            )
            .first()
        )
        can_view_handover = approved_claim is not None

    return ListingOut(
        id=listing.id,
        type=listing.type,
        name=listing.name,
        category=listing.category,
        description=listing.description,
        location=listing.location,
        event_date=listing.event_date,
        created_at=listing.created_at,
        image=listing.image,
        image_alt=listing.image_alt,
        status=listing.status,
        returned_at=listing.returned_at,
        owner_id=listing.owner_id,
        is_demo=listing.is_demo,
        viewer_is_owner=is_owner,
        handover=listing.handover_note if can_view_handover else None,
    )


def claim_to_out(claim: Claim, viewer: str | None) -> ClaimOut:
    return ClaimOut(
        id=claim.id,
        listing_id=claim.listing_id,
        kind=claim.kind,
        name=claim.name,
        reason=claim.reason,
        details=claim.details,
        status=claim.status,
        created_at=claim.created_at,
        decided_at=claim.decided_at,
        claimant_id=claim.claimant_id,
        is_demo=claim.is_demo,
        viewer_is_claimant=viewer is not None and claim.claimant_id == viewer,
    )

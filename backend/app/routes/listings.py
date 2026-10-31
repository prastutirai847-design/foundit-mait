from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..demo import get_demo_user, require_demo_user
from ..models import Claim, Listing
from ..schemas import ListingCreate, ListingOut, ListingUpdate
from ..serializers import listing_to_out

router = APIRouter(prefix="/listings", tags=["listings"])


def get_listing_or_404(listing_id: str, db: Session) -> Listing:
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found.",
        )
    return listing


def require_owner(listing: Listing, demo_user: str) -> None:
    if listing.owner_id != demo_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reporter who owns this listing can change it.",
        )


@router.get("", response_model=list[ListingOut])
def list_listings(
    db: Session = Depends(get_db),
    viewer: str | None = Depends(get_demo_user),
):
    listings = db.query(Listing).order_by(Listing.created_at.desc()).all()
    return [listing_to_out(listing, viewer, db) for listing in listings]


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    viewer: str | None = Depends(get_demo_user),
):
    listing = get_listing_or_404(listing_id, db)
    return listing_to_out(listing, viewer, db)


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    listing = Listing(
        id=f"listing-{uuid4().hex[:12]}",
        type=payload.type,
        name=payload.name,
        category=payload.category,
        description=payload.description,
        location=payload.location,
        event_date=payload.event_date,
        image=payload.image,
        image_alt=payload.image_alt,
        handover_note=payload.handover_note,
        status="open",
        owner_id=demo_user,
        is_demo=False,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing_to_out(listing, demo_user, db)


@router.put("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: str,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    listing = get_listing_or_404(listing_id, db)
    require_owner(listing, demo_user)

    listing.type = payload.type
    listing.name = payload.name
    listing.category = payload.category
    listing.description = payload.description
    listing.location = payload.location
    listing.event_date = payload.event_date
    listing.image = payload.image
    listing.image_alt = payload.image_alt
    listing.handover_note = payload.handover_note

    db.commit()
    db.refresh(listing)
    return listing_to_out(listing, demo_user, db)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    listing = get_listing_or_404(listing_id, db)
    require_owner(listing, demo_user)

    db.delete(listing)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{listing_id}/returned", response_model=ListingOut)
def mark_listing_returned(
    listing_id: str,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    listing = get_listing_or_404(listing_id, db)
    require_owner(listing, demo_user)

    if listing.status != "returned":
        now = datetime.now(timezone.utc)
        listing.status = "returned"
        listing.returned_at = now

        pending_claims = (
            db.query(Claim)
            .filter(Claim.listing_id == listing.id, Claim.status == "pending")
            .all()
        )
        for claim in pending_claims:
            claim.status = "rejected"
            claim.decided_at = now

        db.commit()
        db.refresh(listing)

    return listing_to_out(listing, demo_user, db)

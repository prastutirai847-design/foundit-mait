from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..demo import require_demo_user
from ..models import Claim, Listing
from ..schemas import ClaimCreate, ClaimOut
from ..serializers import claim_to_out

router = APIRouter(tags=["claims"])


def get_claim_and_listing_or_404(
    claim_id: str,
    db: Session,
) -> tuple[Claim, Listing]:
    claim = db.get(Claim, claim_id)
    if claim is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found.",
        )

    listing = db.get(Listing, claim.listing_id)
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The listing for this claim no longer exists.",
        )

    return claim, listing


def require_listing_owner(listing: Listing, demo_user: str) -> None:
    if listing.owner_id != demo_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reporter who owns this listing can review claims.",
        )


@router.post(
    "/listings/{listing_id}/claims",
    response_model=ClaimOut,
    status_code=status.HTTP_201_CREATED,
)
def create_claim(
    listing_id: str,
    payload: ClaimCreate,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found.",
        )

    if listing.owner_id == demo_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot claim or send a lead on your own listing.",
        )

    if listing.status == "returned":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This listing has already been marked returned.",
        )

    expected_kind = "claim" if listing.type == "found" else "lead"
    if payload.kind is not None and payload.kind != expected_kind:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This listing expects a {expected_kind} request.",
        )

    existing = (
        db.query(Claim)
        .filter(
            Claim.listing_id == listing_id,
            Claim.claimant_id == demo_user,
        )
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already sent a request for this listing.",
        )

    claim = Claim(
        id=f"claim-{uuid4().hex[:12]}",
        listing_id=listing_id,
        kind=expected_kind,
        name=payload.name,
        reason=payload.reason,
        details=payload.details,
        status="pending",
        claimant_id=demo_user,
        is_demo=False,
    )

    try:
        db.add(claim)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already sent a request for this listing.",
        )

    db.refresh(claim)
    return claim_to_out(claim, demo_user)


@router.get("/claims", response_model=list[ClaimOut])
def list_claims(
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    """Return claims the viewer may see.

    That means the viewer's own requests plus requests on listings they own.
    """
    own_listing_ids = [
        row[0]
        for row in db.query(Listing.id)
        .filter(Listing.owner_id == demo_user)
        .all()
    ]

    query = db.query(Claim)
    if own_listing_ids:
        query = query.filter(
            or_(
                Claim.claimant_id == demo_user,
                Claim.listing_id.in_(own_listing_ids),
            )
        )
    else:
        query = query.filter(Claim.claimant_id == demo_user)

    claims = query.order_by(Claim.created_at.desc()).all()
    return [claim_to_out(claim, demo_user) for claim in claims]


@router.patch("/claims/{claim_id}/approve", response_model=ClaimOut)
def approve_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    claim, listing = get_claim_and_listing_or_404(claim_id, db)
    require_listing_owner(listing, demo_user)

    if claim.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This claim is already {claim.status}.",
        )

    if listing.status != "open":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A returned listing cannot have an approved claim.",
        )

    already_approved = (
        db.query(Claim)
        .filter(
            Claim.listing_id == listing.id,
            Claim.status == "approved",
            Claim.id != claim.id,
        )
        .first()
    )
    if already_approved is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Another claim for this listing is already approved.",
        )

    now = datetime.now(timezone.utc)
    claim.status = "approved"
    claim.decided_at = now

    other_pending = (
        db.query(Claim)
        .filter(
            Claim.listing_id == listing.id,
            Claim.status == "pending",
            Claim.id != claim.id,
        )
        .all()
    )
    for other in other_pending:
        other.status = "rejected"
        other.decided_at = now

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Another claim for this listing was approved at the same time.",
        )

    db.refresh(claim)
    return claim_to_out(claim, demo_user)


@router.patch("/claims/{claim_id}/reject", response_model=ClaimOut)
def reject_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    demo_user: str = Depends(require_demo_user),
):
    claim, listing = get_claim_and_listing_or_404(claim_id, db)
    require_listing_owner(listing, demo_user)

    if claim.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This claim is already {claim.status}.",
        )

    claim.status = "rejected"
    claim.decided_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(claim)
    return claim_to_out(claim, demo_user)

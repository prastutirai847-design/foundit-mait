from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import relationship

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("type IN ('lost', 'found')", name="ck_listing_type"),
        CheckConstraint("status IN ('open', 'returned')", name="ck_listing_status"),
    )

    id = Column(String(80), primary_key=True)
    type = Column(String(10), nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(40), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(40), nullable=False)
    event_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    # image is a bundled path such as /images/items/headphones.jpg, or a
    # compressed JPEG data URL produced by the frontend.
    image = Column(Text, nullable=True)
    image_alt = Column(String(250), nullable=True)

    # Private note. It is never included in a public listing response.
    handover_note = Column(Text, nullable=False)

    status = Column(String(20), nullable=False, default="open")
    returned_at = Column(DateTime(timezone=True), nullable=True)

    # Demo ownership. This is a header-provided identifier, not a real account.
    owner_id = Column(String(40), nullable=False, index=True)
    is_demo = Column(Boolean, nullable=False, default=False)

    claims = relationship(
        "Claim",
        back_populates="listing",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Claim(Base):
    __tablename__ = "claims"
    __table_args__ = (
        CheckConstraint("kind IN ('claim', 'lead')", name="ck_claim_kind"),
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name="ck_claim_status",
        ),
        UniqueConstraint(
            "listing_id",
            "claimant_id",
            name="uq_claim_listing_claimant",
        ),
        # Database-level guard: only one approved claim per listing.
        Index(
            "uq_approved_claim_per_listing",
            "listing_id",
            unique=True,
            sqlite_where=text("status = 'approved'"),
        ),
    )

    id = Column(String(80), primary_key=True)
    listing_id = Column(
        String(80),
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    kind = Column(String(10), nullable=False)
    name = Column(String(80), nullable=False)
    reason = Column(Text, nullable=False)
    details = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    decided_at = Column(DateTime(timezone=True), nullable=True)

    # Demo claimant identity, supplied through the X-Demo-User header.
    claimant_id = Column(String(40), nullable=False, index=True)
    is_demo = Column(Boolean, nullable=False, default=False)

    listing = relationship("Listing", back_populates="claims")

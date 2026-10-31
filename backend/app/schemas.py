from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

ItemType = Literal["lost", "found"]
ListingStatus = Literal["open", "returned"]
ClaimKind = Literal["claim", "lead"]
ClaimStatus = Literal["pending", "approved", "rejected"]

CategoryId = Literal[
    "electronics",
    "bags",
    "books-stationery",
    "wallets-ids",
    "keys",
    "bottles-flasks",
    "clothing",
    "other",
]

LocationId = Literal[
    "academic-blocks",
    "classrooms",
    "computer-labs",
    "library",
    "canteen",
    "auditorium",
    "sports-area",
    "parking-area",
    "other",
]


class ListingBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    type: ItemType
    name: str = Field(min_length=3, max_length=80)
    category: CategoryId
    description: str = Field(min_length=20, max_length=600)
    location: LocationId
    event_date: date
    image: str | None = Field(default=None, max_length=4_000_000)
    image_alt: str | None = Field(default=None, max_length=250)

    @field_validator("event_date")
    @classmethod
    def event_date_must_not_be_in_the_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("event_date cannot be in the future")
        return value


class ListingCreate(ListingBase):
    handover_note: str = Field(min_length=10, max_length=300)


class ListingUpdate(ListingBase):
    handover_note: str = Field(min_length=10, max_length=300)


class ListingOut(ListingBase):
    id: str
    created_at: datetime
    status: ListingStatus
    returned_at: datetime | None = None
    owner_id: str
    is_demo: bool
    viewer_is_owner: bool
    # Only populated for the reporter or an approved claimant.
    handover: str | None = None


class ClaimCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    kind: ClaimKind | None = None
    name: str = Field(min_length=2, max_length=60)
    reason: str = Field(min_length=20, max_length=500)
    details: str = Field(min_length=10, max_length=400)


class ClaimOut(BaseModel):
    id: str
    listing_id: str
    kind: ClaimKind
    name: str
    reason: str
    details: str
    status: ClaimStatus
    created_at: datetime
    decided_at: datetime | None = None
    claimant_id: str
    is_demo: bool
    viewer_is_claimant: bool


class HealthOut(BaseModel):
    status: str

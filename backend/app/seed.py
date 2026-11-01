from datetime import date, datetime

from sqlalchemy.orm import Session

from .models import Claim, Listing


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


# The same eight samples used by the original frontend seed file.
# "me" maps to the demo reporter identity demo-me; "demo" maps to demo-owner.
SAMPLE_LISTINGS = [
    {
        "id": "sample-headphones",
        "type": "found",
        "name": "Black over-ear headphones",
        "category": "electronics",
        "description": (
            "Found a pair of matte black over-ear headphones on the window-side desk "
            "in Computer Lab 2, Academic Block C, after the 3 PM lab. They were folded "
            "but not in a case. I have kept them with me and will hand them over once "
            "someone describes them accurately."
        ),
        "location": "computer-labs",
        "event_date": date(2026, 10, 29),
        "created_at": _dt("2026-10-30T09:25:00+05:30"),
        "image": "/images/items/headphones.jpg",
        "image_alt": "Matte black wireless over-ear headphones folded on a scuffed computer-lab desk beside a keyboard",
        "handover_note": (
            "Library entrance, weekdays between 2 and 4 PM. Please describe the "
            "headphones before the handover."
        ),
        "owner_id": "demo-me",
        "status": "open",
    },
    {
        "id": "sample-calculator",
        "type": "lost",
        "name": "Black scientific calculator",
        "category": "electronics",
        "description": (
            "Left my black scientific calculator behind after the 11 AM maths tutorial "
            "in Classroom C-204. It has a small white sticker on the back and my initials "
            "written in marker inside the slide cover. Please reach out if you have seen it."
        ),
        "location": "classrooms",
        "event_date": date(2026, 10, 29),
        "created_at": _dt("2026-10-30T08:10:00+05:30"),
        "image": "/images/items/calculator.jpg",
        "image_alt": "Black scientific calculator with a blank sticker on a classroom desk beside a graph-paper notebook",
        "handover_note": (
            "Can collect from C-204 after any weekday class, or meet near the canteen at lunch."
        ),
        "owner_id": "demo-owner",
        "status": "open",
    },
    {
        "id": "sample-backpack",
        "type": "found",
        "name": "Charcoal canvas backpack",
        "category": "bags",
        "description": (
            "A grey charcoal backpack was left on a bench near the canteen seating area "
            "during the afternoon break. It contains notebooks and a lunch box, but no ID "
            "was visible. I left it with the canteen counter for now."
        ),
        "location": "canteen",
        "event_date": date(2026, 10, 29),
        "created_at": _dt("2026-10-29T18:40:00+05:30"),
        "image": "/images/items/backpack.jpg",
        "image_alt": "Charcoal grey canvas backpack on a weathered concrete bench on campus",
        "handover_note": (
            "Ask at the canteen counter after 1 PM, then message me to confirm the details."
        ),
        "owner_id": "demo-owner",
        "status": "open",
    },
    {
        "id": "sample-bottle",
        "type": "found",
        "name": "Steel water bottle with black cap",
        "category": "bottles-flasks",
        "description": (
            "Found a brushed steel water bottle with a matte black cap on the sports ground "
            "boundary wall after evening practice. There is a small dent near the base. "
            "It is with the sports office right now."
        ),
        "location": "sports-area",
        "event_date": date(2026, 10, 29),
        "created_at": _dt("2026-10-29T17:05:00+05:30"),
        "image": "/images/items/bottle.jpg",
        "image_alt": "Brushed stainless steel water bottle with a matte black cap on a concrete bench",
        "handover_note": (
            "Collect from the sports office between 4 and 6 PM. I can meet by the court "
            "if that is easier."
        ),
        "owner_id": "demo-owner",
        "status": "open",
    },
    {
        "id": "sample-notebook",
        "type": "lost",
        "name": "Spiral notebook — data structures",
        "category": "books-stationery",
        "description": (
            "Lost my navy spiral notebook with handwritten data structures notes and a few "
            "pasted diagrams. It was in the library reading room on Tuesday afternoon, maybe "
            "at the second table from the window. My name is written on the inside cover."
        ),
        "location": "library",
        "event_date": date(2026, 10, 27),
        "created_at": _dt("2026-10-28T10:15:00+05:30"),
        "image": "/images/items/notebook.jpg",
        "image_alt": "Navy spiral notebook open with graph paper pages and a black pen",
        "handover_note": (
            "If you find it, drop it at the library front desk or message me to meet on campus."
        ),
        "owner_id": "demo-me",
        "status": "open",
    },
    {
        "id": "sample-wallet",
        "type": "lost",
        "name": "Brown leather bifold wallet",
        "category": "wallets-ids",
        "description": (
            "Lost a brown leather bifold wallet somewhere between the parking area and "
            "Academic Block A on Monday morning. It holds my college ID, metro card and a few "
            "receipts. Please do not share the ID details publicly — just let me know where I "
            "can collect it."
        ),
        "location": "parking-area",
        "event_date": date(2026, 10, 26),
        "created_at": _dt("2026-10-27T09:30:00+05:30"),
        "image": "/images/items/wallet.jpg",
        "image_alt": "Brown leather bifold wallet on a concrete kerb near a campus car park",
        "handover_note": (
            "Please hand it to the Block A security desk, or message me to meet near the main gate."
        ),
        "owner_id": "demo-owner",
        "status": "open",
    },
    {
        "id": "sample-keys",
        "type": "found",
        "name": "Two brass keys on a leather ring",
        "category": "keys",
        "description": (
            "Found two brass keys on a small dark leather ring in the library reading room. "
            "One key has a blue rubber cap. I handed them to the library desk, and the owner "
            "has since collected them."
        ),
        "location": "library",
        "event_date": date(2026, 10, 26),
        "created_at": _dt("2026-10-27T12:00:00+05:30"),
        "image": "/images/items/keys.jpg",
        "image_alt": "Two brass keys on a dark leather keyring beside a book",
        "handover_note": "Returned to the library front desk. This listing is closed.",
        "owner_id": "demo-owner",
        "status": "returned",
        "returned_at": _dt("2026-10-28T16:20:00+05:30"),
    },
    {
        "id": "sample-earbuds",
        "type": "lost",
        "name": "White wireless earbuds in charging case",
        "category": "electronics",
        "description": (
            "Missed a white earbuds case after the cultural committee meeting in the "
            "auditorium on Saturday. The case has a small blue star sticker on the lid and one "
            "earbud has a tiny scratch near the stem. I can verify ownership with the serial number."
        ),
        "location": "auditorium",
        "event_date": date(2026, 10, 25),
        "created_at": _dt("2026-10-26T19:45:00+05:30"),
        "image": "/images/items/earbuds.jpg",
        "image_alt": "White wireless earbuds in an open charging case on an indigo seat",
        "handover_note": (
            "Meet near the auditorium lobby on weekdays. Please describe the sticker "
            "before handing them over."
        ),
        "owner_id": "demo-owner",
        "status": "open",
    },
]

SAMPLE_CLAIMS = [
    {
        "id": "sample-claim-headphones",
        "listing_id": "sample-headphones",
        "kind": "claim",
        "name": "Ishaan Kapoor",
        "reason": (
            "I think these are the headphones I lost in Computer Lab 2 last week. I was "
            "sitting by the window during the 3 PM lab on Thursday."
        ),
        "details": (
            "The left earcup has a faint scuff near the hinge and the headband is slightly "
            "stretched. I can also describe the cable that was with them."
        ),
        "created_at": _dt("2026-10-30T12:15:00+05:30"),
        "status": "pending",
        "claimant_id": "demo-ishaan",
    },
    {
        "id": "sample-lead-notebook",
        "listing_id": "sample-notebook",
        "kind": "lead",
        "name": "Sneha Rao",
        "reason": (
            "I think I saw this notebook in the library reading room on Tuesday afternoon."
        ),
        "details": (
            "It was on the second table from the window, navy cover with a white spiral. "
            "Someone moved it to the return trolley around 5 PM."
        ),
        "created_at": _dt("2026-10-28T17:50:00+05:30"),
        "status": "pending",
        "claimant_id": "demo-sneha",
    },
]


def seed_database(db: Session) -> tuple[int, int]:
    """Insert demo rows only when the listings table is empty.

    User-created data is never touched, and restarting the server never
    duplicates the samples.
    """
    if db.query(Listing).count() > 0:
        return (0, 0)

    listings = [
        Listing(**row, is_demo=True)
        for row in SAMPLE_LISTINGS
    ]
    claims = [
        Claim(**row, is_demo=True)
        for row in SAMPLE_CLAIMS
    ]

    db.add_all(listings)
    db.flush()  # make sure listing foreign keys exist before claims
    db.add_all(claims)
    db.commit()

    return (len(listings), len(claims))

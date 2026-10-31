"""Small end-to-end smoke test for the FoundIt FastAPI demo.

Run this after starting uvicorn on port 8000:

    python smoke_test.py

It uses only the Python standard library, creates temporary records and
deletes them at the end. It does not touch the two sample claims.
"""

import json
import os
import urllib.error
import urllib.request
from datetime import date

BASE_URL = os.getenv("FOUNDIT_API_URL", "http://127.0.0.1:8000")
API = f"{BASE_URL}/api"


def call(method, path, body=None, user="demo-me", expected=200):
    data = None
    headers = {}
    if user is not None:
        headers["X-Demo-User"] = user
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        f"{API}{path}",
        data=data,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request) as response:
            status = response.status
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        status = error.code
        raw = error.read().decode("utf-8")

    parsed = json.loads(raw) if raw else None
    if status != expected:
        raise AssertionError(
            f"{method} {path}: expected {expected}, got {status}: {parsed}"
        )
    return parsed


def find(items, item_id):
    return next(item for item in items if item["id"] == item_id)


def main():
    health = call("GET", "/health")
    assert health == {"status": "ok"}

    anonymous = call("GET", "/listings", user="demo-anon")
    assert len(anonymous) == 8, len(anonymous)
    assert find(anonymous, "sample-headphones")["handover"] is None

    owner_view = call("GET", "/listings", user="demo-me")
    assert find(owner_view, "sample-headphones")["handover"] is not None
    assert find(owner_view, "sample-calculator")["handover"] is None

    call("GET", "/claims", user=None, expected=401)
    assert call("GET", "/claims", user="demo-anon") == []

    today = date.today().isoformat()
    base_listing = {
        "type": "found",
        "name": "Smoke test wallet",
        "category": "wallets-ids",
        "description": "A temporary wallet created by the backend smoke test.",
        "location": "library",
        "event_date": today,
        "image": None,
        "image_alt": None,
        "handover_note": "Meet at the library desk for the smoke test.",
    }

    created = call("POST", "/listings", base_listing, expected=201)
    listing_id = created["id"]
    assert created["viewer_is_owner"] is True
    assert created["handover"] == base_listing["handover_note"]

    public_detail = call("GET", f"/listings/{listing_id}", user="demo-a")
    assert public_detail["handover"] is None
    assert public_detail["viewer_is_owner"] is False

    call(
        "PUT",
        f"/listings/{listing_id}",
        {**base_listing, "name": "Hijacked name"},
        user="demo-a",
        expected=403,
    )

    updated = call(
        "PUT",
        f"/listings/{listing_id}",
        {**base_listing, "name": "Smoke test wallet updated"},
    )
    assert updated["name"] == "Smoke test wallet updated"

    call(
        "POST",
        f"/listings/{listing_id}/claims",
        {"name": "Owner", "reason": "This is my own listing and should fail.", "details": "This is definitely my own listing."},
        expected=403,
    )

    claim_body = {
        "kind": "claim",
        "name": "Demo A",
        "reason": "I lost this wallet in the library and can describe the inside.",
        "details": "Brown leather, two card slots and a small receipt inside.",
    }
    claim_a = call(
        "POST", f"/listings/{listing_id}/claims", claim_body, user="demo-a", expected=201
    )
    call(
        "POST", f"/listings/{listing_id}/claims", claim_body, user="demo-a", expected=409
    )

    claim_body_b = {
        **claim_body,
        "name": "Demo B",
        "reason": "I think this wallet is mine because it has a metro card inside.",
    }
    claim_b = call(
        "POST", f"/listings/{listing_id}/claims", claim_body_b, user="demo-b", expected=201
    )

    call(
        "PATCH",
        f"/claims/{claim_a['id']}/approve",
        user="demo-a",
        expected=403,
    )

    approved = call(
        "PATCH", f"/claims/{claim_a['id']}/approve", user="demo-me"
    )
    assert approved["status"] == "approved"

    calls_after = call("GET", "/claims", user="demo-me")
    assert find(calls_after, claim_b["id"])["status"] == "rejected"

    approved_detail = call("GET", f"/listings/{listing_id}", user="demo-a")
    assert approved_detail["handover"] == base_listing["handover_note"]
    rejected_detail = call("GET", f"/listings/{listing_id}", user="demo-b")
    assert rejected_detail["handover"] is None

    call("PATCH", f"/claims/{claim_a['id']}/approve", expected=409)
    call("PATCH", f"/claims/{claim_b['id']}/reject", expected=409)

    second = call(
        "POST",
        "/listings",
        {**base_listing, "name": "Smoke test reject listing"},
        expected=201,
    )
    second_claim = call(
        "POST",
        f"/listings/{second['id']}/claims",
        {**claim_body, "name": "Demo C"},
        user="demo-c",
        expected=201,
    )
    rejected = call("PATCH", f"/claims/{second_claim['id']}/reject")
    assert rejected["status"] == "rejected"

    third = call(
        "POST",
        "/listings",
        {**base_listing, "name": "Smoke test returned listing"},
        expected=201,
    )
    third_claim = call(
        "POST",
        f"/listings/{third['id']}/claims",
        {**claim_body, "name": "Demo D"},
        user="demo-d",
        expected=201,
    )
    returned = call("PATCH", f"/listings/{third['id']}/returned")
    assert returned["status"] == "returned"

    third_claims = call("GET", "/claims", user="demo-me")
    assert find(third_claims, third_claim["id"])["status"] == "rejected"

    call(
        "POST",
        f"/listings/{third['id']}/claims",
        {**claim_body, "name": "Demo E"},
        user="demo-e",
        expected=409,
    )

    call("PATCH", f"/listings/{listing_id}/returned", user="demo-a", expected=403)
    call("PATCH", f"/listings/{listing_id}/returned")

    call(
        "POST",
        f"/listings/{listing_id}/claims",
        {**claim_body, "name": "Demo F"},
        user="demo-f",
        expected=409,
    )

    invalid = {
        **base_listing,
        "name": "ab",
        "description": "too short",
        "event_date": "2999-01-01",
    }
    call("POST", "/listings", invalid, expected=422)
    call("GET", "/listings/does-not-exist", expected=404)
    call("PATCH", "/claims/does-not-exist/approve", expected=404)

    call("DELETE", f"/listings/{listing_id}", user="demo-a", expected=403)
    call("DELETE", f"/listings/{listing_id}", expected=204)
    call("GET", f"/listings/{listing_id}", expected=404)

    call("DELETE", f"/listings/{second['id']}", expected=204)
    call("DELETE", f"/listings/{third['id']}", expected=204)

    final_listings = call("GET", "/listings", user="demo-me")
    final_claims = call("GET", "/claims", user="demo-me")
    assert len(final_listings) == 8, len(final_listings)
    assert len(final_claims) == 2, len(final_claims)

    print("All smoke tests passed.")
    print(f"Listings after cleanup: {len(final_listings)}")
    print(f"Claims after cleanup: {len(final_claims)}")


if __name__ == "__main__":
    main()

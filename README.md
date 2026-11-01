# FoundIt — MAIT Campus Lost & Found

FoundIt is a focused, campus-only lost-and-found prototype built for students at Maharaja Agrasen Institute of Technology (MAIT). It gives lost belongings a clear place to be reported, lets found items be listed with useful context, and provides a structured claim-and-handover flow instead of scattered chat messages.

The project pairs a React + TypeScript frontend with a small **FastAPI demo backend** and a persistent **SQLite** database. It is an independent, student-built prototype, not an official MAIT service.

## Problem statement

Losing something on campus usually starts a frantic search across group chats, notice boards, and word of mouth. Found items are often handed to a security desk or kept by whoever found them, with no shared record of what was found, where, or how to claim it.

FoundIt explores a calmer workflow:

- Report a lost item with a description, campus location, and date.
- List a found item with a private handover note.
- Let students submit claims or leads with identifying details.
- Give the reporter a clear place to approve or decline requests.
- Reveal handover details only after approval and close the listing once returned.

## Key features

- **Discover board** with recent reports, featured item, and a responsive card grid.
- **Demo sign-in page** for choosing or switching the demo identity used for reports and requests.
- **Search and filters** across item name, description, category, campus location, and report type.
- **Lost and found reporting** with validation, date checks, and campus-specific locations.
- **Image upload** with preview and client-side compression before upload.
- **Detailed listing pages** with status, timeline, location, category, and privacy explanation.
- **Claim and lead workflow** with identifying details and duplicate checks.
- **Reporter review** to approve or decline incoming requests from My Activity.
- **Private handover notes** returned only to the reporter or an approved claimant.
- **Returned-item lifecycle** that closes the listing and rejects remaining pending requests.
- **Edit and delete** owned reports, with related requests removed when a report is deleted.
- **My Activity** tabs for reports, incoming requests, and submitted requests.
- **Server-backed persistence** through the FastAPI API and SQLite.
- **Loading, error, empty, and success states** across the app.
- **Accessible, mobile-first interface** with keyboard navigation, visible focus, semantic markup, and reduced-motion support.

## Demo identity and sign-in (not authentication)

The app does **not** implement real accounts, passwords, or verified MAIT identities. Opening the app redirects to `/login`, where you choose a demo username (3–40 letters, numbers, underscores or hyphens). That username is stored in this browser under `foundit.demo-user.v1` and sent with every API request as the spoofable `X-Demo-User` header.

The sign-in page offers four seeded demo identities:

| Demo username | Sees |
| --- | --- |
| `demo-me` | The seeded headphones and notebook reports, plus both sample requests |
| `demo-owner` | The other six seeded reports, with no incoming requests |
| `demo-ishaan` | Their pending claim on the black headphones under My requests |
| `demo-sneha` | Their pending lead on the spiral notebook under My requests |

You can also type a new username to start with an empty activity list. The header shows the active identity; use it to return to the sign-in page to switch or sign out.

The backend enforces ownership and claim rules against the header:

- Only the reporter can edit, delete, or mark a listing returned.
- A student cannot claim their own listing.
- A listing can have only one approved request.
- Approving one request rejects the other pending requests.
- Handover notes are omitted from public listing responses.

This demonstrates the authorization flow, but anyone can send a different header value, and no password is requested. Do not treat it as secure or production-ready.

## Technology stack

| Layer | Technology |
| --- | --- |
| UI framework | React 19 |
| Language | TypeScript 7 |
| Build tool | Vite 8 |
| Routing | React Router 7 (`BrowserRouter`) |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Fonts | Inter and Fraunces via Fontsource |
| Backend | Python + FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy 2 |
| Validation | Pydantic 2 |
| Server | Uvicorn |
| Linting | Oxlint |

The only network calls are to the local FastAPI server. There are no third-party APIs, paid services, API keys, or secrets.

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── database.py          # SQLite engine, session, Base
│   │   ├── demo.py              # X-Demo-User header parsing
│   │   ├── main.py              # FastAPI app, CORS, startup seed
│   │   ├── models.py            # Listing and Claim tables
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── seed.py              # Eight listings and two requests
│   │   ├── serializers.py       # Handover visibility rules
│   │   └── routes/
│   │       ├── claims.py
│   │       └── listings.py
│   ├── foundit.db               # Created on first run (git-ignored)
│   ├── requirements.txt
│   └── smoke_test.py            # Stdlib-only endpoint test
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── images/items/            # AI-generated seller-style demo photos
├── src/
│   ├── api/                     # API client and DTO mapping
│   ├── auth/                    # Demo identity storage and React provider
│   ├── components/              # Reusable UI, forms, navigation and dialogs
│   ├── data/                    # Categories, locations and legacy seed helpers
│   ├── hooks/
│   ├── pages/                   # Includes the demo sign-in page
│   ├── store/                   # Async API-backed React context
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

`src/data/storage.ts` and `src/data/seed.ts` are retained from the earlier frontend-only version. They are no longer used for persistence; `storage.ts` is still imported for its category/location type guards.

## Local setup

### Prerequisites

- Node.js **20.19+** or **22.12+** and npm
- Python **3.11+**

### 1. Start the FastAPI backend

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows Git Bash
source .venv/Scripts/activate
```

Install dependencies and run the server:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API: `http://127.0.0.1:8000/api`
- Interactive docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

The SQLite file is created at `backend/foundit.db` on first start. Sample listings and requests are inserted only when the listings table is empty.

### 2. Start the frontend

In a second terminal, from the project root:

```bash
npm install
npm run dev
```

Vite prints a local URL, typically `http://localhost:5173`. The API base URL defaults to `http://127.0.0.1:8000/api`; copy `.env.example` to `.env` only if your backend runs elsewhere.

Open the app and choose a demo identity on the sign-in page. Use `demo-me` to see the seeded reporter flow (two reports and two incoming requests) or `demo-ishaan` / `demo-sneha` to see a claimant's view. You can sign out or switch identity at any time from the account chip in the header.

```bash
# .env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 3. Run the backend smoke test

With the server running:

```bash
python backend/smoke_test.py
```

It covers health, seeding, anonymous access, ownership checks, self-claims, duplicates, approval and rejection, automatic rejection of competing requests, handover visibility, returned listings, validation, and 404s. Set `FOUNDIT_API_URL` to test a different base URL.

### Production build

```bash
npm run build
npm run preview
```

Because the app uses `BrowserRouter`, a static host must rewrite unknown paths to `index.html`. The FastAPI server is a demo and is not configured for production deployment.

### Other commands

```bash
npm run lint       # Run Oxlint
```

## API endpoints

All routes are prefixed with `/api`. Methods that change data require an `X-Demo-User` header. Ownership is checked against that value.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/listings` | List all reports; handover included only for the reporter or approved claimant |
| `GET` | `/api/listings/{id}` | One report with the same handover rule |
| `POST` | `/api/listings` | Create a report (`201`) |
| `PUT` | `/api/listings/{id}` | Replace an owned report (`200`) |
| `DELETE` | `/api/listings/{id}` | Delete an owned report and its requests (`204`) |
| `PATCH` | `/api/listings/{id}/returned` | Mark an owned report returned and reject pending requests |
| `POST` | `/api/listings/{id}/claims` | Submit a claim or lead (`201`) |
| `GET` | `/api/claims` | Requests you sent plus requests on listings you own |
| `PATCH` | `/api/claims/{id}/approve` | Approve a pending request on your listing |
| `PATCH` | `/api/claims/{id}/reject` | Reject a pending request on your listing |

Status codes used: `200`, `201`, `204`, `400` (kind mismatch), `401` (missing demo header), `403` (not the owner or claiming your own listing), `404` (missing listing or request), `409` (duplicate request, already decided, listing returned, or a second approval), and `422` (Pydantic validation).

### Database schema

`listings`

| Column | Notes |
| --- | --- |
| `id` | Text primary key |
| `type` | `lost` or `found` |
| `name`, `category`, `description`, `location` | Required text |
| `event_date` | Date, not in the future |
| `created_at` | Timestamp |
| `image`, `image_alt` | Optional compressed data URL and alt text |
| `handover_note` | Private; never returned publicly |
| `status` | `open` or `returned` |
| `returned_at` | Optional timestamp |
| `owner_id` | Demo identity that owns the report |
| `is_demo` | True for seeded samples |

`claims`

| Column | Notes |
| --- | --- |
| `id` | Text primary key |
| `listing_id` | Foreign key to `listings.id`, cascades on delete |
| `kind` | `claim` or `lead` |
| `name`, `reason`, `details` | Required text |
| `status` | `pending`, `approved`, or `rejected` |
| `created_at`, `decided_at` | Timestamps |
| `claimant_id` | Demo identity that sent the request |
| `is_demo` | True for seeded samples |

Database constraints enforce one request per demo identity per listing, at most one approved request per listing, valid enum values, and foreign-key integrity (`PRAGMA foreign_keys=ON`).

## Data and privacy

- Listings and requests live in `backend/foundit.db`, not in browser storage.
- The only browser-stored value is the chosen demo username (`foundit.demo-user.v1`), so a reload keeps you signed in. It contains no listings or private notes.
- Uploaded images are compressed to JPEG data URLs and stored in the listing row.
- Handover notes are filtered out of public listing responses. They appear only when the viewer is the reporter or has an approved request.
- The `X-Demo-User` header is a demo mechanism. It is easy to spoof and is **not** authentication.
- CORS is restricted to local Vite origins for development.
- There are no API keys, secrets, or third-party services.
- Clearing browser data does not delete the database; deleting `backend/foundit.db` resets the demo and re-seeds on the next start.

## Sample data

The backend seeds eight sample reports and two sample requests, all labelled **Sample**, only when the listings table is empty. Two sample reports (`sample-headphones` and `sample-notebook`) are owned by `demo-me`, so the approval flow can be tried immediately from My Activity.

The eight sample photos are AI-generated seller-style images made for this demo: casual phone-style shots of second-hand items on desks, benches and campus surfaces. They are not real listings, real students, or photos taken from marketplace websites, and no real personal data appears in them.

Restarting the server does not duplicate seeds and does not reset user-created rows.

## Current limitations

- **Demo identity, not authentication:** the sign-in page chooses a spoofable username; there are no accounts, passwords, sessions, or verified MAIT identities.
- **No production security:** there is no rate limiting, moderation, audit log, HTTPS setup, or hardened deployment.
- **SQLite demo scale:** suitable for a single demo server, not concurrent campus-wide traffic.
- **Image storage in SQLite:** uploads are compressed data URLs stored in the database, which is not a real media pipeline.
- **No notifications:** reporters are not emailed or alerted outside the app.
- **No ownership verification:** reporters decide claims; FoundIt does not validate them.
- **No cross-origin production setup:** CORS is configured for local development only.
- **Static routing caveat:** a production host must rewrite unknown frontend paths to `index.html`.
- **Not an official MAIT service:** this is an independent student project without institutional affiliation or endorsement.

## Status

FoundIt is a working full-stack prototype: the React frontend talks only to the FastAPI demo API, data survives backend restarts, a demo sign-in page switches between seeded identities, the seeded review flow works end to end, and the build and lint pass. Production use would require real authentication, authorization review, image hosting, moderation, and a managed database.

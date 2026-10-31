# FoundIt — MAIT Campus Lost & Found

FoundIt is a focused, campus-only lost-and-found prototype built for students at Maharaja Agrasen Institute of Technology (MAIT). It gives lost belongings a clear place to be reported, lets found items be listed with useful context, and provides a structured claim-and-handover flow instead of scattered chat messages.

The project is an independent, student-built frontend prototype. It is not affiliated with or endorsed by MAIT.

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
- **Search and filters** across item name, description, category, campus location, and report type.
- **Lost and found reporting** with validation, date checks, and campus-specific locations.
- **Image upload** with preview and client-side compression before storage.
- **Detailed listing pages** with status, timeline, location, category, and privacy explanation.
- **Claim and lead workflow** with identifying details, duplicate checks, and status tracking.
- **Reporter review** to approve or decline incoming requests from My Activity.
- **Private handover notes** shown only to the reporter and an approved claimant.
- **Returned-item lifecycle** that closes the listing and declines remaining pending requests.
- **Edit and delete** owned reports, with related requests removed when a report is deleted.
- **My Activity** tabs for reports, incoming requests, and submitted requests.
- **Resilient local persistence** with malformed-data recovery and storage-failure messaging.
- **Accessible, mobile-first interface** with keyboard navigation, visible focus, semantic markup, and reduced-motion support.

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
| Persistence | Browser `localStorage` |
| Linting | Oxlint |

There is no backend, database, authentication provider, or external API. All data stays in the current browser.

## Project structure

```text
.
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── images/items/          # Bundled sample item photography
├── src/
│   ├── components/            # Reusable UI, forms, navigation and dialogs
│   ├── data/
│   │   ├── constants.ts       # Categories, locations and sort options
│   │   ├── seed.ts            # Sample listings and requests
│   │   └── storage.ts         # LocalStorage validation and persistence
│   ├── hooks/
│   │   └── usePageTitle.ts
│   ├── pages/
│   │   ├── DiscoverPage.tsx
│   │   ├── ReportPage.tsx
│   │   ├── ItemDetailPage.tsx
│   │   ├── ClaimPage.tsx
│   │   ├── EditListingPage.tsx
│   │   ├── ActivityPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── store/
│   │   └── FoundItProvider.tsx
│   ├── utils/
│   │   ├── format.ts
│   │   ├── id.ts
│   │   └── image.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
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

## Local setup

### Prerequisites

- Node.js **20.19+** or **22.12+**
- npm

### Installation

```bash
git clone <repository-url>
cd foundit-mait
npm install
```

### Run locally

```bash
npm run dev
```

Vite starts a development server and prints the local URL, typically `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

### Other commands

```bash
npm run lint       # Run Oxlint
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Discover reports, search, filters, and featured item |
| `/report` | Create a lost or found report |
| `/items/:id` | View a listing and manage it if you own it |
| `/items/:id/claim` | Submit a claim or a found-item lead |
| `/items/:id/edit` | Edit an owned report |
| `/activity` | Reports, incoming requests, and submitted requests |
| `*` | Not-found page |

## Data and privacy

- Listings and requests are stored under `foundit.listings.v1` and `foundit.claims.v1` in `localStorage`.
- Uploaded images are compressed to JPEG data URLs and stored alongside the listing.
- Nothing is transmitted to a server or shared between browsers, devices, or students.
- Clearing site data removes locally created reports and requests.
- Private handover notes are hidden from public listing views and appear only after approval.
- Ownership is not independently verified. The prototype demonstrates a review flow, not identity verification.

## Sample data

The app ships with eight sample reports and two sample requests, all clearly labeled **Sample**. Two sample reports are treated as belonging to the local user so the approval flow can be tried immediately. Sample entries can be edited or deleted from My Activity.

## Current limitations

- **Single-browser only:** data does not sync across students, browsers, or devices.
- **No authentication:** ownership is a local demo flag, not a verified account.
- **No real counterparties:** claims submitted against demo-owned listings cannot be reviewed by another person.
- **No backend or shared database:** listings, claims, approvals, and handovers are frontend-only.
- **No hosted image storage:** uploads live inside LocalStorage and consume browser quota.
- **No notifications:** reporters are not alerted outside the browser.
- **No moderation or ownership verification:** the prototype does not validate claims or moderate content.
- **Static routing caveat:** because the app uses `BrowserRouter`, a production host must rewrite unknown paths to `index.html`.
- **Not an official MAIT service:** this is an independent student project without institutional affiliation or endorsement.

## Status

FoundIt is a complete, functional frontend prototype for demonstrating the campus lost-and-found workflow. Production use would require shared persistence, authentication, authorization enforcement, image hosting, and moderation.

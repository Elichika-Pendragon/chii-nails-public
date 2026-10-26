# Architecture and source map

The private product uses Astro to generate static pages, build-time React for composition, and native browser controllers for interaction. Cloudflare Pages Functions handle HTTP requests; D1 holds booking/payment state; a private Worker/Durable Object handles submission and diagnostics; Google Calendar is the external schedule provider.

| Layer | Public reference | Responsibility |
| --- | --- | --- |
| Pricing | `src/pricing.js`, `price-entry.js` | Validate fixed/range prices and combine independent services |
| Customer interface | `src/scripts/booking-*.js`, selected `.astro` fragments | Input validation, proof preparation, draft restoration and explicit retry |
| Owner interface | `src/scripts/approval-*.js`, `order-editor.js` | Authenticated review and optional receipt actions |
| HTTP boundary | `functions/api/booking/`, `server/booking-http.js` | Validate origin/session/authorization and shape safe responses |
| Booking ledger | `server/booking-requests.js`, `migrations/` | Claims, immutable request data and idempotent transitions |
| Calendar adapter | `server/google-calendar.js` | Provider contract validation and deterministic event reconciliation |
| Payments/receipts | `server/booking-receipts.js` and payment tests | Separate payment events, balance calculations and customer receipts |
| Diagnostics | `server/booking-diagnostics.js`, `calendar-diagnostics.js` | Allowlisted failure fields and best-effort private delivery |

A customer submits a request after consultation. Only an authenticated owner can accept or cancel. Acceptance rechecks availability and protects relevant slots. An uncertain Calendar write is reconciled through lookup before retry; a timeout is not proof that the event was absent. D1 and Google Calendar cannot participate in one database transaction.

An accepted booking can produce an optional receipt link. A partial payment leaves a remaining balance; recording later settlement is idempotent and preserves prior financial facts. A cancelled receipt does not invent a remaining service debt or imply a refund occurred.

Five-character estimate codes identify saved selections and are deliberately separate from owner authentication and private review/receipt capabilities. Selection lookup is not permission to accept an appointment.

The private product also has Instagram and monthly media pipelines. Their implementation, source media and production archive are omitted from this focused edition; no scraping workflow is configured here.

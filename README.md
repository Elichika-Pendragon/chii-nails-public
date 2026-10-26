# Chii Nails Public

A product-management case study and sanitized engineering reference for a small nail studio's consultation, booking and receipt workflow.

**Product direction and delivery coordination:** Audrey (Elichika-Pendragon)

**Implementation and technical collaboration:** OpenAI Codex

**Business requirements and operational decisions:** the studio owner

This is a separate portfolio repository with fresh history. The production repository remains private. No production deployment, customer database, payment screenshots, access links, credentials, studio photography, account bindings or archived operational captures are included.

## Start here

- [PM case study](docs/CASE-STUDY.md): problem, decisions, constraints, responsibilities and lessons.
- [Architecture and source map](docs/ARCHITECTURE.md): frontend/backend boundaries and state transitions.
- [Reliability and the Calendar incident](docs/RELIABILITY.md): what failed, how it was repaired and what tests cannot prove.
- [Privacy and publication review](docs/PUBLICATION-REVIEW.md): inclusion/exclusion policy and validation scope.
- [Source selection](docs/SOURCE-SCOPE.md): what this edition preserves and deliberately leaves out.

## Run the reference

Requires **Node.js 24 or later** (including `node:sqlite`). No dependencies, provider credentials or cloud accounts are required for these commands:

```sh
npm test
npm run example
npm run check:public
```

Tests use in-memory SQLite, synthetic inputs, generated test signing keys, mocked provider responses and DOM fixtures. The calculator example combines plain nails, Cat Eye, extensions, glitter and removal into an illustrative Rp123,000 estimate. No message, appointment or payment is sent.

`src/pages/`, `src/components/` and `src/PriceList.jsx` are **interface reference fragments**, not a complete standalone website build. Their original navigation/layout shell and asset library are intentionally absent. Backend handlers and Worker adapters are reference implementations with no deploy configuration; do not connect this repository to production or treat it as a ready-to-deploy clone.

## Features represented

- Independently combinable services, quantities and fixed/range prices.
- Optional short estimate references, separate from booking authorization.
- Manual deposits, mandatory proof uploads and owner-only approval.
- Calendar conflict checks, deterministic event identity, leases and explicit recovery.
- Immutable payment history, optional receipt sharing and browser-printable receipts.
- Sanitized failure diagnostics that exclude customer payloads and credentials.

## Evidence, honestly stated

The private application's final system check reported 613 tests across three repeated rounds, 152 local runtime requests and 90 bounded live read/authorization checks. Those numbers describe that dated private verification, **not this smaller public suite**. This edition's own reproducible test count is recorded in [verification](docs/VERIFICATION.md). No conversion, revenue or business-impact improvement has been measured.

Source visibility does not grant access to the live database, Calendar or owner account. Security depends on server-side authorization and secret management, not hiding algorithms. Public review is encouraged; never test against the actual studio or submit customer information here.

No general reuse license is granted by this publication. Studio photographs, logos and third-party design assets are not distributed. See [rights and attribution](NOTICE.md).

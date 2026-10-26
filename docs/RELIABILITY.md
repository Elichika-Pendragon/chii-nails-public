# Reliability, diagnostics and limits

## Calendar response contract

The original approval failure came from requiring explicit `transparency: opaque` in every returned Google event. Google may omit the optional field when its default is busy. The verifier now accepts that omission while rejecting explicit free/malformed values and mismatched identity, payment fingerprint, time or privacy. Tests exercise both ordinary acceptance and recovery after a lost acknowledgement.

## Other repair areas represented in tests

- Prevent request coalescing from joining a stranded promise from a cancelled invocation.
- Bound waiting for a healthy shared availability refresh without returning expired occupancy.
- Recover deleted uncertain inserts without duplicate insertion.
- Synchronize moved/deleted/all-day accepted events and obsolete slot claims.
- Reject stale browser results after navigation, restoration or cleared input.
- Preserve immutable financial snapshots and one settlement event under concurrent retries.
- Return expired owner authentication to sign-in and retain server-side access checks.

## Failure diagnostics

Covered HTTP 5xx/uncaught handler failures receive an opaque incident reference and are forwarded privately using `waitUntil`. The receiver rebuilds an allowlisted record: endpoint, status, bounded elapsed time, phase/code and optional upstream status. It excludes request bodies, names, phone numbers, uploaded images, URLs, cookies, credentials, raw exceptions and stack traces.

The private deployment was verified with finite retained Workers Logs. No production logging account, stored logs or logging credentials are included here. This source demonstrates the mechanism; creating this public repository activates no monitoring. Delivery failures, exhausted quotas and provider outages can leave gaps. Successful HTTP responses containing an uncertain business state are not automatically covered by a 5xx logger.

An earlier isolated production 503 was not conclusively attributable because its original diagnostics were absent. A separately reproduced contention defect was fixed, but that is not proof it caused the historical response. Likewise, one automated-browser calendar stall was not conclusively explained; later Chrome and user-device checks succeeded. These uncertainties should not be rewritten as proven fixes.

## Interpreting tests

Synthetic repeated tests cover chosen scenarios, not every future device, provider or network failure. They do not establish bank-payment authenticity or authorize production writes. Never use test fixtures, generated keys or demonstration account values as real credentials. Do not run load tests against the live studio.

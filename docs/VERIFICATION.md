# Verification of the public edition

Verified locally on 27 October 2026 with Node.js 24. These results apply to the selected public reference, not a production deployment.

| Check | Result |
| --- | --- |
| `npm test` | 541 passed; 0 failed, skipped or cancelled |
| `npm run example` | Combined synthetic estimate: Rp123,000 |
| `npm run check:public` | No forbidden files or recognized credential patterns |
| Gitleaks 8.30.1 directory scan | No findings after fixture cleanup |
| Known production identifier review | No matches in the final selected source |

Real payment destinations and personal fixture names were replaced with explicit demo placeholders. Signing keys are generated inside tests. No customer database, uploaded payment image, historical log, private URL, production credential or original Git history is included. The only inline image fixture is a blank 2×2 JPEG.

The publication process also scans the new Git history before push. The repository's GitHub Actions workflow reruns the synthetic suite, calculator example and generic public-content check; see its actual run status for subsequent changes.

These tests do not contact the real studio, send messages, verify a real bank transfer or create appointments. Interface fragments are not a complete buildable website. There is no production deployment workflow. Passing a scan is evidence within the scanner's scope, not a guarantee that arbitrary future changes are safe to publish.

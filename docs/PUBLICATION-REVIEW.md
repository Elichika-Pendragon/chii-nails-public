# Publication review

Prepared 27 October 2026. The source was selected into a new folder; no production Git objects or previous commit history were copied.

Review includes: tracked-file allowlisting, separate checks for known production identifiers outside the public repository, review of synthetic fixture provenance, Gitleaks scanning, generic public-content checks, and execution of the selected tests. Fresh-history commit scanning is performed before push. Results and exact test count are in VERIFICATION.md.

The only embedded image fixture is a documented blank 2×2 JPEG created for validation tests. It contains no payment or customer information. Test keys are generated at runtime; obvious fixed test-only signing strings and synthetic numeric phone inputs remain necessary to exercise validation. Tests never send WhatsApp messages or create real appointments.

No raw production evidence, private capabilities, real secrets, account recovery data or customer data was intentionally included. Automated detection is not proof that all conceivable sensitive data formats are recognizable; the restrictive source selection is the primary boundary. Future updates require the same review—never copy the private repository wholesale into this one.

Keep the production repository private. Do not upload customer screenshots, request headers, approval/receipt URLs or credentials in public issues. Reproduce a problem with synthetic fixtures instead.

Copied payment destinations and personal fixture names were removed during review. Payment instructions now carry explicit demo placeholders. Generated signing-key fixtures use runtime serialization rather than pasted key material. No scanner exclusions were added to suppress credential findings.

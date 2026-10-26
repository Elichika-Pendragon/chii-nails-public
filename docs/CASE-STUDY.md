# From a studio website to a controlled booking workflow

## Context and problem

A nail studio needed customers to understand services and discuss custom designs through WhatsApp. The owner needed control over appointments, payment verification and receipts. A customer-generated estimate or uploaded screenshot could not be allowed to approve an appointment.

The work expanded from a visual website into estimates, booking requests, owner review, payment records and printable customer receipts. This was an independent, AI-assisted project, not a formal PM role or management of a conventional engineering team.

## What Audrey did

- Set product priorities and explained the studio's operating constraints.
- Relayed stakeholder feedback, challenged unnecessary fields and revised confusing flows.
- Chose independently combinable services, editable consultation prices and an optional calculator code.
- Kept customer requests separate from the owner's appointment approval.
- Specified optional WhatsApp receipt links, later balance settlement and printable receipts without storing PDFs.
- Raised mobile loading, storage growth, account access, spam and continuity concerns.
- Authorized staged releases, requested repeated verification and pushed for persistent diagnostics after a real failure.

## What Codex did

Codex proposed technical approaches, authored and refactored the application, prepared design artifacts and documentation, built automated tests, investigated failures and performed authorized deployment work. Codex also drafted this portfolio narrative. The code should not be represented as Audrey's independently authored engineering work.

The studio owner supplied business requirements and remains responsible for checking actual bank transactions and accepting appointments. An image-validation routine cannot establish that a bank transfer is genuine.

## Decisions and tradeoffs

| Decision | Why it mattered | Tradeoff |
| --- | --- | --- |
| Keep WhatsApp handoffs manual | Fits existing studio habits and avoids automatic unsolicited messages | The sender still reviews and presses Send |
| Optional calculator reference | Restores selections without requiring every customer to use the calculator | A short code must never serve as authentication |
| Separate request from acceptance | Prevents customers from approving themselves or reserving slots merely by submitting | Owner review is a required operational step |
| Editable agreed price | Accommodates custom designs and consultation adjustments | Receipt/payment values must preserve historical snapshots |
| Receipt link with print action | Avoids storing and repeatedly attaching PDF files | Browser printing and customer access still need validation |
| Bounded media loading and retention | Controls transfer and storage growth | Offline fallbacks and failed-import behavior must remain clear |
| Sanitized retained diagnostics | Supports investigation after an incident | Finite retention and delivery failures still create limits |

## A failure that changed the process

An appointment was visible in Google Calendar but the application withheld the receipt because its verifier rejected the response. Google had omitted an optional busy/free field whose default already meant busy. Earlier fixtures echoed the outgoing payload, so tests preserved a field Google could omit.

The repair accepted that documented absence while retaining all other identity, financial, privacy and timing checks. Tests were expanded to include omitted defaults, lost acknowledgements and repeated recovery. The lesson was to model the external provider's actual response contract, not only the response we hoped to receive.

## Outcome and limits

A working studio workflow was delivered and iterated, with documented reliability repairs and a continuity handover. We have implementation and test evidence, not measured revenue uplift, conversion gains or a controlled usability study. Discovery consisted of stakeholder conversations, screenshots and walkthroughs; formal customer research was not conducted.

If repeating the project, I would define acceptance criteria and real-provider contract checks earlier, keep a clearer distinction between product requests and optional features, and instrument failure paths before the first operational incident.

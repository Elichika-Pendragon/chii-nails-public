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

## Sketching the algorithm with a chemistry background

My background is chemistry, not software engineering. I approached this part of the project by asking about variables, combinations, calculations and limits before worrying about code syntax. Could nail art, Cat Eye, extensions, glitter and removal be combined? How many possible combinations would that create? How much work would the server have to do?

That led to a concrete product idea: let a customer generate a short code from their calculator choices, paste it into the booking page and recover the details. I asked for five letters/numbers, an optional field for customers who did not use the calculator, editable final prices, and an owner dashboard to check or correct the order. I also explicitly asked to keep the owner's booking approval separate.

### From choices to a calculation

The following notation summarizes the reasoning; it is a retrospective explanation, not a claim that I wrote the implementation or these exact equations during development.

If each independent choice has `s_i` possible states, including unselected, the unconstrained combination count is:

```text
N = s_1 × s_2 × ... × s_n
```

Actual valid combinations are fewer when alternatives cannot be selected together or quantities have limits. Crucially, the system does not calculate and store every possible combination in advance. It validates the customer's selected items and calculates that order.

For each selected line, let `q_i` be its quantity and `[l_i, u_i]` its price range. A fixed price simply has `l_i = u_i`. Treat optional kit/glue charges as additional lines:

```text
Estimated minimum = Σ(q_i × l_i)
Estimated maximum = Σ(q_i × u_i)
Remaining balance = agreed final price − recorded payment
```

The chemistry connection is in the discipline of the calculation: define what each quantity means, keep units consistent, apply constraints and check the result. A price per nail and a price for ten nails cannot be treated as interchangeable units. Likewise, an estimate is not the same measurement as an agreed price, and an uploaded image is not confirmation that money arrived.

### What the short code actually does

My initial question was whether an algorithm could give each combination a unique short code. The implemented solution uses a randomly generated five-character reference to a stored estimate. The database checks uniqueness, and allocation retries a collision without overwriting another order. The same choices are not guaranteed to produce the same code. This avoids pretending that a tiny code can contain every selection, price and later correction.

I defined the desired behavior and questioned the computational cost. Codex selected and implemented the storage, random generation, collision handling, validation and tests. The code restores an estimate; it does not verify payment, reserve a slot or grant approval rights.

### From a result to evidence

When the Calendar incident appeared, I requested repeated simulations, investigation of the exact cause and retained error logs. That resembles the quality-control habit of investigating a result that does not match expectations. It also exposed a limit: repeating the same incomplete test cannot reveal an assumption the test never challenges. Codex had to change the provider-response fixtures, not merely run them more times.

My contribution was turning practical questions into requirements and challenging whether the outcome made sense. The technical implementation was AI-assisted. The lesson for my PM practice is to ask for representative failure cases and observable evidence, rather than equate a large test count with certainty.

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

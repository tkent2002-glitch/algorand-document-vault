# Security review feature freeze

The product feature set is frozen for independent security review as of
2026-08-30.

## Review candidate

- Git commit: `18def771b8452f95e4c7144c58d503975512368d`
- Candidate label: `security-review-candidate-2026-08-30`
- Product version: `0.1.0-alpha`
- Network: Algorand TestNet only
- Public application: <https://algorand-document-vault.pages.dev/>
- Audit status: unaudited; independent review not yet completed

At freeze time, the public application returned HTTP 200 with the expected
production entry assets from this source candidate:

- JavaScript: `/assets/index-A9PP8z7B.js`
- CSS: `/assets/index-BAAlZSUw.css`

Asset identifiers are supporting deployment evidence, not a substitute for
recording and reviewing the Git commit.

## Freeze policy

Until the review is closed, the following changes are permitted:

- fixes for confirmed security or correctness defects;
- tests that reproduce a suspected or confirmed finding;
- reviewer-requested observability that does not expose document data,
  secrets, or wallet material;
- security documentation, finding records, and reviewer instructions; and
- dependency changes needed to remediate a confirmed vulnerability.

The following changes are deferred:

- new product features or supported workflows;
- MainNet enablement or monetary-value transactions;
- backup, proof, or verification-link schema changes;
- wallet or transaction-policy expansion; and
- substantial interface redesign unrelated to a security finding.

## Candidate change control

Every code or dependency change after the candidate commit must:

1. use a pull request with both protected required checks passing;
2. identify the security finding or correctness defect it addresses;
3. include a regression test where practical;
4. be disclosed to the reviewer as a delta from the candidate; and
5. produce a new candidate commit and label if it changes the review target.

Documentation-only changes may continue without changing the code candidate,
but they must not claim that an independent review has started, passed, or
been accepted unless that is factually recorded.

## Exit criteria

The feature freeze ends only after:

- the independent reviewer identifies the exact commit assessed;
- all Critical and High findings are fixed and independently retested;
- remaining risks have an owner, rationale, and release decision;
- the final review scope and limitations are recorded; and
- the repository owner explicitly accepts the review outcome.

Public wording must remain **unaudited** and **TestNet only** until those exit
criteria are met.

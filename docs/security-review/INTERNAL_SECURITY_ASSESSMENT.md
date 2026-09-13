# Internal Security Assessment

## Classification and scope

- Assessment type: AI-assisted internal engineering review
- Baseline commit: `3885d9c3557a936ce5dafd6594ed6ba62a793ad0`
- Review date: September 12, 2026
- Product: Algorand Document Vault `0.1.0-alpha`
- Network boundary: Algorand TestNet only
- Independent audit status: not completed

This document corrects a proposed report that targeted an older commit and
overstated its audit status. It records internal findings and remediation work;
it is not an independent security audit, certification, penetration test, or
MainNet approval.

## Summary

No Critical or High finding was identified in this bounded internal pass. That
statement is limited to the reviewed controls and does not prove that the
application has no vulnerabilities. The final remediation commit must be
included in any later independent review.

## Findings

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| INT-01 | Low | The proof-payload specification was empty | Remediated by documenting note and portable-proof schemas, serialization, limits, and verification rules |
| INT-02 | Medium | New backups used 250,000 PBKDF2-SHA-256 iterations | Remediated for new backups with 600,000 iterations; restore accepts only the known 250,000 legacy value or 600,000 current value |
| INT-03 | Informational | A proposed finding claimed CSP headers were untested | Not reproduced: packaged-artifact browser tests and release packaging already validate CSP and required response headers |
| INT-04 | Low | Mutable password and plaintext byte copies could remain until garbage collection | Reduced by clearing UTF-8 password bytes after key import and decoded plaintext bytes after use; immutable JavaScript strings cannot be reliably erased |
| INT-05 | Informational | A proposed finding claimed Merkle boundary coverage was missing | Not reproduced: tests cover the 1,000-document limit, 1,001 rejection, ten-sibling paths, and first/middle/final proof verification |
| INT-06 | Low | Outage and retry behavior lacked one user-facing reference | Remediated with `docs/NETWORK_RECOVERY.md`; existing tests continue to enforce distinct unavailable, rejection, timeout, and recovery states |

## Controls observed

- Native Web Crypto SHA-256, PBKDF2-SHA-256, and AES-256-GCM primitives
- Strict verification-link and proof parsing with input limits
- Signed Algorand transaction decoding and policy revalidation before broadcast
- Proof-policy revalidation during confirmation recovery
- Structural and integrity validation before atomic backup import
- Versioned, domain-separated Merkle construction and bounded proof paths
- Content Security Policy and other release response-header checks
- TestNet-only product and transaction boundaries

## Residual risk

- JavaScript password strings are immutable and remain subject to browser
  garbage-collection behavior.
- Legacy 250,000-iteration backups remain readable for compatibility and should
  be re-exported to receive the current work factor.
- A weak user-selected password remains vulnerable to offline guessing.
- Browser/device compromise and third-party service availability remain outside
  the application's security boundary.
- The Merkle feature and these remediations have not received independent
  review.

## Required follow-up

Run unit, lint, build, tracked-content, release-readiness, browser-matrix, and
packaged-artifact gates on the final commit. Continue to describe the product
as **unaudited**, **pre-release**, and **TestNet only** until an independent
reviewer assesses and the owner formally accepts a specific commit.

## Remediation validation

The working tree passed the following gates on September 12, 2026:

- ESLint and the production TypeScript/Vite build;
- 53 Vitest files with 230 tests plus five release-policy tests;
- production dependency audit with zero reported vulnerabilities;
- sensitive tracked-content scan across 342 candidate files;
- release identity and TestNet-boundary checks across 172 production files;
- Chromium, Firefox, and WebKit Playwright matrix: 29 passed and four expected
  capability skips; and
- packaged-artifact direct-load, response-header, and Pera relay tests: two
  passed.

The local Playwright Firefox package initially failed to launch because of a
broken Windows side-by-side installation. It was force-reinstalled, and the
complete reduced-concurrency three-browser matrix then passed. This was an
environment repair, not an application-code workaround.

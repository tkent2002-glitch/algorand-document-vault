# Security Review Checklist

This is a reviewer aid, not evidence that a check passed. Mark each item Pass,
Fail, Not Tested, or Not Applicable and attach evidence or a finding reference.

## Target and methodology

- [ ] Exact commit, dates, environment, browser versions, and tools recorded
- [ ] Release tag and deployed-main delta identified
- [ ] Automated checks reproduced from `TEST_ENVIRONMENT.md`
- [ ] Review limitations and untested areas recorded

## Document and fingerprint boundary

- [ ] Hash covers the exact selected bytes and uses SHA-256 without text normalization
- [ ] UI/workflow state cannot reuse a stale fingerprint or wrong document
- [ ] Empty, large, replaced, renamed, and same-name/different-content files behave safely
- [ ] Original document bytes are not persisted, exported, logged, or transmitted
- [ ] Comparison is exact and filename/label is never treated as authority

Primary evidence: `src/services/crypto`, `src/services/notarization`,
`src/services/verification`, `tests/crypto`, and `tests/verification`.

## Proof JSON and verification links

- [ ] Schema version, allowed fields, types, formats, lengths, and network are strict
- [ ] Base64url/UTF-8/JSON parsing fails closed for malformed input
- [ ] Integrity digest is canonical and not misrepresented as a signature
- [ ] Unknown, duplicate, oversized, nested, or control-character input is safe
- [ ] Document mismatch is checked before a success result
- [ ] Transaction ID and confirmed round bind to the independently fetched receipt
- [ ] URL fragment does not reach the server and contains only documented metadata
- [ ] Untrusted document labels render as text without injection or UI deception

Primary evidence: `src/services/verification-link`,
`src/services/shareable-proof`, `tests/verification`, and
`docs/BlockchainProofSpecification.md`. Resource limits and residual targets
are recorded in `PRE_REVIEW_HARDENING.md`.

## Algorand and wallet boundary

- [ ] Transaction is a TestNet payment from the expected connected account
- [ ] Receiver equals sender, amount is zero, and fee is exactly 1,000 microAlgos
- [ ] Note exactly matches the canonical proof payload
- [ ] Close remainder, rekey, group, and lease side effects are rejected
- [ ] The inspected transaction is the transaction sent for Pera approval
- [ ] Signed bytes, submission response, transaction ID, and confirmed round remain bound
- [ ] Account/network changes, rejection, timeout, retry, and recovery fail safely
- [ ] Private keys and recovery words never cross into application state or logs
- [ ] Network unavailable/not found/mismatch states cannot become a false success

Primary evidence: `src/services/algorand`, `src/services/wallet`,
`tests/algorand`, and `tests/wallet`.

## Vault, migration, backup, and recovery

- [ ] IndexedDB contents are treated as local untrusted state, not immutable proof
- [ ] Corrupt or partial records fail safely and cannot poison repository initialization
- [ ] Legacy migration is idempotent, conflict-safe, and does not silently overwrite
- [ ] Backup schema and allowed fields are strict before import
- [ ] Integrity covers every security-relevant plain-backup field canonically
- [ ] Import preview matches the eventual atomic write set
- [ ] Duplicate/conflicting IDs are blocked without partial import
- [ ] Encrypted backup uses random salt/IV, PBKDF2-SHA-256 (250,000), and AES-256-GCM
- [ ] Wrong password, modified metadata/ciphertext, truncation, and resource exhaustion fail safely
- [ ] Password material and plaintext are not retained longer than necessary or logged

Primary evidence: `src/storage`, `src/repositories`,
`src/services/backup`, `src/services/security`, and corresponding tests.
The enforced import limits are recorded in `PRE_REVIEW_HARDENING.md`.

## Browser and presentation security

- [ ] No unsafe HTML or script evaluation is reachable from untrusted content
- [ ] CSP and response headers are present on direct and fallback routes
- [ ] Allowed wallet/network origins are minimal and justified
- [ ] External links use safe opener/referrer behavior where applicable
- [ ] Error messages and logs do not disclose document data or secrets
- [ ] Source maps, build output, caches, downloads, and clipboard flows are assessed
- [ ] UI wording keeps local match, public confirmation, TestNet, and legal limitations distinct

Primary evidence: React pages/components, `src/core/Logger.ts`,
`public/_headers`, and `tests/e2e/artifactSmoke.spec.ts`.

## Dependencies, CI, release, and deployment

- [ ] Lockfile and production dependency audit reviewed
- [ ] Dependency overrides and wallet/SDK versions justified
- [ ] GitHub Actions have least privilege and use appropriately pinned actions
- [ ] Pull-request checks and protected-main policy cannot be trivially bypassed
- [ ] Tracked-content scan catches secrets/private artifacts without unsafe blind spots
- [ ] Built artifact corresponds to reviewed source and passes direct-load/header smoke tests
- [ ] Cloudflare Pages configuration and deployment provenance are recorded
- [ ] Vulnerability reporting is private and reachable from public documentation

Primary evidence: `.github/workflows`, `package-lock.json`, `tools/release`,
`public/_headers`, `SECURITY.md`, and release documentation.

## Closeout

- [ ] Every finding has severity, confidence, reproduction, impact, and recommendation
- [ ] Accepted risks identify owner, rationale, and revisit date or release gate
- [ ] Critical/High fixes are independently retested
- [ ] Final report distinguishes reviewed code from later changes
- [ ] Public wording remains “unaudited” until the review is completed and accepted

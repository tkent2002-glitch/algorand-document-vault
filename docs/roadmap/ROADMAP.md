# Roadmap

## Phase 1 — Foundation

- React, TypeScript, and Vite application
- Core managers and page structure
- Document validation and SHA-256 hashing
- Evidence and proof models

## Phase 2 — Evidence workflows

- Notarization workflow
- Verification interface
- Evidence Vault
- Backup validation and import
- Repository boundary

## Phase 3 — Production-readiness foundation

- Automated tests
- Backup integrity and trust
- PBKDF2 and AES-GCM encrypted backups
- IndexedDB durable storage
- Legacy data migration and recovery
- Storage configuration centralization

## Phase 4 — Algorand TestNet integration and hardening

- Complete end-to-end TestNet validation
- Classify wallet rejection and connection failures
- Harden submission and confirmation errors
- Verify confirmed blockchain payloads
- Improve loading, retry, and timeout UX

## Phase 5 — Public alpha readiness

- Accessibility blocker remediation complete; manual assistive-technology review pending
- Cross-browser testing
- Performance testing
- User documentation and screenshots
- Release packaging
- `v0.1.0-alpha`

## Later review gates

- Independent security review (review package prepared; external review not started)
- Third-party engineering review
- MainNet readiness decision
- Production deployment plan

## Post-review feature candidates

### Merkle-tree batch anchoring

Merkle-tree functionality is under consideration for a future release. It is
not committed, implemented, or included in the current security-review scope.

The candidate workflow would hash multiple documents locally, construct a
deterministic and versioned Merkle tree, anchor one Merkle root in a single
Algorand transaction, and produce an independently verifiable proof for each
document in the batch. Document contents and filenames would remain off-chain.

Before implementation, this feature requires:

- a published Merkle construction and proof-format specification;
- a dedicated threat model and independent security review;
- IndexedDB, backup, and migration design for batch evidence;
- performance testing for large files and large document sets; and
- usability design that preserves the existing single-document workflow.

The current alpha continues to support one document fingerprint per Algorand
transaction.

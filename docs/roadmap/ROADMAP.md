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

Merkle-tree functionality is merged into `main` and has completed an initial
three-document live TestNet batch and per-document verification test. It is now
in physical-device, manual assistive-technology, and independent-review
validation. Automated fail-closed reload recovery, performance regression,
320-pixel reflow, keyboard, and accessible-control coverage are in place; see
the [Merkle batch validation record](../release/MERKLE_BATCH_VALIDATION.md).
It is not yet part of the tagged `v0.1.0-alpha` release or an independently
reviewed security scope.

The implemented workflow hashes multiple documents locally, constructs a
deterministic and versioned Merkle tree, anchors one Merkle root in a single
Algorand transaction, and produces an independently verifiable proof for each
document in the batch. Document contents and filenames would remain off-chain.

Before release, this feature requires:

- a published Merkle construction and proof-format specification;
- a dedicated threat model and independent security review;
- IndexedDB, backup, and migration design for batch evidence;
- browser and lower-memory-device performance testing at representative large
  file sizes (automated 1,000-document and 25 MiB regression coverage is now in
  place); and
- usability design that preserves the existing single-document workflow.

The current published alpha continues to support one document fingerprint per
Algorand transaction; the development build supports both formats.

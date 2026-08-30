# Storage Architecture

## Purpose

The storage layer preserves evidence records locally without storing original documents.

## Dependency path

```text
UI and workflows
→ EvidenceRepository
→ EvidenceStore contract
→ IndexedDbEvidenceStore
```

Pages and workflows do not access IndexedDB or localStorage directly.

## Active backend

IndexedDB is the active durable evidence store. Records are keyed by evidence-record ID and indexed by document hash.

## Legacy migration

Earlier versions used localStorage. Startup initialization can migrate legacy records into IndexedDB, block conflicting record IDs, retain the legacy copy as a rollback source, and write a completion marker after successful migration.

## Safety properties

- Migration is repeatable.
- Existing IndexedDB records are preserved.
- Identical record IDs are skipped.
- Same-ID/different-hash conflicts block activation.
- Unexpectedly empty IndexedDB storage can trigger recovery migration while the legacy copy remains available.

## Future work

- Review when it is safe to retire the legacy rollback copy.
- Add storage quota and failure UX.
- Test larger evidence repositories.
- Evaluate encrypted-at-rest storage separately from encrypted portable backups.

## Cross-device and third-party verification

The production validation on August 30, 2026 proved the current portability
boundary: a confirmed evidence record can be exported in a password-encrypted
backup, restored into a fresh browser, and used there to verify the unchanged
document. This is a safe recovery and manual-transfer mechanism, but it is not
automatic synchronization and it is not a complete third-party verification
experience.

Any next storage phase must preserve these boundaries:

- Original documents remain on the user's device and are never uploaded by the
  Vault.
- Local IndexedDB remains usable without an account, network connection, or
  cloud service.
- Cloud participation is optional and must not become a prerequisite for local
  notarization or verification.
- A document hash is linkable metadata, not anonymous data. It must not be
  published or used as a global lookup key without explicit user intent.
- Algorand confirmation is verified independently from any application database;
  cloud data cannot replace the on-chain transaction check.

The implementation sequence is:

1. **Shareable verification proof — implemented.** A confirmed record can be
   exported as `adv-shareable-verification-proof-v1`. The file contains the
   SHA-256 fingerprint, transaction ID, confirmed round, TestNet network label,
   export timestamp, and SHA-256 integrity metadata. It deliberately omits the
   original document, filename, wallet address, local record ID, and full Vault
   history. A recipient selects the document locally, opens the proof, and the
   verifier compares the fingerprint before independently checking the
   transaction ID, confirmation round, canonical `adv-proof-v1` note, and
   approved zero-amount TestNet transaction policy. No cloud account or Vault
   restore is required. The file integrity digest is corruption/tampering
   detection, not an identity or authorship signature.
2. **Optional encrypted device sync.** Synchronize client-encrypted evidence
   envelopes for users who want their Vault on multiple devices. Encryption and
   decryption remain client-side; the service stores ciphertext and minimal
   operational metadata. Key recovery, device revocation, conflict handling,
   deletion, and quota behavior require a separate threat model and ADR.
3. **Optional verification links.** A user may deliberately publish a minimal,
   immutable verification record behind an opaque share identifier. The
   recipient supplies the document locally; the portal retrieves evidence by the
   opaque identifier, compares the fingerprint in the browser, and validates the
   Algorand transaction. The service must not offer unauthenticated global search
   by raw document hash.

No cloud storage or hosted public verification service is implemented. Before
implementing later phases, record separate decisions for the encrypted evidence
envelope, identity and recovery model, retention and deletion behavior, public
metadata, abuse controls, availability expectations, and migration from the
local-only Vault.

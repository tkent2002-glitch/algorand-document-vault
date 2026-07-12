# Storage Architecture

## Purpose

The storage layer preserves evidence records locally without storing original documents.

## Dependency path

```text
UI and workflows
â†’ EvidenceRepository
â†’ EvidenceStore contract
â†’ IndexedDbEvidenceStore
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
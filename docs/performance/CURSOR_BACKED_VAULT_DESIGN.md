# Cursor-backed Vault Design

Status: design only. This document does not raise the public-alpha limit or
change the current IndexedDB schema.

## Trigger for implementation

Implement cursor-backed browsing before supporting materially more than 10,000
evidence records, or earlier if representative lower-tier devices exceed the
two-second Vault-ready target. Do not use a desktop-only benchmark to approve a
higher limit.

## Proposed stores

Keep `evidence-records` as the authoritative, lossless history store. Add an
`evidence-document-summaries` store keyed by SHA-256 fingerprint with:

- normalized document name;
- latest record ID, status, and numeric update timestamp;
- confirmed round when present; and
- history record count.

Add indexes for latest-update time, normalized document name, status, and
confirmed round. The summary is derived data: evidence records and their proof
payloads remain authoritative.

## Consistency rules

Every evidence write and corresponding summary update must occur in one
IndexedDB transaction. A schema upgrade must build summaries from existing
records and verify counts before committing. If verification fails, abort the
upgrade and leave the previous database version usable. Provide a deterministic
summary rebuild path for recovery.

Repository change events remain typed deltas. Cursor invalidation must be
explicit when an upsert changes the active ordering or filter.

## Query API

Introduce a separate browsing API rather than changing complete-export
semantics:

```ts
type VaultPageRequest = {
  after?: string;
  limit: number;
  search?: string;
  status?: EvidenceStatus;
  sort: VaultSortOrder;
};
```

The opaque cursor must encode the indexed sort value plus the unique summary
key so equal values paginate deterministically. Page responses return items,
the next cursor, and an exact or explicitly labeled estimated count.

IndexedDB cannot efficiently answer arbitrary substring searches with ordinary
indexes. Before implementation, choose and document one of these boundaries:

1. indexed prefix search on normalized filenames plus exact fingerprint search;
2. a separate locally maintained token index; or
3. a Web Worker operating on a compact local summary projection.

Do not silently weaken current substring-search behavior.

## Backups and recovery

Interactive cursor paging must not make backups partial. Export must iterate all
authoritative records with an IndexedDB cursor, preserve the current backup
schema and integrity calculation, and remain bounded against the existing input
limits. Restore must rebuild summaries transactionally after backup validation.

No document contents, filenames, fingerprints, performance metrics, or usage
telemetry may leave the device as part of this design.

## Acceptance gates

- Migration rollback and summary-rebuild tests pass with existing databases.
- Paging has no gaps or duplicates while values share the same sort key.
- Upserts correctly invalidate or update an active page.
- Search behavior is documented and regression tested.
- Complete backup and restore remain byte-for-byte compatible where specified.
- Physical lower-memory mobile testing meets the Vault-ready target.
- An independent security reviewer evaluates migration, cursor integrity, and
  denial-of-service boundaries before the supported limit is raised.

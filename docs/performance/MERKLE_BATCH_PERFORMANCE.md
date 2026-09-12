# Merkle Batch Performance

Measured September 12, 2026 on the Windows development workstation. These
results are regression evidence, not performance guarantees for every browser
or device.

## Dataset and method

- Production `BatchHashingService` and `MerkleTreeService` implementations
- 1,000 two-byte files to exercise the supported document-count limit
- 1,000 distinct SHA-256 fingerprints to exercise complete tree and
  membership-proof construction
- One zero-filled 25 MiB file as a representative large batch member
- Node.js 24 and Vitest on the development workstation

## Observed results

| Operation | Observed time |
| --- | ---: |
| Hash 1,000 locally represented files | 23.2 ms |
| Construct a 1,000-member tree and all proofs | 61.1 ms |
| Hash one 25 MiB batch member | 22.9 ms |

The complete 1,000-member tree produced ten-sibling membership paths. Proofs
for the first, middle, and final members reconstructed the same Merkle root.

## Automated regression ceilings

- Hashing 1,000 small documents must complete within 15 seconds.
- Hashing a representative 25 MiB document must complete within 15 seconds.
- Building a 1,000-member tree and proofs must complete within 5 seconds.

The ceilings are intentionally much higher than the observed workstation
times to reduce CI flakiness while still detecting material regressions.

## Remaining validation

The application permits files up to 256 MiB and batches up to 2 GiB. Running
those absolute byte limits in routine CI would impose disproportionate memory
and artifact costs, so the limits are enforced by unit tests rather than fully
allocated on every run. Before promoting batch anchoring beyond alpha, repeat
large-file testing in supported desktop browsers and on a representative
lower-memory device. Record browser responsiveness, peak memory, cancellation,
and recovery behavior; do not extrapolate the workstation timings above into a
user-facing performance guarantee.

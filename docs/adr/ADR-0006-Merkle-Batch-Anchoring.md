# ADR-0006: Versioned Merkle Batch Anchoring

## Status

Accepted for implementation on the post-alpha feature branch. This decision is
outside the frozen `v0.1.0-alpha` security-review candidate.

## Context

The Version 1 proof model commits one SHA-256 document fingerprint to one
Algorand transaction. Users also need to anchor a collection of documents with
one transaction while retaining an independently verifiable proof for every
document.

Replacing the Version 1 format would invalidate existing proofs and expand the
current review boundary. Storing a complete manifest on-chain would disclose
metadata and exceed Algorand note limits for useful batch sizes.

## Decision

Add a Version 2 `merkle-batch` proof alongside the existing Version 1
`document-integrity` proof.

- Every selected file is hashed locally with SHA-256.
- A deterministic, domain-separated Merkle tree commits the fingerprints.
- Only the root, unique algorithm identifiers, and leaf count are written to
  the Algorand note.
- Filenames, relative paths, document bytes, and Merkle paths remain off-chain.
- Each local batch member receives a membership proof that can be exported in a
  Version 2 shared-proof or verification-link envelope.
- Existing Version 1 creation and verification behavior remains supported.

The normative construction and validation rules are defined in
[`MerkleProofSpecification.md`](../MerkleProofSpecification.md).

## Consequences

One transaction can anchor hundreds of documents, and a recipient can verify a
single member without receiving the rest of the batch. The application must now
protect an additional cryptographic boundary: canonical ordering, duplicate
occurrences, tree construction, proof parsing, transaction binding, and batch
storage must all agree exactly.

The feature therefore requires deterministic test vectors, strict input limits,
an IndexedDB migration, backup-format evolution, cross-browser validation, and
independent review before a release can claim production readiness.


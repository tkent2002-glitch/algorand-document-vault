# ADv Merkle Batch Proof Specification

## Status and compatibility

This document defines the candidate `adv-merkle-sha256-v1` construction for the
post-alpha Merkle batch feature. It does not change or reinterpret existing
`adv-proof-v1` single-document proofs.

Normative terms **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are used in their
usual standards sense.

## Security and privacy boundary

- Document bytes MUST be processed locally and MUST NOT be persisted or
  transmitted by the application.
- Filenames and relative paths MUST NOT be included in the Merkle commitment or
  Algorand note.
- SHA-256 document fingerprints, Merkle paths, transaction identifiers, and
  locally chosen display labels are evidence metadata, not document content.
- A valid proof establishes membership of exact document bytes in the anchored
  batch. It does not establish authorship, identity, ownership, legality,
  truthfulness, or the document's filename at anchoring time.

## Limits

- A batch MUST contain between 1 and 1,000 files.
- Every document fingerprint MUST be exactly 32 bytes and represented externally
  as 64 lowercase hexadecimal characters.
- Duplicate document fingerprints are permitted and MUST be assigned distinct
  zero-based occurrence numbers.
- A membership proof MUST contain no more than 10 sibling nodes for the current
  1,000-file limit.
- Every sibling node and root MUST be exactly 32 bytes.
- Empty files remain rejected by the current document-validation policy.

## Byte encoding

- All domain strings are UTF-8 bytes including the terminating zero byte shown
  below.
- Fingerprints and tree nodes are decoded from hexadecimal to their raw 32 bytes
  before hashing.
- Occurrence numbers are unsigned 32-bit big-endian integers.
- Concatenation is written as `||`.

## Canonical leaf ordering

1. Validate every input fingerprint.
2. Sort entries by their raw document fingerprint bytes in ascending
   lexicographic order.
3. For equal fingerprints, assign occurrence numbers `0`, `1`, and so on.
4. Preserve local filename associations separately; they do not affect ordering.

This makes the root independent of file-selection order while representing the
multiplicity of byte-identical documents.

## Leaf construction

```text
leaf = SHA-256(
  UTF8("ADV-MERKLE-LEAF-V1\0") ||
  documentFingerprintBytes ||
  occurrenceUint32BE
)
```

## Internal-node construction

```text
node = SHA-256(
  UTF8("ADV-MERKLE-NODE-V1\0") ||
  leftNodeBytes ||
  rightNodeBytes
)
```

At each level, adjacent nodes are paired from left to right. When a non-root
level contains an odd final node, that node MUST be duplicated as both the left
and right input for its parent. A one-leaf tree uses its leaf hash as the root.
An empty tree is invalid.

## Membership proof

A membership proof contains:

- `algorithm`: `adv-merkle-sha256-v1`;
- the document fingerprint;
- its occurrence number;
- its zero-based canonical leaf index;
- the total leaf count;
- the expected Merkle root; and
- an ordered array of siblings, each with a 32-byte hash and `left` or `right`
  position relative to the running value.

Verification MUST recompute the domain-separated leaf, fold every sibling in
order, validate all lengths and limits, and compare the result to the expected
root using exact byte equality.

## Algorand proof note

The canonical JSON note uses these keys in this order and contains no
whitespace:

```json
{"schema":"adv-proof-v2","proofType":"merkle-batch","hashAlgorithm":"SHA-256","treeAlgorithm":"adv-merkle-sha256-v1","root":"<64 lowercase hex>","leafCount":500}
```

The signed-transaction and confirmation-recovery paths MUST validate the exact
UTF-8 note bytes, transaction ID, sender, receiver, amount, fee, genesis,
validity window, and prohibited side-effect fields under the existing ADv
transaction policy.

## Deterministic test vectors

The source documents are the single UTF-8 characters `a`, `b`, `c`, and `d`.

| Document | SHA-256 fingerprint |
| --- | --- |
| `a` | `ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb` |
| `b` | `3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d` |
| `c` | `2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6` |
| `d` | `18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4` |

| Input multiset | Expected root |
| --- | --- |
| `a` | `e7eb7d17c2a39c57f85e99178181e8b7ee5edc767839e241b1f67604171b066c` |
| `a`, `b` | `e835cd1404dab0f4ac5bf193945f981d91e41b8cae9b01a851f51f5a5dc8f677` |
| `a`, `b`, `c` | `29c6e5cb7cfc5e43c2ff12573695f651034ba0e956d631a3e2d9e2d7f0364353` |
| `a`, `b`, `c`, `d` | `39e93c0fad3ed0a9a77376e3acabce8dfea503e231bac3c69555f6400897060a` |
| `a`, `a` | `d832b6502b6214b5dd57d1bf1103b1f2275f0721a4af8b5a266b473544fd0382` |

Inputs are sorted by fingerprint bytes before leaf creation; the table's input
display order is descriptive rather than the tree order.

## Versioning

Any change to domains, encoding, sorting, occurrence handling, odd-node rules,
or proof fields MUST use a new tree-algorithm identifier. Implementations MUST
reject unsupported identifiers rather than guessing.

## Portable member proof

Each share link carries one `adv-merkle-shareable-verification-proof-v1`
payload. It contains the member fingerprint, occurrence, canonical leaf index,
leaf count, root, ordered sibling path, transaction ID, confirmed round, and an
integrity digest. It does not contain the document bytes, the other batch
fingerprints, a wallet address, or a local record ID.

A verifier MUST validate the payload shape and integrity digest, reconstruct
the root from the selected document fingerprint and sibling path, retrieve the
claimed Algorand transaction, and require the exact canonical Version 2 note.
Passing only one of membership or transaction validation is insufficient.

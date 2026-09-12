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
| `a` | `e2b985002888895474985c9bcf7b08c73abc1d5698c56fde67b204b953506963` |
| `a`, `b` | `1f4bfbe98a7d1a58b04f5153917af79c259ad01b0a1fc7e240d6ee9833474366` |
| `a`, `b`, `c` | `d9f80faab2616e5569ff242d907b9beb27499090702dce397914799c1b2d6378` |
| `a`, `b`, `c`, `d` | `1a6a978a671cc30fede40325bef7e2d5161aefd93fdc0336b477c509cbee7a39` |
| `a`, `a` | `71ee67a80151a4ffaa818d35cf3ba7bacdf61c5ce62174914dc2d8a89f2ab5c9` |

Inputs are sorted by fingerprint bytes before leaf creation; the table's input
display order is descriptive rather than the tree order.

## Versioning

Any change to domains, encoding, sorting, occurrence handling, odd-node rules,
or proof fields MUST use a new tree-algorithm identifier. Implementations MUST
reject unsupported identifiers rather than guessing.


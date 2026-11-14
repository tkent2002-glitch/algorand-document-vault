# ADv Proof Payload Specification

## Status

This document specifies the proof formats implemented by Algorand Document
Vault `0.1.0-alpha`. It covers the bytes placed in an Algorand transaction note
and the portable JSON files or URL-fragment envelopes used for verification.
It does not define a digital signature, identity assertion, ownership claim, or
legal notarization.

Normative terms **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are used in their
usual standards sense. Unsupported schemas, additional fields, malformed
encodings, and mismatched integrity values MUST fail closed.

## Common encodings

- JSON text is UTF-8.
- SHA-256 values are exactly 64 lowercase hexadecimal characters.
- Algorand transaction IDs are exactly 52 uppercase Base32 characters.
- Confirmation rounds are positive safe integers.
- Export timestamps use UTC ISO 8601 with millisecond precision, for example
  `2026-09-12T00:00:00.000Z`.
- Portable-proof integrity is SHA-256 over the UTF-8 bytes of `JSON.stringify`
  applied to the payload object without its `integrity` member. This is a
  deterministic application serialization, not a general JSON canonicalization
  standard and not an authenticity signature.

## Algorand note payloads

### Version 1: one document

The exact property order is `schema`, `proofType`, `hashAlgorithm`, `hash`.

```json
{"schema":"adv-proof-v1","proofType":"document-integrity","hashAlgorithm":"SHA-256","hash":"<64 lowercase hex>"}
```

### Version 2: Merkle batch

The exact property order is `schema`, `proofType`, `hashAlgorithm`,
`treeAlgorithm`, `root`, `leafCount`.

```json
{"schema":"adv-proof-v2","proofType":"merkle-batch","hashAlgorithm":"SHA-256","treeAlgorithm":"adv-merkle-sha256-v1","root":"<64 lowercase hex>","leafCount":500}
```

The complete tree construction and member-path rules are defined in
[MerkleProofSpecification.md](MerkleProofSpecification.md). The note MUST fit
within Algorand's 1,024-byte note limit. Transaction validation requires exact
note bytes in addition to the documented sender, receiver, amount, fee,
genesis, validity-window, transaction-ID, and prohibited-side-effect checks.

## Portable single-document proof

Schema identifier: `adv-shareable-verification-proof-v1`.

| Path | Type and constraint |
| --- | --- |
| `schema` | Exact schema identifier |
| `network` | Exact string `algorand-testnet` |
| `exportedAt` | UTC ISO timestamp described above |
| `evidence.hashAlgorithm` | Exact string `SHA-256` |
| `evidence.hashValue` | SHA-256 document fingerprint |
| `evidence.transactionId` | Algorand transaction ID |
| `evidence.confirmedRound` | Positive safe integer |
| `integrity.algorithm` | Exact string `SHA-256` |
| `integrity.digest` | SHA-256 digest of the payload without `integrity` |

The payload used for the integrity digest MUST be reconstructed with keys in
this order: `schema`, `network`, `exportedAt`, `evidence`. Evidence keys MUST be
ordered `hashAlgorithm`, `hashValue`, `transactionId`, `confirmedRound`.

Structurally valid example (the all-`A` transaction ID illustrates the encoded
shape and is not claimed to identify a confirmed network transaction):

```json
{
  "schema": "adv-shareable-verification-proof-v1",
  "network": "algorand-testnet",
  "exportedAt": "2026-09-12T00:00:00.000Z",
  "evidence": {
    "hashAlgorithm": "SHA-256",
    "hashValue": "0000000000000000000000000000000000000000000000000000000000000000",
    "transactionId": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "confirmedRound": 1
  },
  "integrity": {
    "algorithm": "SHA-256",
    "digest": "c1813358787b45de329f50e894b4cd3b764506c1c3c3bc52be38a350578c90c8"
  }
}
```

## Portable Merkle-member proof

Schema identifier: `adv-merkle-shareable-verification-proof-v1`.

It uses the same top-level `schema`, `network`, `exportedAt`, `evidence`, and
`integrity` members. Its evidence object contains, in this order:

| Field | Type and constraint |
| --- | --- |
| `hashAlgorithm` | Exact string `SHA-256` |
| `hashValue` | Member document fingerprint |
| `treeAlgorithm` | Exact string `adv-merkle-sha256-v1` |
| `root` | SHA-256 Merkle root |
| `occurrence` | Non-negative safe integer below `leafCount` |
| `leafIndex` | Non-negative safe integer below `leafCount` |
| `leafCount` | Integer from 1 through 1,000 |
| `siblings` | Exact-length ordered membership path, at most 10 entries |
| `transactionId` | Algorand transaction ID |
| `confirmedRound` | Positive safe integer |

Each sibling is an object containing only `position` (`left` or `right`) and a
64-character lowercase hexadecimal `hash`. The integrity payload key order is
the same as for the single-document proof, with evidence fields ordered as in
the table.

## Verification requirements

A verifier MUST:

1. enforce encoded-size limits before Base64url decoding or JSON parsing;
2. require an object with only the fields allowed by its declared schema;
3. validate every type, length, format, count, and algorithm identifier;
4. recompute and compare the portable-proof integrity digest;
5. hash the selected document bytes locally and require an exact fingerprint
   match;
6. for a Merkle member, reconstruct and validate the root from the complete
   path;
7. retrieve the claimed transaction from Algorand TestNet;
8. require its transaction ID, confirmation round, and exact ADv note to match;
9. apply the complete ADv transaction policy; and
10. report unavailable network state separately from an invalid proof.

A proof is invalid if it contains an unknown field, unsupported schema or
algorithm, malformed hash or transaction ID, non-canonical membership path,
incorrect digest, mismatched document, mismatched transaction, or prohibited
transaction side effect. Network unavailability MUST NOT be reported as proof
invalidity or successful verification.

## Versioning and compatibility

Fields MUST NOT be added to an existing schema identifier. Any semantic,
ordering, hashing, tree, or encoding change requires a new schema or algorithm
identifier. Readers MUST reject unknown versions rather than guessing.

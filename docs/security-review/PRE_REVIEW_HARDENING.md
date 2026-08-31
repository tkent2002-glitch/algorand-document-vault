# Pre-review security hardening

This document records the bounded input-hardening pass completed before an
independent review. It is implementation evidence, not an audit result.

## Enforced resource limits

The canonical values live in
`src/services/security/InputSecurityLimits.ts`.

| Input | Limit | Enforcement point |
| --- | ---: | --- |
| Pasted verification link | 16 KB characters | UI and verification-link parser, before Base64url decoding |
| Technical proof JSON file | 64 KB | UI, before `File.text()` |
| Plain or encrypted backup file | 20 MB | Restore UI, before `File.text()` or JSON parsing |
| Records in one backup | 10,000 | Structural backup validation, before per-record processing |
| Validation errors returned | 100 | Structural backup validation |
| Parsed JSON nesting | 32 levels | Iterative structural validation, before integrity processing |
| Parsed JSON nodes | 250,000 | Iterative structural validation, before integrity processing |
| Encrypted ciphertext string | 20 MB characters | Encryption service, before Base64 decoding |
| Backup password | 1,024 characters | Encryption service, before PBKDF2 |

Document names, record identifiers, transaction identifiers, timestamps,
confirmation rounds, nested proof objects, and integrity metadata are also
type- and length-checked before import.

## Fail-closed behavior

- Verification links reject non-Base64url input, malformed UTF-8, oversized
  fragments, unsupported fields, unsupported versions, and invalid proofs.
- Backup validation treats every parsed record and nested proof value as
  untrusted. Primitive, null, missing, or malformed values produce bounded
  validation errors instead of property-access exceptions.
- Oversized backups are rejected before reading their contents. Backups above
  the record limit are rejected before the per-record loop.
- Encrypted backup envelopes validate their schema, algorithm, KDF parameters,
  metadata sizes, ciphertext size, and password size before expensive crypto.
- Import remains blocked until structural validation and the backup integrity
  digest both pass.

## Regression evidence

The automated suite includes adversarial cases for oversized links, malformed
Base64url/UTF-8, non-object backup records, unsafe record counts, record-count
resource exhaustion, malformed integrity metadata, malformed encrypted
envelopes, and excessive password input. Run the full commands in
[TEST_ENVIRONMENT.md](TEST_ENVIRONMENT.md).

## Residual review targets

- Native `JSON.parse` resolves duplicate object member names using normal
  JavaScript semantics. The integrity digest binds the parsed backup/proof
  semantics, but an independent reviewer should still test duplicate-member
  ambiguity across producers and consumers.
- The limits are availability controls, not a guarantee that every supported
  browser/device can process the maximum-sized input comfortably.
- TestNet receipt availability and wallet/network behavior remain third-party
  dependencies and should be tested under timeout, substitution, and stale
  response conditions.
- This pass does not change the product's unaudited, TestNet-only status.

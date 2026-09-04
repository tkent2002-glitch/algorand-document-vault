# Threat Model

## Security claims

Algorand Document Vault makes narrow integrity claims:

- the selected file is hashed locally with SHA-256;
- a local match means the fingerprint equals evidence stored in this browser's
  Vault;
- a public match additionally means the fingerprint and canonical proof note
  match a confirmed Algorand TestNet transaction that satisfies the application
  transaction policy; and
- encrypted backups use password-derived AES-256-GCM authenticated encryption.

It does not claim document confidentiality against a compromised device,
authorship, identity, consent, legal validity, or truthfulness.

## Assets

| Asset | Required property |
| --- | --- |
| Original document | Remains on the user's device; is not persisted or uploaded by the application |
| SHA-256 fingerprint | Correctly represents the exact selected bytes |
| Evidence record and history | Integrity, deterministic interpretation, conflict-safe import and migration |
| Encrypted backup | Confidentiality and integrity under the password/device assumptions |
| Shareable proof/link | Strict parsing, unambiguous fingerprint/transaction binding, no secret content |
| Wallet approval | The user signs only the reviewed, policy-compliant transaction |
| Algorand receipt | Network, transaction ID, round, note, and side-effect policy are verified |
| Release artifact | Matches reviewed source and does not contain sensitive material |

## Trust boundaries and data flow

```text
Untrusted local file
        |
        v
Browser File API -> local SHA-256 -> workflow/service boundary
                                      |              |
                                      v              v
                              IndexedDB Vault   proof/link export
                                      |              |
                                      v              v
                              backup export     untrusted recipient

Connected account -> transaction builder -> Pera approval/signing
                                               |
                                               v
                                        Algorand TestNet
                                               |
                                               v
Untrusted proof/link -> strict parser -> document hash comparison
                                   -> TestNet receipt + transaction policy
```

Trust assumptions:

- the browser, Web Crypto implementation, operating system, selected file
  bytes, and device are trustworthy at the time of use;
- the user independently protects the wallet and backup password;
- Pera Wallet is the private-key boundary; this application never receives or
  stores wallet private keys;
- IndexedDB is local convenience storage, not a tamper-proof authority;
- AlgoNode and network responses are untrusted inputs whose relevant transaction
  fields must be checked; Algorand consensus itself is assumed;
- a proof integrity digest detects accidental or unsophisticated modification
  but is not a signature or proof of authorship.

## Threat scenarios and existing controls

| ID | Scenario | Existing controls | Residual risk / review focus |
| --- | --- | --- | --- |
| T1 | Hash confusion, wrong bytes, or stale selection creates a false match | SHA-256 over selected bytes; explicit selected-document display; exact equality | Browser/File API compromise; UI state races and repeated-selection flows |
| T2 | Crafted proof/link adds fields, changes encoding, or injects a label | Versioned schemas, allowed-key checks, format/length checks, integrity digest, React text rendering | Parser resource exhaustion, Unicode/UI ambiguity, fragment length, digest canonicalization |
| T3 | Valid proof is paired with a different document | Fingerprint comparison precedes public confirmation; filename is guidance only | User comprehension and any bypass around comparison state |
| T4 | Confirmed but unsafe Algorand transaction is accepted | TestNet genesis, self-payment, zero amount, fixed fee, exact note, sender/receiver, no close/rekey/group/lease | SDK decoding differences, missing fields, round/ID binding, future transaction types |
| T5 | Transaction changes between display, signature, submission, or persistence | Policy inspection, Pera signing boundary, wallet-returned bytes decoded and revalidated before submission, transaction-ID binding, and proof-policy validation during recovery | Multi-account/session changes, wallet implementation compromise, and timeout paths |
| T6 | Malicious backup corrupts or replaces evidence | Schema and integrity validation, import preview, record-ID conflict blocking, isolated migration | Oversized/nested input, denial of service, partial writes, rollback, canonicalization |
| T7 | Backup password is guessed or ciphertext is modified | PBKDF2-SHA-256 (250,000 iterations), random 16-byte salt, AES-256-GCM, random 12-byte IV, minimum 12-character password | Offline guessing of weak user passwords, platform performance, parameter agility |
| T8 | Local script, extension, or shared browser profile reads/changes Vault data | CSP, no original-document persistence, documented local-device boundary | XSS, dependency compromise, browser extensions, shared profiles, deletion/rollback |
| T9 | Sensitive content enters logs, links, exports, or artifacts | Proof/link omits document bytes, wallet address, local record ID, and history; tracked-content scan | Document label disclosure in links; errors, source maps, CI logs, future fields |
| T10 | Compromised dependency or pipeline changes the public build | Lockfile, CI quality/security and browser checks, production audit, artifact smoke test, protected main | Maintainer account compromise, mutable third-party services/actions, deployment provenance |
| T11 | TestNet evidence is mistaken for MainNet or legal proof | TestNet-only configuration and UI labels; documented proof boundary | Social engineering, screenshots without context, future network configuration drift |
| T12 | Third-party outage or malicious response creates a false negative/positive | Unavailable is distinct from invalid; receipt fields and policy are independently checked | Endpoint censorship, stale data, availability, error classification |

## Severity guide

- **Critical:** practical false public verification, wallet/private-key compromise,
  unauthorized value-bearing transaction, or widespread release compromise.
- **High:** bypass of an essential integrity/confidentiality control with realistic
  preconditions, or destructive evidence corruption without a safe recovery path.
- **Medium:** meaningful security degradation requiring notable user/environment
  conditions, or a reliable denial of a security workflow.
- **Low:** defense-in-depth weakness, limited disclosure, or confusing behavior
  that increases security error likelihood.
- **Informational:** hardening or documentation improvement without a demonstrated
  security impact.

Severity must reflect this alpha's TestNet-only boundary while still accounting
for user documents and backups, which may be sensitive.

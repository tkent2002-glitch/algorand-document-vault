# ADR-0002: Proof of Integrity, Not Legal Authenticity

## Status

Accepted

## Decision

The application does not prove that a document is legally authentic, truthful, enforceable, or valid.

The application proves only that:

- A document hash existed.
- The hash was recorded.
- A later uploaded document either matches or does not match the recorded hash.

## Consequences

The user interface and documentation must avoid overstating what the system proves.

Preferred language:

- Integrity verified
- Hash match
- Proof found
- Document matches notarized fingerprint

Avoid language such as:

- Legally authentic
- Legally valid
- Truth proven

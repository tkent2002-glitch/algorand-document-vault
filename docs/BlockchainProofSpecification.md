# Blockchain Proof Specification

## Purpose

The blockchain proof exists to record that a specific SHA-256 document fingerprint existed at the time it was written to Algorand.

## On-Chain Data

The minimum on-chain proof should contain:

- Application identifier
- Schema version
- Hash algorithm
- Hash value

## Off-Chain Data

The following data remains off-chain:

- The document itself
- File name
- File size
- MIME type
- Parties to a contract
- Beneficiaries
- Personal information
- Legal metadata
- Private business data

## Verification Process

To verify a document:

1. The holder uploads or selects a document.
2. The application calculates the SHA-256 hash.
3. The application compares that hash to a recorded Algorand proof.
4. If the hashes match, the document is identical to the notarized version.
5. If the hashes do not match, the document has changed or is not the notarized version.

## Non-Goals

The system does not prove:

- Legal authenticity
- Truthfulness
- Enforceability
- Identity of signers
- Authority of signers
- Whether a document was signed voluntarily

## Amendment Rule

Every amended or changed document receives a new hash and a new notarization.

No previous notarization is modified or replaced.

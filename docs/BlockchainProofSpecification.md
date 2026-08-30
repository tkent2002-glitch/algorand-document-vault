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

To verify a document with a shared proof:

1. The holder selects the document locally; it is not uploaded.
2. The application calculates the SHA-256 hash.
3. The application validates the shared proof structure and integrity digest.
4. The application compares the local hash with the proof fingerprint.
5. The application retrieves the referenced TestNet transaction and checks its
   transaction ID, confirmed round, canonical proof note, network, zero payment,
   self-payment receiver, fixed fee, and absence of close, rekey, group, and
   lease side effects.
6. Verification succeeds only when the document fingerprint and every public
   transaction check match.

The share-file integrity digest is not a signature and does not establish the
identity of the exporter. The confirmed on-chain transaction is the independent
public anchor.

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

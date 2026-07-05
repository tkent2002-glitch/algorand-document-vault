# Design Principles

## 1. Cryptographic Integrity, Not Legal Authenticity

The Algorand Document Vault does not determine whether a document is legally authentic, truthful, enforceable, or valid.

The system verifies cryptographic integrity only.

It can prove that:

- A SHA-256 fingerprint was created for a document.
- That fingerprint was recorded on Algorand.
- A later uploaded document either matches or does not match that recorded fingerprint.

## 2. Proof of Hash Only

Sensitive documents and private metadata remain with the document holder or host.

The blockchain stores only proof of the document hash.

The blockchain must not store:

- Document contents
- File names
- Beneficiary names
- Contract parties
- Personal information
- Legal details
- Private metadata

## 3. Immutable Notarizations

A notarization is never edited or overwritten.

If a document is amended, changed, corrected, or replaced, the changed document receives a new hash and a new notarization.

Future versions may reference earlier notarizations, but earlier proofs remain unchanged.

## 4. Dispute Resolution Boundary

The system can help resolve disputes about whether a presented document is bit-for-bit identical to a previously notarized document.

It does not resolve disputes about legal meaning, signer authority, fraud, duress, or enforceability.

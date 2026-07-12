# Algorand Document Vault

## Mission

Provide verifiable cryptographic evidence of document integrity while keeping
users in complete control of their documents and private keys.

The application creates, preserves, and verifies cryptographic evidence.
It does not store user documents on-chain and it never has access to private keys.

---

# Product Identity

Algorand Document Vault is a security-first evidence platform.

Blockchain notarization is the mechanism.

Evidence preservation is the product.

---

# Core Principles

## Security First

Documents remain under the user's control.

Only cryptographic proof data is prepared for blockchain storage.

Private keys never enter the application.

Wallet signing is performed entirely by Pera Wallet.

---

## Evidence First

Evidence Records are the primary asset of the application.

Blockchain transactions exist to strengthen an Evidence Record.

The Vault is an Evidence Repository, not a transaction list.

---

## Verification First

The application never claims a document is "true."

It only determines whether an uploaded document matches the cryptographic
fingerprint represented by an Evidence Record.

Verification is objective.

Interpretation belongs to the user, auditor, mediator, arbitrator, or court.

---

## Privacy First

Documents remain off-chain.

Sensitive metadata remains off-chain.

Only the minimum cryptographic proof required is prepared for Algorand.

---

# What the Application Can Prove

The application can demonstrate:

• A document produced a specific SHA-256 fingerprint.

• A proof payload was created.

• That proof was anchored to Algorand.

• The blockchain accepted the transaction.

• A later document either matches or does not match the recorded fingerprint.

---

# What the Application Does NOT Prove

The application cannot determine:

• Legal ownership

• Authenticity of document contents

• Truthfulness

• Contract enforceability

• Identity of the author

• Intent of the signer

Those questions are outside the scope of cryptographic evidence.

---

# Evidence Record Lifecycle

Document

↓

SHA-256 Fingerprint

↓

Proof Payload

↓

Evidence Record

↓

Wallet Signature

↓

Blockchain Submission

↓

Confirmation

↓

Evidence Vault

↓

Verification

---

# Product Decision Filter

Every future feature should answer:

"Does this make the evidence more trustworthy,
more understandable,
or easier to verify?"

If not, the feature should be reconsidered.

---

# Deferred Features

The following remain intentionally deferred:

• Stablecoin settlement
• Zero-knowledge proofs
• Enterprise collaboration
• Cloud synchronization
• Case management
• Version history
• Advanced audit reporting

These features may be added in future releases without changing the mission of
the application.

---

# Version 1.0 Goal

Deliver a complete end-to-end evidence workflow:

Create Evidence

↓

Preserve Evidence

↓

Verify Evidence

with a professional user experience, strong security architecture,
and cryptographically verifiable blockchain proofs.


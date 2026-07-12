# Chapter 10: Blockchain Lifecycle Completion

## Purpose

Complete the end-to-end blockchain evidence lifecycle.

The application already creates document fingerprints, proof payloads, evidence records, wallet connections, transaction drafts, and wallet signatures.

Chapter 10 turns signed transactions into confirmed Algorand evidence.

## Scope

Chapter 10 will complete:

1. Signed transaction submission
2. Transaction confirmation polling
3. Evidence Record status updates
4. Algorand transaction metadata storage
5. Explorer link generation
6. Vault display of confirmed blockchain evidence

## Current State

Completed:

- Document hashing
- Proof payload creation
- Evidence Record creation
- Evidence Vault
- Verification workspace
- Pera Wallet connection
- Pera Wallet signing
- Signed transaction submission service foundation

Pending:

- Submit signed transaction from UI
- Wait for confirmation
- Store confirmation details
- Display blockchain metadata
- Link to Algorand explorer

## Milestones

### Chapter 10.1 — Submit Signed Transaction

Submit signed transaction bytes to Algorand TestNet and return a transaction ID.

### Chapter 10.2 — Confirmation Polling

Wait for the transaction to be confirmed and capture the confirmed round.

### Chapter 10.3 — Evidence Record Blockchain Update

Update the Evidence Record from draft/signed to submitted/confirmed.

### Chapter 10.4 — Explorer Link

Generate a trusted Algorand explorer link for the transaction.

### Chapter 10.5 — Vault Blockchain Metadata

Display transaction ID, network, submitted time, confirmation round, and explorer link in the Evidence Vault.

## Design Principle

The blockchain is the trust anchor.

The Evidence Record remains the user's primary object.

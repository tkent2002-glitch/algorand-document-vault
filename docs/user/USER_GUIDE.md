# User Guide

## Dashboard

The dashboard links to notarization, verification, evidence storage, and wallet management.

## Notarize

Selecting a document creates a local SHA-256 fingerprint, proof payload, and draft evidence record. After connecting a Pera Wallet, the user can review, sign, submit, and confirm the proof transaction.

## Verify

Selecting a document recomputes its fingerprint and searches the local Evidence Vault for a matching record.

## Vault

The Vault groups evidence history by document fingerprint and shows status, timestamps, proof details, transaction metadata, backup export, and safe import previews.

## Wallet

The Wallet page connects, restores, and disconnects a Pera Wallet session. The application does not receive the wallet's private keys.

Pera Web and Pera Mobile accounts do not automatically synchronize. The current
mobile QR/deep-link connection experience must be revalidated before public
alpha. Never enter a wallet recovery phrase into Algorand Document Vault.

## Important limitations

- Verification searches the local vault unless blockchain verification is explicitly shown.
- No matching local record does not prove that a document is invalid.
- A blockchain timestamp does not prove that the document's contents are true or legally binding.
- TestNet ALGO is valueless development currency; MainNet funds are out of scope.

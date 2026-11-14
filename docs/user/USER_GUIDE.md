# User Guide

## Dashboard

The dashboard links to notarization, verification, evidence storage, and wallet management.

## Notarize

Selecting a document creates a local SHA-256 fingerprint, proof payload, and draft evidence record. After connecting a Pera Wallet, the user can review, sign, submit, and confirm the proof transaction.

## Verify

Verification follows three steps:

1. Select the document. Its SHA-256 fingerprint is calculated locally.
2. Choose **This device's Vault** or **Shared verification**.
3. Review one local or public result.

Local verification searches this browser's Evidence Vault. For public
verification, open the link sent by the document owner and then select the
document named by the link. The name is guidance only; the calculated
fingerprint determines whether the document matches.

The application checks the link's proof integrity, compares the locally
calculated fingerprint, and independently retrieves the referenced Algorand
TestNet transaction. A result is reported as verified only when the
confirmation round, transaction ID, canonical ADv note, and transaction safety
policy all match. A technical proof JSON can be selected under the advanced
fallback when a link cannot be shared.

The shared proof contains the SHA-256 fingerprint, TestNet transaction ID,
confirmed round, export timestamp, and an integrity digest. It does not contain
the original document, filename, wallet address, or local Vault record ID. The
integrity digest detects changes to the file but is not an author signature; the
matching on-chain transaction is the public evidence anchor.

## Vault

The Vault groups evidence history by document fingerprint and shows status,
timestamps, proof details, transaction metadata, backup export, and safe import
previews. Search, status filtering, and sorting apply across the document index.
The index displays up to 50 documents per page, while long histories display up
to 25 records per page. On smaller screens, select a document to open its detail
view and use **Back to document list** to return.

Select a document with a confirmed record and choose **Create verification
link** for a recipient. Technical proof JSON is an advanced fallback. Use a
full plain or encrypted Vault backup only for recovery or deliberate transfer
of the complete evidence collection.

The confirmation screen can save the original document and proof together.
Supported desktop browsers prompt for a parent folder, then create **Algorand
Document Vault/Documents** and **Algorand Document Vault/Verification Proofs**.
Browsers without folder access may offer the system share or Files menu. The
browser cannot silently choose or permanently write to an arbitrary local
folder.

Use **Export Plain Backup** for a readable JSON backup with integrity metadata,
or enter and confirm a password before selecting **Export Encrypted Backup**.
The encrypted format protects the backup with PBKDF2-derived AES-GCM encryption.
Keep its password separately: the application does not store it and cannot recover
it.

To restore a plain backup, select its JSON file and review the validation and
change preview before choosing **Import New Records**. To restore an encrypted
backup, select its JSON file, enter the backup password, and choose **Decrypt and
Preview** first. A wrong password or modified encrypted file is rejected before
the Vault can be changed. Original documents are never included in either backup
format.

## Wallet

The Wallet page connects, restores, and disconnects a Pera Wallet session. The application does not receive the wallet's private keys.

Pera Web and Pera Mobile accounts do not automatically synchronize. The current
mobile QR/deep-link connection experience must be revalidated before public
alpha. Never enter a wallet recovery phrase into Algorand Document Vault.

## Important limitations

- Local verification searches the selected browser's Vault; shared
  verification requires a live Algorand TestNet check.
- No matching local record does not prove that a document is invalid.
- A blockchain timestamp does not prove that the document's contents are true or legally binding.
- TestNet ALGO is valueless development currency; MainNet funds are out of scope.

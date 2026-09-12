# Quick Start

1. Start the application with `npm run dev`.
2. Open **Wallet** and connect a Pera Wallet account configured for TestNet.
3. Open **Notarize** and select a document.
4. Review the generated SHA-256 fingerprint and proof payload.
5. Approve the transaction in Pera Wallet.
6. Submit it to TestNet and wait for confirmation.
7. Open **Vault** to review the stored evidence record.
8. Open **Verify** and select the same document to recompute its hash.

## Notarize a document batch

1. Open **Notarize** and choose **Document batch**.
2. Select 2–1,000 files. The app hashes them locally and displays one Merkle
   root; file contents and names are not written to Algorand.
3. Connect Pera Wallet, review the batch count and root, then approve one
   TestNet transaction.
4. Open **Vault** and expand **Batch anchors** to see every member.
5. Create a verification link beside the specific member you intend to share.
   Send that link with that original file; the recipient does not need the
   other files in the batch.

If confirmation is interrupted after submission, open **Vault**, expand the
submitted batch, and choose **Check batch confirmation**. The app validates the
existing transaction against that batch proof before confirming the record.
Do not create a second transaction while the first transaction is unresolved.

## Share a verification

1. Open **Vault** and select a document with a confirmed record.
2. Choose **Create verification link**.
3. Send that link together with the original document. The document is not
   uploaded or contained in the link.
4. The recipient opens the link, selects the named document in Step 1, and
   reviews the public result in Step 3.
5. A successful result confirms the fingerprint and the referenced Algorand
   TestNet transaction.

The link includes the document name as user guidance plus the minimal proof
metadata in its URL fragment. The fingerprint—not the displayed name—is the
authority. **Technical proof JSON** remains available as an advanced fallback.

Immediately after notarization, supported desktop browsers can also save the
original document and its proof into an **Algorand Document Vault** folder with
separate **Documents** and **Verification Proofs** subfolders. On iPhone and
other browsers, use the system share or Files menu when offered.

## Backup

Use the Vault backup controls to export either:

- a readable JSON backup with integrity metadata, or
- a password-protected AES-GCM backup.

Version 2 backups include Merkle batch headers and membership proofs. Version 1
single-document backups remain importable.

Store backup passwords safely. They are not recoverable by the application.

## TestNet validation status

The desktop QR-to-Pera Mobile connection, same-device mobile handoff, signing,
TestNet submission, confirmation, explorer proof note, and persisted evidence
record were validated live on August 28, 2026. Same-device WalletConnect must
run in a secure HTTPS browser context because it requires Web Crypto. Do not
import a mobile recovery phrase into Pera Web merely to test this application.
Use only valueless TestNet ALGO, and never enter wallet recovery material into
this application or a TestNet dispenser.

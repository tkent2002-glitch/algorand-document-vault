# Quick Start

1. Start the application with `npm run dev`.
2. Open **Wallet** and connect a Pera Wallet account configured for TestNet.
3. Open **Notarize** and select a document.
4. Review the generated SHA-256 fingerprint and proof payload.
5. Approve the transaction in Pera Wallet.
6. Submit it to TestNet and wait for confirmation.
7. Open **Vault** to review the stored evidence record.
8. Open **Verify** and select the same document to recompute its hash.

## Backup

Use the Vault backup controls to export either:

- a readable JSON backup with integrity metadata, or
- a password-protected AES-GCM backup.

Store backup passwords safely. They are not recoverable by the application.

## TestNet validation status

The live Pera Mobile connection and TestNet submission flow remain under
compatibility validation. Do not import a mobile recovery phrase into Pera Web
merely to test this application. Use only valueless TestNet ALGO, and never
enter wallet recovery material into this application or a TestNet dispenser.

# Security Architecture

## Security goals

- Keep original documents on the user's device.
- Create deterministic, independently verifiable fingerprints.
- Preserve evidence without silent mutation.
- Reject malformed, corrupted, or conflicting backups.
- Require explicit wallet approval for blockchain transactions.
- Keep network-specific responsibilities isolated.

## Trust boundaries

### Document boundary

A selected file is read locally to calculate SHA-256. The file itself is not added to an evidence record or sent to the blockchain.

### Evidence boundary

An evidence record contains identifiers, timestamps, the document fingerprint, workflow status, and optional Algorand transaction metadata.

### Backup boundary

Plain backups include structural validation and SHA-256 integrity metadata. Encrypted backups wrap a trusted backup with PBKDF2-derived AES-GCM encryption.

### Wallet boundary

The application constructs a transaction, but the user approves signing through Pera Wallet. Private keys are not handled by the application.

### Network boundary

Algod supplies suggested transaction parameters, accepts signed bytes, and reports confirmation. UI claims should not exceed what the confirmed transaction proves.

## Known limitations

- The application is pre-release and not independently audited.
- Browser extensions or compromised devices may affect local confidentiality.
- Password loss makes encrypted backups unrecoverable.
- A hash timestamp does not prove authorship, consent, legal validity, or truthfulness.
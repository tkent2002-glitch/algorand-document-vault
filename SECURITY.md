# Security Policy

Algorand Document Vault is a security-sensitive application that handles cryptographic evidence, wallet interactions, blockchain transactions, and encrypted local backups.

## Supported versions

The project is currently pre-release. Security fixes are applied to the latest development branch only.

## Reporting a vulnerability

Do **not** open a public GitHub issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting feature:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include a clear description, affected files or workflows, reproduction steps, and potential impact.

If private vulnerability reporting is unavailable, contact the repository owner privately through their GitHub profile and request a secure reporting channel. Do not include sensitive exploit details in the initial public contact.

## Response goals

- Acknowledge a valid report as soon as practical.
- Reproduce and assess severity before discussing a fix publicly.
- Avoid disclosing details until affected users can update.
- Credit reporters when requested and appropriate.

## Current security boundaries

- The application currently targets Algorand TestNet.
- The project has not completed an independent third-party security audit.
- Original documents are not uploaded or stored by the application.
- Browser storage security depends partly on the user's device and browser profile.
- Encrypted backups are unrecoverable without the correct password.
- Blockchain proof demonstrates existence and integrity at a point in time; it does not establish the truth or legal enforceability of document contents.

## Scope examples

Reports involving these areas are especially valuable:

- Proof payload integrity or serialization errors
- Hash confusion or document-validation bypasses
- Backup integrity, encryption, or import vulnerabilities
- IndexedDB migration or evidence-loss scenarios
- Wallet signing ambiguity or transaction substitution
- Network mismatch between wallet, transaction, and explorer
- Sensitive information exposure in logs or exported files
- Dependency vulnerabilities with a realistic application impact
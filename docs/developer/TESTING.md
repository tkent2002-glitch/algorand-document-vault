# Testing Guide

## Run all tests

```powershell
npm test
```

Vitest currently covers important behavior in these areas:

- SHA-256 hashing
- Evidence-record creation
- Notarization workflow
- Verification comparison
- Backup validation, import, integrity, and trust
- PBKDF2 and AES-GCM behavior
- Encrypted backup recovery
- Repository behavior
- IndexedDB storage
- localStorage-to-IndexedDB migration
- Algorand transaction-policy and lifecycle boundaries
- Core accessibility labels, landmarks, navigation state, and focus behavior

## Lint verification

```powershell
npm run lint
```

## Build verification

```powershell
npm run build
```

Tests do not replace runtime validation for Pera Wallet mobile handoff, browser
persistence, downloads, assistive technologies, TestNet submission,
confirmation, and explorer behavior.

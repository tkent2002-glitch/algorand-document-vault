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

## Production browser smoke tests

Install the Playwright browser binaries once, then run the full Chromium,
Microsoft Edge, Firefox, and WebKit matrix against a local production preview:

```powershell
npx playwright install
npm run test:browser
```

If the host cannot launch Playwright Firefox, the Chromium, installed Microsoft
Edge, and WebKit baseline can still be verified without hiding Firefox from the
full release matrix:

```powershell
npm run test:browser:core
```

Before approving a release candidate on Windows, run the same suite against the
locally installed stable Google Chrome channel:

```powershell
npm run test:browser:stable-chrome
```

This command intentionally remains a local release check rather than a CI gate.
It requires Google Chrome to be installed on the Windows validation host; the
portable CI matrix continues to use Playwright-managed Chromium, Firefox, and
WebKit engines.

The smoke suite checks initial-load chunk deferral, deferred route loading,
browser `Buffer` initialization, core route rendering, console errors, and
uncaught page errors. It also creates a record, downloads plain and AES-GCM
encrypted backups, restores each in a clean browser context, verifies encrypted
password rejection and retry, and confirms that imported IndexedDB data survives
a reload. It stubs external font and wallet-configuration requests so those
third-party services do not make the result nondeterministic.

Tests do not replace runtime validation for Pera Wallet mobile handoff, browser
restart persistence, platform download UX, assistive technologies, TestNet
submission, confirmation, and explorer behavior.

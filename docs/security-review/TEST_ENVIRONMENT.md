# Reproducible Test Environment

## Freeze the target

Record one exact commit before testing. For the released alpha:

```powershell
git clone https://github.com/tkent2002-glitch/algorand-document-vault.git
cd algorand-document-vault
git checkout v0.1.0-alpha
git rev-parse HEAD
```

Expected release commit:
`2abcb3456510ab6f5bd17f4e18c5f6f09a7d06c2`.

To review the deployed `main` version instead, check out `main`, record
`git rev-parse HEAD`, and include that SHA in the report. Do not describe a
moving branch name as the reviewed target.

## Prerequisites

- Node.js 24
- npm 11 or later
- Git
- Modern Chromium, Firefox, and WebKit-based test engines
- A disposable Pera Wallet account configured for Algorand TestNet for live
  wallet tests
- TestNet ALGO only; do not use MainNet funds or a production wallet account

Use a new browser profile with no unrelated extensions. Use only synthetic,
non-sensitive documents and a unique test-only backup password.

## Install and verify

```powershell
npm ci
npm test
npm run lint
npm run build
npm run security:production
npm run verify:tracked-content
npm run verify:release-readiness
```

Install Playwright browsers once, then exercise the production build:

```powershell
npx playwright install
npm run test:browser:ci
npm run test:artifact
```

On a Windows host with stable Chrome and Edge installed:

```powershell
npm run test:browser:core
npm run test:browser:stable-chrome
```

Record command, tool version, result, and any skip or environmental limitation.

## Manual security fixtures

Create disposable files that cover:

- empty, small, Unicode-named, and moderately large documents;
- two different files with the same filename;
- the same bytes under different filenames;
- a document changed by one byte after notarization;
- valid, truncated, oversized, malformed, extra-field, and digest-modified proof
  JSON and verification links;
- valid, malformed, extra-field, duplicate-ID, corrupted, wrong-password, and
  oversized plain/encrypted backups; and
- wallet rejection, disconnect, account switch, timeout, endpoint outage, and
  transaction-not-found conditions.

Never place real documents, recovery words, private keys, access tokens, or
production wallet identifiers in fixtures, recordings, issues, or reports.

## Live TestNet procedure

1. Confirm the application and Pera Wallet both show Algorand TestNet.
2. Hash a disposable document and inspect the exact transaction presented for
   approval.
3. Confirm self-payment, zero amount, 1,000 microAlgo fee, expected note, and no
   close, rekey, group, or lease side effects.
4. Approve once, wait for confirmation, and record the transaction ID and round.
5. Create a verification link, open it in an isolated browser profile with an
   empty Vault, select the same document, and confirm public verification.
6. Select a one-byte-modified document and confirm verification does not pass.
7. Repeat relevant checks with wallet rejection, timeout, and unavailable
   network paths; unavailable must not be presented as invalid or verified.

The deployed site's security headers can be inspected with:

```powershell
curl.exe -I https://algorand-document-vault.pages.dev/
```

Compare the response with [`public/_headers`](../../public/_headers).

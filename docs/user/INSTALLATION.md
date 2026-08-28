# Installation

## Requirements

- Windows, macOS, or Linux
- Node.js 24
- npm 11 or later
- A modern browser
- Pera Wallet for blockchain signing tests

## Clone and install

```powershell
git clone https://github.com/tkent2002-glitch/algorand-document-vault.git
cd algorand-document-vault
npm ci
```

## Run locally

```powershell
npm run dev
```

Open the local URL printed by Vite.

## Verify the installation

```powershell
npm test
npm run lint
npm run build
```

## TestNet note

Blockchain workflows currently target Algorand TestNet. Do not send MainNet funds or treat the application as production-ready.

The desktop QR-to-Pera Mobile connection, same-device mobile handoff, and
complete TestNet transaction flow have been validated live. Same-device
WalletConnect requires a secure HTTPS browser context because it uses Web
Crypto. A funded TestNet account is required only for live signing and
submission tests; local tests and production builds do not require wallet
funds.

# Production Hosting Contract

Algorand Document Vault is a static single-page application. The public-alpha
artifact is designed for HTTPS hosting at the root of an origin.

## Required hosting behavior

- Serve `index.html` for unknown application paths with HTTP 200.
- Serve fingerprinted files under `/assets/` with immutable one-year caching.
- Serve `index.html` without long-term caching.
- Preserve the response headers defined in `public/_headers`.
- Redirect HTTP to HTTPS before users connect Pera Wallet.
- Do not inject third-party scripts, analytics, advertising, or tag managers.

`public/_redirects` and `public/_headers` use the static-host convention
supported by Cloudflare Pages and Netlify-style platforms. A different host
must translate these files into its native routing and header configuration.

## Security headers

The committed policy blocks framing, plugins, unexpected form destinations,
camera, microphone, location, payment, and USB access. Its Content Security
Policy permits only the origins needed by the current application and Pera
Wallet/TestNet flow:

- the application origin;
- `testnet-api.algonode.cloud`;
- Pera Wallet web, configuration, bridge, and static-media origins;
- the WalletConnect bridge WebSocket.

The inline-style allowance exists because the Pera Wallet connection UI injects
runtime styles. It does not permit inline scripts.

## Build and artifact verification

```powershell
npm run release:package
npm run test:artifact
```

`release:package` builds the application, copies only the deployable `dist`
files into `release/algorand-document-vault-public-alpha`, rejects source maps,
environment files, databases, keys, and Evidence Vault backups, validates local
asset references and required headers, and writes `SHA256SUMS`.

`test:artifact` serves that copied directory through the committed fallback and
header rules. Chromium then opens a non-root direct-load URL, validates the
security headers, executes the production bundles, renders the dashboard, and
checks the checksum manifest.

## Deployment boundary

This contract and artifact are ready for a deployment target, but no external
host has been selected or modified. Publishing remains a separate, explicitly
approved release action. After selecting a host, repeat the artifact smoke test
against the real HTTPS URL and revalidate Pera Wallet mobile handoff there.

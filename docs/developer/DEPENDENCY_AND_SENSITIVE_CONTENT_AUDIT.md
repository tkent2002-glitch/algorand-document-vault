# Dependency and Sensitive-Content Audit

**Audit date:** August 28, 2026

**Scope:** Current tracked files, `package-lock.json`, and the installed npm tree

## Dependency tree

- `npm ls --all --depth=0` completed without missing, invalid, or extraneous
  direct dependencies.
- After remediation, the lockfile contains 27 production package entries
  excluding the root project. The installed tree contains 256 unique
  package/version pairs across production and development tooling.
- Every installed package contains declared license metadata.

The production lockfile license distribution is:

| License metadata | Packages |
| --- | ---: |
| MIT | 19 |
| ISC | 2 |
| 0BSD | 2 |
| Apache-2.0 | 1 |
| BSD-3-Clause | 1 |
| Unlicense | 1 |
| UNLICENSED | 1 |

The `UNLICENSED` metadata belongs to `tweetnacl-ts@1.0.3`, a transitive
dependency of `@perawallet/connect@1.6.0`. Its installed package includes a
public-domain Unlicense text in `LICENSE` and an MIT license notice for the
sealed-box-derived portion. The upstream repository also exposes both license
files: <https://github.com/katyo/tweetnacl-ts>. This metadata inconsistency
should remain visible in future release reviews, but the distributed license
files do not indicate a blocking copyleft obligation.

The explicitly approved `npm audit --omit=dev` query found eight production
findings: three high and five moderate, with no critical findings. They all
flow through `@perawallet/connect@1.5.2` and its WalletConnect v1 dependency
chain. The concrete vulnerable packages include:

- `ws@7.5.3`, affected by two denial-of-service advisories
  ([GHSA-3h5v-q93c-6h6q](https://github.com/advisories/GHSA-3h5v-q93c-6h6q)
  and [GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p));
- `bn.js@4.11.8`, affected by an infinite-loop advisory
  ([GHSA-378v-28hj-76wf](https://github.com/advisories/GHSA-378v-28hj-76wf));
- the WalletConnect client, core, transport, crypto, and utility packages that
  depend on those affected versions.

`npm audit fix --omit=dev --dry-run` proposed upgrading
`@perawallet/connect` from 1.5.2 to 1.6.0 and replacing its WalletConnect v1
dependencies with `@perawallet/walletconnect@1.0.0`.

The controlled upgrade was then applied. A follow-up
`npm audit --omit=dev --json` reported zero production vulnerabilities, and
the old WalletConnect v1, `ws@7.5.3`, and `bn.js@4.11.8` packages are no longer
in the dependency tree. Unit tests, lint, the production build, and the
Chromium, Edge, and WebKit production-browser suite all passed. The core
JavaScript chunk also decreased from approximately 147 kB to 103 kB.

The separately approved full-manifest audit found four high-severity findings,
all limited to development tooling:

- `brace-expansion@5.0.7` through ESLint and TypeScript ESLint;
- `nanoid@3.3.15` and `postcss@8.5.16` through Vite;
- `undici@7.28.0` through jsdom.

An `npm audit fix --dry-run` proposed patch-only transitive updates to
`brace-expansion@5.0.9`, `nanoid@3.3.18`, `postcss@8.5.26`, and
`undici@7.29.0`. Those four updates were applied without changing any direct
development dependency range. Follow-up production-only and complete-tree
audits both reported zero vulnerabilities.

A live Pera TestNet connection check restored the existing wallet session on
the expected TestNet address and reported signing as available. A signing-only
regression then
returned 403 signed bytes and transaction ID
`GWZ2D62RDEUIHA4SK2OAOWSQ74PEIV6ZUYEMUSGB6VRHJ7O4SDLA`. The application
reported that the transaction was signed but not submitted. Reloading discarded
the signed bytes, and the local evidence remained in `draft` status with no
submission or confirmation metadata. Nothing was broadcast to TestNet.

## Tracked sensitive-content review

The tracked repository was checked for:

- environment files, private-key and certificate containers, browser/database
  files, private document formats, and archives;
- common cloud, GitHub, OpenAI, PEM private-key, and credential-bearing URL
  patterns;
- wallet private-key, mnemonic, seed-phrase, and recovery-phrase wording.

No sensitive filenames or credential-shaped values were found. References to
private keys and recovery phrases were limited to security guidance,
documentation, issue-reporting warnings, and wallet-boundary UI copy. No
wallet recovery material was present.

`.gitignore` now excludes common environment files and both generated Evidence
Vault backup filename patterns while preserving explicitly named environment
examples.

## Remaining release work

- Repeat this review against the final release commit.
- Treat an independent security or legal review as separate from this
  engineering audit.

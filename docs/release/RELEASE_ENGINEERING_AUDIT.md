# Release Engineering Audit

**Audit date:** August 28, 2026

## Completed controls

- Static SPA fallback and security-header contracts are included in the build.
- A copied production artifact is validated independently of Vite development
  and preview servers.
- Every artifact file receives a SHA-256 manifest entry.
- CI scans tracked filenames and content for blocked sensitive artifacts and
  credential patterns.
- CI validates the direct dependency tree and blocks high-severity production
  advisories.
- CI runs unit tests, lint, production build, and whitespace checks.
- CI installs and tests Chromium, Firefox, and WebKit on Linux.
- CI smoke-tests and uploads the verified public-alpha artifact for 14 days.

Local production and complete-tree npm advisory checks both reported zero
vulnerabilities. The tracked-content scan covered 258 current tracked and
untracked candidate files without a finding. The packaged artifact contained 21
deployable files before `SHA256SUMS`; no source maps, secrets, databases, backup
exports, or missing local assets were present.

The exact artifact passed a direct-load Chromium smoke test with its Content
Security Policy, anti-framing, and content-type protections active.

Pull request 14 completed both GitHub Actions jobs successfully before merge.
The merged candidate base is commit `3da7716`. Installed stable Google Chrome
`151.0.7922.174` on Windows also passed the seven-test production-preview suite.

## Firefox status

The Windows host contains Playwright Firefox, but Windows returned `spawn
UNKNOWN` before the browser process opened in both parallel and single-worker
runs, including outside the filesystem sandbox. This is a host launch failure,
not an observed application failure. Linux CI is now the automated Firefox
compatibility gate. A manual current-stable Firefox check remains open in the
release checklist until it is completed on a host that can launch Firefox.

## Remaining external checks

- Select a production host and translate the hosting contract if necessary.
- Smoke-test the deployed HTTPS origin and Pera Wallet handoff.
- Complete physical-device, stable-browser, and independent security review.
- Obtain product-owner approval before publishing a release.

The current disposition and exact operator procedures are maintained in
`RC1_VALIDATION.md`.

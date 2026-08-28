# Public Alpha Release Checklist

Use this checklist for the planned `v0.1.0-alpha` release. A checked item must
be supported by a repeatable command, an inspected artifact, or a recorded
manual test. Items that depend on a funded TestNet wallet remain open until the
live Pera Wallet workflow can be completed.

## Release identity

- [ ] Set `package.json` to the approved alpha version.
- [ ] Confirm the release commit and tag both use the approved version.
- [ ] Update `CHANGELOG.md` with the release date and final scope.
- [ ] Confirm the working tree is clean before tagging.

## Automated quality gates

- [x] `npm test` passes locally.
- [x] `npm run lint` passes locally.
- [x] `npm run build` produces a production bundle.
- [x] GitHub Actions runs tests, lint, and the production build.
- [ ] `git diff --check` passes on the final release diff.
- [x] Review and accept or resolve all production-build warnings.

## Accessibility

- [x] Core controls have accessible names.
- [x] The application exposes one main landmark per page.
- [x] Keyboard users have a skip link and visible focus treatment.
- [x] Navigation exposes the current page to assistive technology.
- [x] Core touch targets meet the 44-pixel minimum in the tested mobile layout.
- [x] Header text meets WCAG AA contrast in the tested light theme.
- [x] Dynamic wallet and transaction outcomes use live status semantics.
- [x] Accessibility boundary regressions are covered by automated tests.
- [ ] Complete a manual screen-reader pass.
- [ ] Complete keyboard-only testing for every workflow.
- [ ] Verify light, dark, high-contrast, zoom, and reduced-motion modes.

## Browser and device validation

- [ ] Test the current stable Chrome release on Windows.
- [x] Test the current stable Edge release on Windows.
- [ ] Test the current stable Firefox release.
- [ ] Test the current stable Safari release on macOS or iOS.
- [ ] Test representative Android and iOS mobile layouts.
- [ ] Verify IndexedDB persistence after reload and browser restart.
- [ ] Verify backup download and restore behavior in each supported browser.

## Algorand TestNet and wallet validation

- [x] Transactions are constrained by the local ADv transaction policy before signing.
- [x] Submission transaction IDs are checked against the signed transaction ID.
- [x] Wallet rejection and uncertain submission paths fail closed in automated tests.
- [x] Revalidate the desktop QR-to-Pera Mobile connection experience.
- [ ] Revalidate the same-device Pera Mobile deep-link experience.
- [x] Explicitly verify the wallet session is bound to Algorand TestNet.
- [x] Fund a dedicated TestNet account with valueless TestNet ALGO.
- [x] Complete a live sign, submit, and confirmation workflow.
- [x] Verify the confirmed transaction and proof note in a TestNet explorer.
- [x] Verify the confirmed evidence record persists after reload.
- [x] Exercise wallet cancellation, disconnect, and signing retry behavior manually.
- [ ] Exercise wallet or confirmation timeout behavior manually.

Live validation evidence recorded August 28, 2026:

- TestNet transaction: `D5QWYDQFAZRL3F7H2I6ELJATMZNI7XYVX3GWR4U6NIGABEEZO3LA`
- Confirmed round: `66759442`
- Pera Explorer displayed the `adv-proof-v1` document-integrity note and the
  expected zero-ALGO self-payment with a `0.001 ALGO` TestNet fee.
- The confirmed local evidence record and Pera session both survived reload.
- Disconnecting and reconnecting Pera preserved the confirmed evidence record.
- A rejected signature request produced recovery guidance, kept submission
  disabled, and allowed a second signing attempt; the retry was also rejected
  without creating signed bytes or broadcasting a transaction.

## Data safety and recovery

- [x] Original documents remain local and are not included in evidence backups.
- [x] Plain backups include integrity metadata.
- [x] Encrypted backups use the documented PBKDF2 and AES-GCM boundary.
- [x] Backup imports validate structure and preview changes before writing.
- [x] Corrupted persistence and conflicting backup records fail closed.
- [ ] Perform a manual plain-backup round trip in a clean browser profile.
- [ ] Perform a manual encrypted-backup round trip in a clean browser profile.

## Documentation and security

- [x] Confirm README capability claims match the current validation status.
- [x] Confirm installation, quick-start, testing, and user guides are current.
- [ ] Capture current screenshots after the UI is frozen.
- [x] Confirm security-reporting instructions and trust boundaries are prominent.
- [ ] Confirm no secrets, wallet recovery material, or private documents are tracked.
- [ ] Complete dependency and license review.

## Performance and packaging

- [ ] Establish and test a representative large Evidence Vault dataset.
- [ ] Record startup, search, hashing, backup, and restore performance.
- [x] Investigate the current large JavaScript chunk warning.
- [x] Investigate the browser `buffer.Buffer` compatibility warning.
- [ ] Verify production hosting configuration and direct-load behavior.
- [ ] Smoke-test the exact packaged release artifact.

## Release approval

- [ ] All blocking items above are complete or explicitly deferred with rationale.
- [ ] Independent security review status is documented.
- [ ] MainNet remains disabled and out of scope for this alpha.
- [ ] Product owner approves the release candidate.

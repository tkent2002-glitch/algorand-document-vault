# Public Alpha Release Checklist

Use this checklist for the planned `v0.1.0-alpha` release. A checked item must
be supported by a repeatable command, an inspected artifact, or a recorded
manual test. Items that depend on a funded TestNet wallet remain open until the
live Pera Wallet workflow can be completed.

## Release identity

- [x] Set `package.json` to the approved alpha version.
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
- [x] Complete a manual screen-reader pass.
- [ ] Complete keyboard-only testing for every workflow.
- [ ] Verify light, dark, high-contrast, zoom, and reduced-motion modes.

Manual accessibility evidence recorded August 28, 2026:

- All five pages exposed one main landmark, one application-level heading, a
  page-specific heading, a unique document title, and the active navigation
  item as `aria-current="page"`.
- Navigation changes moved focus to `main`, and a backup-password mismatch was
  exposed through a live status region.
- A physical keyboard pass confirmed the skip link, visible focus treatment,
  Dashboard call-to-action, navigation, Notarize and Verify file controls,
  Vault backup controls, search and filter order, evidence-record selection,
  and Wallet action focus. The live wallet was not disconnected.
- Windows Narrator announced the primary navigation and current Wallet state,
  the Pera Wallet heading, and the main landmark. An initial minimum-password
  validation announcement failed because the status region was conditionally
  mounted with its text. A persistent polite, atomic live region and regression
  test were added; Narrator announced the validation message after the fix.

## Browser and device validation

- [ ] Test the current stable Chrome release on Windows.
- [x] Test the current stable Edge release on Windows.
- [ ] Test the current stable Firefox release.
- [ ] Test the current stable Safari release on macOS or iOS.
- [ ] Test representative Android and iOS mobile layouts.
- [x] Verify IndexedDB persistence after reload in clean Chromium, Edge, and WebKit contexts.
- [x] Verify IndexedDB persistence after a full browser restart.
- [x] Automate plain and encrypted backup download/restore in Chromium, Edge, and WebKit.
- [ ] Manually verify backup download and restore UX in each supported browser.

Manual responsive evidence recorded August 28, 2026:

- Dashboard, Notarize, Verify, Vault, and Wallet rendered without horizontal
  overflow at 390 x 844, 768 x 1024, and 1440 x 900 CSS-pixel viewports.
- Visible buttons, inputs, and selects met the 44-pixel minimum in the tested
  mobile viewport.
- The active session validated the light theme. Automated Chromium, Edge, and
  WebKit checks rendered every page in dark mode without overflow, verified
  reduced-motion durations do not exceed 0.01 milliseconds, and confirmed
  320-CSS-pixel reflow preserves 44-pixel controls.
- Automated forced-colors checks retained visible keyboard focus in Chromium
  and Edge. WebKit forced-colors emulation is unavailable and explicitly
  skipped.
- Real browser zoom and physical operating-system visual modes remain manual
  checks; viewport resizing and media emulation are not treated as substitutes.
- Responsive viewport checks do not replace manual testing in stable Chrome,
  Firefox, Safari, or physical Android and iOS devices.
- The dashboard and application shell were subsequently redesigned with a
  responsive sidebar, distinct workflow cards, real local evidence activity,
  and consistent surfaces across Notarize, Verify, Vault, and Wallet. Desktop
  and 390 x 844 CSS-pixel visual review confirmed clear spacing and hierarchy;
  no placeholder balance, account, or activity data was introduced.

## Algorand TestNet and wallet validation

- [x] Transactions are constrained by the local ADv transaction policy before signing.
- [x] Submission transaction IDs are checked against the signed transaction ID.
- [x] Wallet rejection and uncertain submission paths fail closed in automated tests.
- [x] Revalidate the desktop QR-to-Pera Mobile connection experience.
- [x] Revalidate the same-device Pera Mobile deep-link experience over HTTPS.
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
- A same-device HTTPS session in Chrome opened Pera Mobile and returned a
  connected wallet session. Plain LAN HTTP was rejected because WalletConnect
  requires Web Crypto in a secure browser context.
- Manual timeout induction is deferred: interrupting connectivity after a live
  broadcast would intentionally create an uncertain submission state. Automated
  tests cover timeout classification, status lookup, and fail-closed retry
  behavior without risking a duplicate or ambiguous TestNet transaction.

## Data safety and recovery

- [x] Original documents remain local and are not included in evidence backups.
- [x] Plain backups include integrity metadata.
- [x] Encrypted backups use the documented PBKDF2 and AES-GCM boundary.
- [x] Backup imports validate structure and preview changes before writing.
- [x] Corrupted persistence and conflicting backup records fail closed.
- [x] Automate plain and encrypted clean-profile backup round trips, including
  wrong-password rejection and reload persistence.
- [x] Perform a manual plain-backup round trip in a clean browser profile.
- [x] Perform a manual encrypted-backup round trip in a clean browser profile.

Manual backup evidence recorded August 28, 2026:

- A plain backup exported five evidence records, exposed no original document
  content, validated successfully in an isolated empty browser storage origin,
  and restored all five records.
- An encrypted backup exposed neither known filenames nor original document
  content in plaintext. The restore rejected an incorrect password, accepted
  the correct password, validated the same five records, and restored them.
- Both restored Vaults retained five records, four unique documents, and the
  confirmed TestNet record after reload.
- The original Vault retained five records, four unique documents, four drafts,
  and one confirmed record after Codex and its in-app browser were fully closed,
  reopened, and the local development server was restarted on the same origin.

## Documentation and security

- [x] Confirm README capability claims match the current validation status.
- [x] Confirm installation, quick-start, testing, and user guides are current.
- [ ] Capture current screenshots after the UI is frozen.
- [x] Confirm security-reporting instructions and trust boundaries are prominent.
- [x] Confirm no secrets, wallet recovery material, or private documents are tracked.
- [x] Complete the local dependency-tree and license review.
- [x] Run the current npm production advisory audit with approved registry access.
- [x] Resolve the Pera WalletConnect production advisories and pass automated regression gates.
- [x] Review the remaining development-only npm advisories.
- [x] Apply and verify the patch-only development-tooling advisory fixes.
- [x] Revalidate the live Pera TestNet connection and signing workflow after the upgrade.

## Performance and packaging

- [x] Establish and test a representative large Evidence Vault dataset.
- [x] Record startup, search, hashing, backup, and restore performance.
- [x] Investigate the current large JavaScript chunk warning.
- [x] Investigate the browser `buffer.Buffer` compatibility warning.
- [x] Verify production hosting configuration and direct-load behavior.
- [x] Smoke-test the exact packaged release artifact.

Large-Vault evidence recorded August 28, 2026:

- A generated 10,000-document IndexedDB dataset rendered only 50 document
  controls per page, advanced correctly to documents 51–100, and narrowed to a
  single filename through search.
- Document history is bounded to 25 records per page. The document index and
  desktop details use independent scroll regions; mobile opens details as a
  separate view with an explicit return to the document list.
- Unit coverage validates grouping, filtering, sorting, and the first and final
  pages of the 10,000-document dataset. Chromium and Edge browser coverage
  validates the complete paging, search, and mobile detail-navigation flow.
- Repeatable storage, browser, hashing, backup, encryption, validation, and
  restore measurements are recorded in
  `docs/performance/LARGE_VAULT_PERFORMANCE.md`. The audit also replaced two
  quadratic backup-preview/import paths with linear-time implementations.

## Release approval

- [ ] All blocking items above are complete or explicitly deferred with rationale.
- [ ] Independent security review status is documented.
- [x] MainNet remains disabled and out of scope for this alpha.
- [ ] Product owner approves the release candidate.

Release-identity evidence recorded August 28, 2026:

- `package.json`, `package-lock.json`, and the application runtime identify the
  candidate as `0.1.0-alpha`.
- `npm run verify:release-readiness` fails closed if those versions drift, if
  the default Algorand network or endpoint stops targeting TestNet, if the
  transaction policy stops requiring the TestNet genesis, or if a MainNet API
  endpoint is introduced into production source.

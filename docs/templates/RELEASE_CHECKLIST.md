# Public Alpha Release Checklist

Use this checklist for the planned `v0.1.0-alpha` release. A checked item must
be supported by a repeatable command, an inspected artifact, or a recorded
manual test. Items that depend on a funded TestNet wallet remain open until the
live Pera Wallet workflow can be completed.

## Release identity

- [x] Set `package.json` to the approved alpha version.
- [x] Confirm the release commit and tag both use the approved version.
- [x] Update `CHANGELOG.md` with the release date and final scope.
- [x] Confirm the working tree is clean before tagging.

## Automated quality gates

- [x] `npm test` passes locally.
- [x] `npm run lint` passes locally.
- [x] `npm run build` produces a production bundle.
- [x] GitHub Actions runs tests, lint, and the production build.
- [x] `git diff --check` passes on the final release diff.
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
- [x] Complete keyboard-only testing for every workflow.
- [x] Verify light, dark, high-contrast, zoom, and reduced-motion modes.

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
- Installed Chrome on Windows passed keyboard-only navigation across Dashboard,
  Notarize, Verify, Vault, and Wallet. Focus order was logical, focus remained
  visible, disabled signing controls were skipped, and no keyboard trap was
  encountered.
- A focused frozen-interface keyboard recheck on August 30, 2026 passed
  Notarize and Verify file-dialog activation/cancellation plus systematic Vault
  navigation through backup, restore, search, filtering, document, detail, and
  tool controls. The pass found the Vault Tools summary outline clipped by its
  rounded container; the outline was moved inside the container, covered by a
  browser regression, and confirmed visible in the physical retest.
- Physical Chrome zoom at 200% (960 CSS pixels wide) and 400% (480 CSS pixels
  wide) preserved every workflow without horizontal page overflow, clipped
  controls, or controls positioned outside the viewport. Zoom was restored to
  100% after the test.
- Physical Edge and Firefox zoom at 200% and 400% preserved all five routes
  without horizontal page overflow, overlap, clipped text, hidden controls, or
  unreachable actions. Exact Safari 200%/400% page zoom remains open because the
  available physical iPhone exposes website text sizing and screen magnification
  rather than those desktop-style zoom levels; automated WebKit 320-CSS-pixel
  reflow remains supporting evidence only.
- The frozen Notarize, Verify, and Vault routes passed a focused hands-on
  200%/400% zoom recheck on August 30, 2026. No horizontal page scrolling,
  overlap, clipped text, hidden controls, or unusable expanded content appeared.
- The physical Windows light and dark modes kept Dashboard, Wallet, and Vault
  text, form controls, status treatments, and navigation readable without
  horizontal overflow. Windows was restored to light mode after the test.
- The frozen Notarize, Verify, and Vault routes passed a focused physical
  Windows dark-mode recheck on August 30, 2026. The open Vault Tools panel,
  selected tabs, focus treatment, inputs, status labels, and disclosures stayed
  readable without visible overflow. Windows was restored to light mode.
- Physical iOS light/dark retesting is deferred until a controlled HTTPS
  deployment is available. An account-less quick-tunnel origin was rejected as
  unsuitable after Safari did not render the expected candidate page; the
  tunnel was shut down immediately and will not be reused.
- The Windows Aquatic contrast theme activated `forced-colors`, retained
  distinguishable navigation and native controls, and exposed a visible
  three-pixel focus outline on the Vault export action. Dashboard and Vault had
  no horizontal overflow or controls outside the viewport. The contrast theme
  was restored to `None` after the test.
- A focused Windows Aquatic High Contrast recheck on August 30, 2026 passed the
  frozen Notarize, Verify, Vault Tools, and Wallet views, including the corrected
  Vault Tools keyboard focus. The contrast theme was restored to `None`.
- Turning off Windows animation effects activated `prefers-reduced-motion`; the
  longest visible transition or animation duration was 0.01 milliseconds and
  the workflows remained understandable. Animation effects were restored after
  the test.
- A focused reduced-motion recheck on August 30, 2026 passed frozen-route
  navigation and Vault Tools/detail disclosures with all state changes still
  understandable. Windows animation effects were restored afterward.
- Windows Narrator announced the primary navigation and current Wallet state,
  the Pera Wallet heading, and the main landmark. An initial minimum-password
  validation announcement failed because the status region was conditionally
  mounted with its text. A persistent polite, atomic live region and regression
  test were added; Narrator announced the validation message after the fix.

## Browser and device validation

- [x] Test the current stable Chrome release on Windows.
- [x] Test the current stable Edge release on Windows.
- [x] Test the current stable Firefox release.
- [x] Test the current stable Safari release on macOS or iOS.
- [ ] Test a representative physical Android layout. Deferred because no
  representative Android device is currently available.
- [x] Test a representative physical iOS layout.
- [x] Verify IndexedDB persistence after reload in clean Chromium, Edge, and WebKit contexts.
- [x] Verify IndexedDB persistence after a full browser restart.
- [x] Automate plain and encrypted backup download/restore in Chromium, Edge, and WebKit.
- [x] Manually verify backup download and restore UX in each supported browser.

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
- Responsive viewport checks do not replace the outstanding physical Android
  test. Stable Chrome, Firefox, Safari, and physical iOS results are recorded
  separately.
- The dashboard and application shell were subsequently redesigned with a
  responsive sidebar, distinct workflow cards, real local evidence activity,
  and consistent surfaces across Notarize, Verify, Vault, and Wallet. Desktop
  and 390 x 844 CSS-pixel visual review confirmed clear spacing and hierarchy;
  no placeholder balance, account, or activity data was introduced.
- Installed Google Chrome `151.0.7922.174` on Windows passed the complete
  production-preview suite through `npm run test:browser:stable-chrome`: seven
  checks covering clean loading, plain and encrypted backup recovery,
  10,000-document Vault behavior, dark mode, forced colors, reduced motion, and
  320-CSS-pixel reflow. Hands-on download UX and real browser zoom remain
  separate manual gates.
- Installed Mozilla Firefox `154.0.1` on Windows loaded Dashboard, Notarize,
  Verify, Vault, and Wallet without visible failure. A disposable `README.md`
  draft survived reload and a complete Firefox restart. Plain and encrypted
  backups downloaded successfully, restored one record into separate clean
  Private Browsing sessions, and retained the expected Draft state. The
  encrypted restore rejected an incorrect password before accepting the test
  password; both previews reported one new record and zero conflicts.
- Installed Chrome and Edge on Windows each exported a disposable one-record
  plain backup and encrypted backup, restored both formats into separate clean
  Incognito or InPrivate sessions, rejected an incorrect encrypted-backup
  password, and restored the expected Draft with the correct password.
- Current Safari on an iPhone 17 Pro Max running iOS 26.6 loaded all five routes
  over a temporary HTTPS origin without horizontal overflow or blocked content.
  The first pass exposed a touch-navigation defect: moving focus to `main`
  scrolled the compact navigation out of view after each tap. Pointer navigation
  now preserves the viewport while retaining the main-landmark focus handoff,
  and a regression test covers that boundary; the physical retest passed.
- A disposable photo selected through the iOS picker produced a local Draft
  record that survived refresh. Plain and encrypted backups downloaded into
  Files and restored one Draft record into separate empty Safari Private
  Browsing sessions. The encrypted restore rejected an incorrect password before
  accepting the disposable test password; both previews reported one new record
  and zero conflicts. A Pera same-device handoff returned to a connected TestNet
  session, and the wallet session and Draft record both survived a subsequent
  Safari refresh.

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
- [x] Exercise wallet or confirmation timeout behavior manually.

Live validation evidence recorded August 28 and 30, 2026:

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
- On August 30, an unapproved Pera signing request ended automatically after
  90 seconds, returned the action to a safe retry state, and reported that no
  transaction was submitted. A separate manual `Cancel Waiting` attempt returned
  immediately to the same safe state without submission. The subsequent retry
  was approved, submitted, and confirmed in TestNet round `66819761`; its
  disposable `test 6.txt` evidence record appeared as Confirmed in the Vault and
  persisted after refresh.

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
- [x] Capture current screenshots after the UI is frozen.
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

Production hosting evidence recorded August 30, 2026:

- Cloudflare Pages promoted and validated commit `86988b3` at
  `https://algorand-document-vault.pages.dev/` from `main`.
- The production origin loaded all core routes and opened Pera Connect without
  a Pera or WalletConnect secure-relay CSP violation.
- A disposable document completed Pera approval, TestNet submission, and
  confirmation in round `66826566`; the resulting Confirmed evidence record
  matched the unchanged document locally.
- A password-encrypted one-record backup restored into a fresh Incognito Vault
  with zero conflicts. The unchanged document matched the transferred Confirmed
  record, while modified content correctly produced no local evidence match.
- A production verification link confirmed the unchanged disposable document
  in a fresh Incognito session without access to the owner's local Vault. The
  public proof anchored transaction
  `KFMQTPL3Z6V6NP6AOPGWRCWZULIGMRX3JCEETZQ5PYJ5BPTTSNXQ` in TestNet round
  `66833022`.
- The shared-link workflow rejected both a mismatched document/link pair and
  modified content. Switching to the empty Incognito Vault and back retained
  the loaded verification link and successful public result without another
  load action.

Final tag-gate evidence recorded August 30, 2026:

- 40 test files and 162 tests passed; lint and production build passed.
- The alpha/TestNet boundary passed across 150 production source files, and 289
  tracked candidate files passed the credential and blocked-name scan.
- 25 Chromium, Edge, and WebKit core checks passed with two expected skips.
- The production dependency audit reported zero vulnerabilities.
- The exact 23-file release package was regenerated with a SHA-256 manifest and
  passed both packaged-artifact browser checks.

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

- [x] All blocking items above are complete or explicitly deferred with rationale.
- [x] Independent security review status is documented.
- [x] MainNet remains disabled and out of scope for this alpha.
- [x] Product owner approves the release candidate.

Product-owner approval recorded August 30, 2026:

- The product owner explicitly stated, "I accept the RC1 deferrals and
  unaudited pre-release status."
- The accepted deferrals are physical Android validation, exact Safari
  200%/400% page-zoom coverage, and the supported-mobile visual-mode retest
  until a controlled HTTPS deployment is available.
- The not-started independent security review is accepted only as an accurately
  disclosed pre-release limitation. The application remains unaudited.
- This approval does not authorize production deployment, a release tag,
  MainNet operation, or an independent-audit claim.
- After the final production shared-verification smoke passed on August 30,
  2026, the product owner separately authorized the final release gates and the
  creation and push of `v0.1.0-alpha` if those gates passed.

Release-identity evidence recorded August 28, 2026:

- `package.json`, `package-lock.json`, and the application runtime identify the
  candidate as `0.1.0-alpha`.
- `npm run verify:release-readiness` fails closed if those versions drift, if
  the default Algorand network or endpoint stops targeting TestNet, if the
  transaction policy stops requiring the TestNet genesis, or if a MainNet API
  endpoint is introduced into production source.
- Candidate status, evidence, open gates, and operator procedures are tracked
  in `docs/release/RC1_VALIDATION.md`.

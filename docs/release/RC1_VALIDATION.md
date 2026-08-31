# Public Alpha RC1 Validation

- **Candidate version:** `0.1.0-alpha`
- **Candidate base:** `3da7716`
- **Validation branch:** `codex/phase-10-release-candidate-validation`
- **Production commit:** `86988b3`
- **Production origin:** `https://algorand-document-vault.pages.dev/`
- **Opened:** August 28, 2026
- **Release status:** Deployed public alpha with accepted deferrals; unaudited pre-release

This document is the evidence ledger and operator runbook for the first public
alpha release candidate. The authoritative gate list remains
`docs/templates/RELEASE_CHECKLIST.md`. A release is not approved merely because
the automated suite passes.

## Status summary

| Area | Status | Evidence or remaining work |
| --- | --- | --- |
| Release identity and TestNet boundary | Passed | Version and network fail-closed checks are automated. |
| Unit, lint, build, and release packaging | Passed | Local gates and both pull-request CI jobs passed. |
| Installed stable Chrome on Windows | Passed | Chrome `151.0.7922.174`; seven production-preview tests passed. |
| Accessibility automation and manual validation | Passed with accepted deferrals | Narrator, keyboard-only workflows, Windows visual modes, physical Chrome/Edge/Firefox zoom, and the physical iOS navigation fix passed. Exact Safari 200%/400% coverage and physical Android are deferred with product-owner acceptance. |
| Algorand TestNet and Pera Wallet | Passed | Live confirmation, wallet cancellation, approval timeout, retry, and persistence paths passed. |
| Installed stable Firefox on Windows | Passed | Firefox `154.0.1`; all routes, persistence, exports, wrong-password rejection, and isolated plain/encrypted restores passed. |
| Current Safari on physical iPhone | Passed | iPhone 17 Pro Max, iOS 26.6; routes, storage, file selection, exports, isolated plain/encrypted restores, and secure Pera handoff passed. |
| Physical Android | Deferred and accepted | No representative Android device is available; responsive emulation remains supporting evidence and is not presented as a physical-device result. |
| Physical iOS | Passed | iPhone 17 Pro Max on iOS 26.6 passed portrait layout, storage, file selection, backup export, and Pera handoff checks. |
| Screenshots | Passed | Frozen Dashboard, Verify, Wallet, and confirmed Notarization receipt screenshots were captured on August 30, 2026 without private documents, secrets, or a complete wallet address. |
| Independent security review | Not started; accepted pre-release limitation | No independent reviewer or report is recorded. The application must remain labeled unaudited and pre-release. |
| Product-owner approval | Approved | On August 30, 2026, the product owner explicitly accepted the RC1 deferrals and unaudited pre-release status. |
| Production hosting and HTTPS smoke | Passed | Cloudflare Pages production at commit `86988b3` passed route loading, Pera pairing, TestNet notarization, local and shared-link verification, encrypted cross-browser recovery, modified-document rejection, and verification-source state persistence. |
| Post-validation workflow polish | Passed | Notarize, Verify, and Vault use task-first layouts and progressive disclosure. Automated regression plus focused keyboard and 200%/400% zoom rechecks passed on the frozen routes. |

## Verified candidate evidence

The following evidence is already repeatable or recorded:

- Pull request 14 merged to `main` as `3da7716` after the Quality and security
  and Browser matrix and release artifact jobs passed.
- `npm run verify:release-readiness` enforces the alpha version, TestNet
  endpoints, TestNet genesis, and absence of production MainNet API endpoints.
- `npm test`, `npm run lint`, `npm run build`, the complete browser-engine
  matrix, exact artifact smoke test, production advisory audit, tracked-content
  scan, and `git diff --check` have passed during candidate preparation.
- The frozen candidate was revalidated on August 30, 2026: 33 test files and
  141 tests passed; lint and production build passed; the alpha/TestNet boundary
  passed across 140 production files; 22 Chromium, Edge, and WebKit browser
  checks passed with two expected skips; 271 tracked candidate files passed the
  content scan; the production dependency audit reported zero vulnerabilities;
  and the packaged artifact passed its direct-load/security-header smoke test.
- The final tag gate run on August 30, 2026 passed 40 test files and 162 tests,
  lint, production build, the alpha/TestNet boundary across 150 production
  source files, 25 Chromium/Edge/WebKit core checks with two expected skips,
  the scan of 289 tracked candidate files, and the production dependency audit
  with zero vulnerabilities. The exact 23-file release package was regenerated
  with a SHA-256 manifest and passed both packaged-artifact browser checks.
- Installed Google Chrome `151.0.7922.174` on Windows passed
  `npm run test:browser:stable-chrome` on August 28, 2026. The seven checks
  covered clean loading, route chunk deferral, console errors, plain and
  encrypted backup recovery, wrong-password retry, reload persistence,
  10,000-document Vault paging and search, dark mode, forced colors, reduced
  motion, and 320-CSS-pixel reflow.
- Installed Mozilla Firefox `154.0.1` on Windows passed hands-on validation on
  August 28, 2026. Dashboard, Notarize, Verify, Vault, and Wallet loaded; a
  disposable draft survived reload and a complete browser restart; plain and
  encrypted backups downloaded and restored into separate empty Private
  Browsing sessions; and the encrypted restore rejected an incorrect password
  before accepting the test password.
- Installed Chrome and Edge on Windows passed hands-on backup recovery on
  August 28, 2026. Each browser exported a disposable one-record plain backup
  and encrypted backup, restored each format into separate empty Incognito or
  InPrivate sessions, rejected an incorrect encrypted-backup password, and
  restored the Draft with the correct password.
- Current Safari on an iPhone 17 Pro Max running iOS 26.6 passed hands-on HTTPS
  validation on August 28, 2026. All five routes fit in portrait orientation;
  a disposable photo produced a Draft record that survived refresh; plain and
  encrypted backups downloaded to Files and restored into isolated empty Private
  Browsing sessions; the encrypted restore rejected an incorrect password before
  accepting the test password; and the Pera same-device handoff returned to a
  connected TestNet session that survived refresh. The initial
  pass found pointer navigation scrolling the compact navigation out of view.
  The focus handoff now uses `preventScroll` for pointer activation, a regression
  test covers the behavior, and the physical Safari retest passed.
- Live TestNet transaction
  `D5QWYDQFAZRL3F7H2I6ELJATMZNI7XYVX3GWR4U6NIGABEEZO3LA` confirmed in round
  `66759442`, and its evidence record persisted after reload and restart.
- The approved public-alpha changes were promoted to Cloudflare Pages production
  at `https://algorand-document-vault.pages.dev/` on August 30, 2026. Production
  commit `86988b3` retains the Pera primary secure-WebSocket relay and the
  WalletConnect numbered fallback relays introduced in `1344203` through the
  deployed Content Security Policy. The packaged-artifact regression opens the
  Pera relay and fails on a relay CSP violation. The production browser check
  opened Pera Connect with no Pera or WalletConnect relay-policy block.
- The production origin completed an end-to-end notarization of the disposable
  `deployment-smoke.txt` fixture. TestNet transaction
  `YPM7SPY7376DMS5F7NJI3BD4MMTWXAUT6ZNND2APLCHMD275BCQA` confirmed in round
  `66826566`; evidence record `d7c25398-b64a-480a-b385-ccfb7f147ef2` was saved
  as Confirmed with SHA-256 fingerprint
  `0a69773de57196532ae089e3f221bdc5261930a71ee90d8f63c5df4691f04134`.
- The confirmed production record was exported as a password-encrypted backup,
  validated in a fresh Chrome Incognito session as one total and one new record
  with zero existing records, duplicate fingerprints, or conflicting IDs, and
  imported successfully. Selecting the unchanged fixture in that isolated
  session found the transferred Confirmed record and Algorand transaction.
  Selecting modified content with SHA-256 fingerprint
  `906197a24cee634210b36504cada18c4566f8fbcefb9e09d4485a5f842b50280`
  correctly returned no local evidence match while preserving the confirmed
  record.
- Production commit `86988b3` completed the public shared-verification workflow
  in a fresh Incognito session without access to the owner's local Vault. The
  disposable `dev server test 1.txt` document with SHA-256 fingerprint
  `401a3b72458c17621120290fdbc840a4f43e9537406cad2170cc67dc8d3441d2`
  verified against TestNet transaction
  `KFMQTPL3Z6V6NP6AOPGWRCWZULIGMRX3JCEETZQ5PYJ5BPTTSNXQ`, confirmed in round
  `66833022`. A mismatched document/link pair and modified content with SHA-256
  fingerprint
  `5cf660bcde0171dbc8fe6e1c2d86ac84d137a3fdf15478e119f11a7b788a4c4a`
  were both rejected. Switching from shared verification to the empty Incognito
  Vault and back preserved the loaded link and successful public result without
  requiring a second load.
- A second hands-on Pera workflow on August 30, 2026 verified the approval
  recovery boundary. An unapproved request ended automatically after 90 seconds
  without submission, manual `Cancel Waiting` returned immediately to a safe
  retry state without submission, and the next approval completed TestNet
  submission and confirmation in round `66819761`. The disposable `test 6.txt`
  record then appeared as Confirmed in the Vault and persisted after refresh.
- Frozen-interface screenshots captured on August 30, 2026:
  [Dashboard](../images/rc1/dashboard.png),
  [Verify](../images/rc1/verify.png),
  [Wallet](../images/rc1/wallet.png), and
  [Notarization receipt](../images/rc1/notarization-receipt.png). The Wallet
  image contains only the application's shortened public-address display.
- The post-validation workflow-polish pass keeps core actions visible while
  collapsing optional transaction and backup details. Unit, accessibility,
  build, lint, Chromium, Edge, and WebKit regression checks passed locally.
  Playwright Firefox could not start in the current Windows Codex host
  (`spawn UNKNOWN` before page load), so the pull-request Firefox job remains
  required evidence for this commit. A focused
  hands-on 200%/400% zoom and reflow recheck of the frozen Notarize, Verify, and
  Vault routes passed on August 30, 2026 without horizontal scrolling,
  overlapping or clipped text, hidden controls, or unusable expanded content.
- A focused keyboard recheck on August 30, 2026 passed Notarize and Verify file
  selection, reverse navigation, and file-dialog cancellation. Vault focus moved
  logically through backup/restore, search, filtering, document, detail, and
  tool controls without a trap. The pass found the first Vault Tools focus
  outline clipped by its rounded container; the outline now renders inside the
  container, a browser regression covers the boundary, and the physical retest
  confirmed visible focus.
- A focused physical Windows dark-mode recheck on August 30, 2026 passed the
  frozen Notarize, Verify, and Vault routes, including the open backup/restore
  tools. Text, borders, selected navigation and tabs, status treatments, inputs,
  disabled actions, and disclosures remained readable without visible overflow.
- A focused physical Windows reduced-motion recheck on August 30, 2026 passed
  navigation across Notarize, Verify, Vault, and Wallet plus Vault Tools and
  detail disclosure changes. All state changes remained understandable with
  animation effects disabled, and the operating-system setting was restored.
- A focused physical Windows High Contrast recheck on August 30, 2026 passed
  the frozen Notarize, Verify, Vault Tools, and Wallet views. Borders, active
  navigation, selected states, status indicators, disabled controls, actions,
  and the corrected Vault Tools keyboard focus remained distinguishable without
  relying on color. The contrast theme was restored to None.

The final release diff must repeat every automated gate. The statements above
do not pre-approve a future commit or tag.

## Manual operator matrix

Record the date, browser or device version, viewport or display scale, result,
and any issue link for each row. Do not substitute an emulated engine for a
named stable browser or a responsive viewport for a physical device.

| Check | Required environment | Acceptance criteria | Status |
| --- | --- | --- | --- |
| Keyboard-only workflow pass | Stable Chrome or Edge on Windows | Every route, field, file control, dialog, validation error, and primary action is reachable and operable; focus order is logical and visible; no trap occurs. Do not disconnect the funded wallet merely to complete the pass. | Passed - Windows Chrome, August 28 and 30, 2026; all five routes passed with no trap, and the frozen Notarize, Verify, and Vault routes passed a focused recheck after correcting and physically verifying the clipped Vault Tools focus outline. The funded wallet remained connected. |
| Light and dark modes | Windows plus supported mobile OS | Text, controls, selected states, errors, and focus remain readable; no content disappears or overflows. | Passed on Windows; mobile deferred - physical Windows Chrome passed light and dark modes on August 28, 2026, and the frozen Notarize, Verify, and Vault routes passed a focused dark-mode recheck on August 30, 2026, including open Vault Tools. Physical iOS retesting is deferred until a controlled HTTPS deployment is available; an account-less quick tunnel was rejected as an unsuitable validation origin and shut down immediately. |
| High contrast | Windows Contrast Theme | Native controls, navigation state, focus, errors, and status indicators remain distinguishable without color alone. | Passed - Windows Aquatic contrast theme on August 28 and 30, 2026; `forced-colors` activated, the frozen Notarize, Verify, Vault Tools, and Wallet views retained distinguishable focus, controls, selected states, status, and borders without horizontal overflow. Restored to `None`. |
| Zoom and reflow | Stable Chrome, Edge, Firefox, and Safari at 200% and 400% | 200% preserves normal workflow access; 400% reflows to a narrow layout without two-dimensional page scrolling or hidden controls. | Partial - physical Windows Chrome, Edge, and Firefox passed at 200% and 400% on all five routes with no horizontal overflow, overlap, clipped text, or hidden controls. The frozen Notarize, Verify, and Vault routes passed a focused 200%/400% recheck on August 30, 2026, including expanded content. Exact Safari 200%/400% page zoom remains open because the available physical iPhone exposes website text sizing and screen magnification rather than the required desktop-style zoom levels. Automated WebKit 320-CSS-pixel reflow remains supporting evidence only. |
| Reduced motion | Physical OS setting | Navigation and feedback remain understandable with nonessential motion suppressed. | Passed - Windows animation effects off on August 28 and 30, 2026; `prefers-reduced-motion` activated, visible durations were capped at 0.01 milliseconds, and frozen-route navigation plus Vault disclosures remained understandable. Restored to On. |
| Stable Firefox | Current stable desktop Firefox | Dashboard, Notarize, Verify, Vault, and Wallet load without console-visible failure; persistence and backup download/restore work. | Passed - Windows Firefox `154.0.1`, August 28, 2026; all five routes loaded, a disposable draft survived reload and full restart, both backup formats downloaded and restored in isolated sessions, and wrong-password rejection passed. |
| Stable Safari | Current stable Safari on macOS or iOS | Core routes, storage, file selection, download/share behavior, and Wallet handoff work over a secure origin. | Passed - current Safari on iPhone 17 Pro Max, iOS 26.6, August 28, 2026; HTTPS routes, storage, photo selection, plain/encrypted export and isolated restore, wrong-password rejection, Pera handoff, and post-refresh persistence passed after the verified pointer-navigation fix. |
| Android layout | Representative physical Android phone | All routes fit, 44-pixel targets remain usable, file selection works, and no fixed panel blocks content. | Deferred - no representative physical Android device is available. Automated responsive coverage is supporting evidence only. |
| iOS layout | Representative physical iPhone | All routes fit, file selection and backup export work, and the Pera same-device handoff returns to a connected session. | Passed - iPhone 17 Pro Max, iOS 26.6, August 28, 2026; portrait routes fit after the pointer-navigation fix, photo selection and both exports worked, and Pera returned to a connected TestNet session. |
| Manual backup UX | Every supported stable browser | Plain and encrypted files can be saved, identified, selected, previewed, rejected with a wrong password, and restored with the correct password. | Passed - Windows Chrome, Edge, Firefox `154.0.1`, and iOS Safari 26.6 completed isolated plain/encrypted restores and wrong-password rejection. |

## Operator procedure

For each browser or device:

1. Use a clean browser profile on the approved candidate origin.
2. Record browser, operating-system, device, display scale, and viewport details.
3. Visit Dashboard, Notarize, Verify, Vault, and Wallet.
4. Complete the applicable row in the manual matrix using keyboard or physical
   accessibility settings rather than automation emulation.
5. Create a disposable evidence record from non-sensitive sample content.
6. Reload and restart the browser, then confirm the record persists.
7. Export plain and encrypted backups. Verify the wrong password is rejected,
   then restore into an isolated empty profile with the correct password.
8. Capture only non-sensitive screenshots or recordings for failures. Never
   capture wallet recovery words, private documents, or secrets.
9. Record Pass, Fail, Blocked, or Deferred with a concise rationale and issue
   link. A deferral requires product-owner acceptance before release approval.

## Independent security review

Status: **Not started.** No independent security reviewer, scope, report, or
acceptance decision is currently recorded. At minimum, the review should cover
the document-hashing boundary, backup cryptography and import validation,
IndexedDB trust assumptions, Algorand transaction policy, wallet signing and
submission integrity, dependency and artifact controls, content security
policy, and the TestNet-only release boundary.

The application must continue to describe itself as pre-release and not
independently audited until this status changes.

## Product-owner decision

On August 30, 2026, the product owner stated: "I accept the RC1 deferrals and
unaudited pre-release status." This accepts the documented physical Android,
exact Safari zoom, supported-mobile visual-mode, and independent-security-review
limitations for RC1. It does not authorize a production deployment, release
tag, MainNet operation, or a claim that the application has been independently
audited.

After the final production shared-verification smoke passed on August 30, 2026,
the product owner separately authorized updating the release evidence, running
the final gates, and creating and pushing `v0.1.0-alpha` if every gate passed.

## Promotion rule

RC1 can be proposed for product-owner approval only when:

- every blocking checklist item is checked or explicitly deferred with an
  accepted rationale;
- the final candidate commit passes all automated gates and has a clean working
  tree;
- the changelog contains the final scope and release date;
- current non-sensitive screenshots are captured after the UI is frozen;
- independent security-review status is documented accurately; and
- no deployment, release, or tag is created without a separate explicit
  approval.

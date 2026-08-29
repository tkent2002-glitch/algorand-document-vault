# Public Alpha RC1 Validation

- **Candidate version:** `0.1.0-alpha`
- **Candidate base:** `3da7716`
- **Validation branch:** `codex/phase-10-release-candidate-validation`
- **Opened:** August 28, 2026
- **Release status:** Not approved

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
| Accessibility automation and manual validation | Passed with one browser gate open and one device deferral | Narrator, keyboard-only workflows, Windows visual modes, physical Chrome/Edge/Firefox zoom, and the physical iOS navigation fix passed. Exact Safari 200%/400% coverage remains open; physical Android is deferred because no device is available. |
| Algorand TestNet and Pera Wallet | Passed with one documented deferral | Live confirmation and recovery paths passed; manual timeout induction is deferred. |
| Installed stable Firefox on Windows | Passed | Firefox `154.0.1`; all routes, persistence, exports, wrong-password rejection, and isolated plain/encrypted restores passed. |
| Current Safari on physical iPhone | Passed | iPhone 17 Pro Max, iOS 26.6; routes, storage, file selection, exports, isolated plain/encrypted restores, and secure Pera handoff passed. |
| Physical Android | Deferred | No representative Android device is available; responsive emulation remains supporting evidence and is not presented as a physical-device result. |
| Physical iOS | Passed | iPhone 17 Pro Max on iOS 26.6 passed portrait layout, storage, file selection, backup export, and Pera handoff checks. |
| Screenshots | Open | Capture after the current interface is declared frozen for RC1. |
| Independent security review | Not started | No independent reviewer or report is recorded. |
| Product-owner approval | Open | Approval must be explicit after all blockers are closed or accepted. |
| Production hosting and HTTPS smoke | Post-approval external gate | Host selection and deployment require a separate approved action. |

## Verified candidate evidence

The following evidence is already repeatable or recorded:

- Pull request 14 merged to `main` as `3da7716` after the Quality and security
  and Browser matrix and release artifact jobs passed.
- `npm run verify:release-readiness` enforces the alpha version, TestNet
  endpoints, TestNet genesis, and absence of production MainNet API endpoints.
- `npm test`, `npm run lint`, `npm run build`, the complete browser-engine
  matrix, exact artifact smoke test, production advisory audit, tracked-content
  scan, and `git diff --check` have passed during candidate preparation.
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

The final release diff must repeat every automated gate. The statements above
do not pre-approve a future commit or tag.

## Manual operator matrix

Record the date, browser or device version, viewport or display scale, result,
and any issue link for each row. Do not substitute an emulated engine for a
named stable browser or a responsive viewport for a physical device.

| Check | Required environment | Acceptance criteria | Status |
| --- | --- | --- | --- |
| Keyboard-only workflow pass | Stable Chrome or Edge on Windows | Every route, field, file control, dialog, validation error, and primary action is reachable and operable; focus order is logical and visible; no trap occurs. Do not disconnect the funded wallet merely to complete the pass. | Passed - Windows Chrome, August 28, 2026; all five routes and workflow controls passed with no trap, and the funded wallet remained connected. |
| Light and dark modes | Windows plus supported mobile OS | Text, controls, selected states, errors, and focus remain readable; no content disappears or overflows. | Partial - physical Windows Chrome passed light and dark modes on August 28, 2026; supported mobile OS checks remain open. |
| High contrast | Windows Contrast Theme | Native controls, navigation state, focus, errors, and status indicators remain distinguishable without color alone. | Passed - Windows Aquatic contrast theme, August 28, 2026; `forced-colors` activated, focus and controls remained distinguishable, and no horizontal overflow occurred. Restored to `None`. |
| Zoom and reflow | Stable Chrome, Edge, Firefox, and Safari at 200% and 400% | 200% preserves normal workflow access; 400% reflows to a narrow layout without two-dimensional page scrolling or hidden controls. | Partial - physical Windows Chrome, Edge, and Firefox passed at 200% and 400% on all five routes with no horizontal overflow, overlap, clipped text, or hidden controls. Exact Safari 200%/400% page zoom remains open because the available physical iPhone exposes website text sizing and screen magnification rather than the required desktop-style zoom levels. Automated WebKit 320-CSS-pixel reflow remains supporting evidence only. |
| Reduced motion | Physical OS setting | Navigation and feedback remain understandable with nonessential motion suppressed. | Passed - Windows animation effects off, August 28, 2026; `prefers-reduced-motion` activated and visible durations were capped at 0.01 milliseconds. Restored to On. |
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

# Merkle Batch Release Validation

This record tracks the release gates for Merkle-tree batch anchoring separately
from the tagged `v0.1.0-alpha` single-document release. Automated results are
regression evidence, not a substitute for physical-device or independent
assistive-technology review.

## Completed evidence

- A three-document batch was anchored in one live Algorand TestNet transaction
  and an individual member was verified from its shared proof.
- GitHub CI passes the Chromium, Firefox, and WebKit browser matrix.
- The batch workflow reflows without horizontal overflow at a 320 CSS-pixel
  viewport from file selection through the expandable Vault record.
- The batch mode selector exposes a named group and programmatic pressed state.
- The multi-file control is labeled, retains its native `multiple` behavior,
  and programmatically references its selection guidance.
- Batch records can be expanded using the keyboard, and recovery and sharing
  actions retain native button semantics.
- Automated performance coverage exercises 1,000-document hashing, complete
  proof construction, and a representative 25 MiB member.
- Reload recovery fails closed unless the existing Algorand transaction is
  confirmed and matches the stored batch proof.

## Remaining manual gates

- Complete VoiceOver/Safari and TalkBack/Chrome walkthroughs on physical
  supported devices.
- Confirm multi-file selection behavior on each supported mobile platform;
  mobile operating systems may expose file providers differently from desktop
  Ctrl/Shift selection.
- Repeat visual validation at 200% and 400% page zoom and with large text.
- Exercise a representative large batch on a lower-memory device and record
  responsiveness, cancellation, and recovery behavior.
- Include the final merged commit in the independent security review scope.

Do not describe the Merkle workflow as independently audited or fully validated
on physical mobile devices until those gates are recorded as complete.

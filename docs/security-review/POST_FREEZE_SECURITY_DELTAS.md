# Post-freeze security deltas

This log records security and correctness changes made after the frozen
`security-review-candidate-2026-08-30` baseline. It is implementation evidence,
not an independent audit result. A reviewer must assess the final commit that
contains these changes.

## INT-2026-09-03-01: Revalidate signed and recovered transactions

- Internal severity: Medium
- Status: remediated in the working tree; independent review pending
- Affected boundary: wallet signing, transaction submission, and recovery

### Finding

The application validated the unsigned transaction before requesting wallet
approval, but did not decode and repeat those checks on the signed bytes
returned by the wallet before broadcasting them. The transaction ID returned
after submission was compared with the prepared ID, but that comparison
occurred after broadcast. The recovery path could also mark a transaction as
confirmed from its ID and round without repeating the document-proof policy.

### Remediation

- Decode the wallet-returned signed transaction and require exactly one valid
  signed envelope.
- Revalidate its transaction ID, TestNet genesis, sender, self-payment receiver,
  zero amount, fixed fee, exact canonical proof note, and absence of close,
  rekey, group, or lease side effects.
- Repeat validation immediately before submission.
- During recovery, validate the confirmed network transaction against the
  document proof before allowing the Vault record to become confirmed.
- Use the same proof-transaction validator for shared public verification.

### Regression evidence

Automated tests cover valid signed bytes, malformed bytes, concatenated signed
transactions, unsigned envelopes, altered recipients, altered proof notes,
transaction-ID mismatches, prohibited side effects, pre-submit blocking, and
recovery mismatch handling.

Verification commands:

```text
npm test
npm run lint
npm run build
npm run verify:tracked-content
npm run verify:release-readiness
npm run test:browser:core
npm run test:artifact
```

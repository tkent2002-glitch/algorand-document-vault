# Security Finding Template

## Finding metadata

- **ID:** ADV-SEC-YYYY-NNN
- **Title:**
- **Severity:** Critical / High / Medium / Low / Informational
- **Confidence:** High / Medium / Low
- **Status:** Open / Accepted / Fixed pending retest / Retested / Closed
- **Reviewed commit:**
- **Affected version(s):**
- **Component / files:**
- **Reporter:**
- **Reported date:**

## Summary

Describe the violated security property and the result in one short paragraph.

## Threat and impact

State what an attacker can achieve, affected users/data, whether the result is a
false verification or false rejection, and how the TestNet-only boundary changes
the impact.

## Preconditions

List required access, user action, browser/device state, wallet state, network
position, or knowledge.

## Reproduction

Use synthetic data and give the smallest deterministic procedure. Include tool
and browser versions. Do not include recovery words, private keys, access
tokens, real documents, or unnecessary exploit details in a public location.

## Evidence

Attach sanitized logs, screenshots, transaction IDs, proof/backup fixtures, and
relevant code references. Identify any evidence shared only through the private
vulnerability report.

## Root cause

Explain the missing or incorrect validation, trust assumption, state transition,
cryptographic binding, policy check, or deployment control.

## Recommendation

Describe the required security outcome, not only a preferred code patch. Include
negative tests and regression coverage.

## Owner response

- **Decision:** Fix / Mitigate / Accept / Dispute
- **Rationale:**
- **Fix commit / pull request:**
- **Target release:**
- **Residual risk:**

## Retest

- **Reviewer:**
- **Date:**
- **Commit / artifact:**
- **Result:** Pass / Fail / Partial
- **Evidence:**

## Disclosure

Record the coordinated-disclosure plan and credit preference. Follow
[`SECURITY.md`](../../SECURITY.md); suspected vulnerabilities must not begin as
public GitHub issues.

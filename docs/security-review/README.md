# Independent Security Review Package

This directory is the entry point for an independent security review of
Algorand Document Vault. It prepares the review; it is not an audit report and
does not mean that an independent review has started or completed.

## Product and review status

- Product stage: public alpha, pre-release
- Network boundary: Algorand TestNet only
- Audit status: unaudited
- Feature freeze: active as of 2026-08-30
- Public application: <https://algorand-document-vault.pages.dev/>
- Source repository: <https://github.com/tkent2002-glitch/algorand-document-vault>
- Private vulnerability reporting: [SECURITY.md](../../SECURITY.md)

The reviewer must record an exact Git commit before testing. The frozen public
alpha security-review candidate is
`18def771b8452f95e4c7144c58d503975512368d`, labeled
`security-review-candidate-2026-08-30`. The deployed site may later contain
approved fixes from `main`; when reviewing the deployment, record its current
commit and separately assess the delta from this candidate.

## Review objectives

The review should determine whether an attacker can:

1. make a different document appear to match recorded evidence;
2. make an invalid, substituted, or unsafe Algorand transaction appear valid;
3. cause a user to approve a transaction outside the documented policy;
4. read, alter, import, or destroy local evidence beyond the documented browser
   and device trust assumptions;
5. bypass encrypted-backup confidentiality or integrity controls;
6. exploit a verification link, proof JSON, backup, legacy record, or network
   response as untrusted input;
7. expose original documents, wallet secrets, or other sensitive data through
   logs, exports, links, build artifacts, or third-party requests; or
8. compromise the delivered application through dependencies, CI, packaging,
   or deployment configuration.

## In scope

- Browser-side document hashing and comparison
- Evidence creation, persistence, history, and legacy migration
- Plain and AES-GCM encrypted backup export, validation, and restore
- Shareable proof JSON and URL-fragment verification links
- Algorand proof serialization, transaction construction, inspection, signing,
  submission, confirmation, and public verification
- Pera Wallet and WalletConnect trust boundaries
- TestNet configuration and prevention of unintended transaction side effects
- React rendering of untrusted labels and validation errors
- Content Security Policy and other production response headers
- Production dependencies, GitHub Actions, release packaging, and public alpha
  deployment configuration

## Explicitly out of scope

- Algorand consensus, Pera Wallet, WalletConnect, AlgoNode, browser, operating
  system, and hardware security except where the application integrates with
  them incorrectly
- MainNet readiness or use of assets with monetary value
- Legal validity, authorship, identity, consent, truthfulness, or ownership of a
  document
- Recovery of a forgotten encrypted-backup password
- Confidentiality after the user's device, browser profile, extension set, or
  wallet is compromised
- Availability guarantees for third-party TestNet or wallet services
- Penetration testing of third-party infrastructure without its owner's written
  authorization

An out-of-scope dependency weakness should still be reported when the
application can reduce its impact or is using the dependency unsafely.

## Reviewer map

- [Threat model](THREAT_MODEL.md)
- [Feature-freeze record and change policy](FEATURE_FREEZE.md)
- [Post-freeze security deltas](POST_FREEZE_SECURITY_DELTAS.md)
- [Reproducible test environment](TEST_ENVIRONMENT.md)
- [Review checklist](REVIEW_CHECKLIST.md)
- [Pre-review hardening controls](PRE_REVIEW_HARDENING.md)
- [Finding template](FINDING_TEMPLATE.md)
- [Security architecture](../architecture/SECURITY_ARCHITECTURE.md)
- [Blockchain architecture](../architecture/BLOCKCHAIN_ARCHITECTURE.md)
- [Storage architecture](../architecture/STORAGE_ARCHITECTURE.md)
- [Proof payload specification](../ProofPayloadSpecification.md)
- [Blockchain proof specification](../BlockchainProofSpecification.md)
- [Dependency and sensitive-content audit](../developer/DEPENDENCY_AND_SENSITIVE_CONTENT_AUDIT.md)

## Required deliverables

The independent reviewer should provide:

- reviewed commit, date range, environment, tools, and limitations;
- findings using [FINDING_TEMPLATE.md](FINDING_TEMPLATE.md), including evidence
  and a reproducible test where practical;
- severity and confidence for each finding;
- confirmation of which checklist areas were assessed or not assessed;
- a concise residual-risk summary; and
- a retest result for remediated High or Critical findings.

The repository owner records review acceptance separately. A clean report does
not remove the product's documented TestNet, browser-storage, third-party, or
legal-proof limitations.

# RC-1 Engineering Review

## Status

Review checkpoint created.

## Purpose

Evaluate whether Algorand Document Vault is ready to serve as the foundation for a production-quality release candidate.

## Review Areas

### RC-1.1 Architecture Review

Verify:

- UI depends on workflows, repositories, services, and types.
- Pages do not write directly to storage.
- Evidence persistence flows through EvidenceRepository.
- Storage implementation remains internal.
- Blockchain services remain isolated from UI details.

### RC-1.2 Folder Audit

Review:

- core
- repositories
- services
- pages
- components
- types
- docs

Each folder must have a clear purpose.

### RC-1.3 Service Audit

Verify every service has one responsibility.

Review for:

- unused services
- duplicate logic
- unclear naming
- services that should be internal only

### RC-1.4 Repository Audit

EvidenceRepository should be the public boundary for Evidence Records.

Direct use of EvidenceRecordStoreService outside the repository should not exist.

### RC-1.5 Security Review

Review:

- document contents stay local
- private keys never enter the app
- backup import validation
- duplicate evidence handling
- malformed backup handling
- proof boundary language
- wallet signing separation
- blockchain submission error handling

### RC-1.6 UX Review

Review workspaces:

- Dashboard
- Notarize
- Evidence Vault
- Verify
- Wallet

Every visible control should either work or clearly say it is coming soon.

### RC-1.7 Release Candidate Risks

Known areas needing review before RC-1:

- localStorage is not durable enough for production
- backup import/export is available but not encrypted
- transaction submission and confirmation need full runtime testing
- duplicate detection warns but does not yet block or guide final user choice
- explorer links require final verification
- MainNet readiness is not approved

## Decision

No new major features should be added until this review is completed.

The next step is to run audits and create an RC-1 punch list.

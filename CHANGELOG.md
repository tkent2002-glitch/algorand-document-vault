# Changelog

All notable changes to Algorand Document Vault will be documented in this file.

The project follows [Semantic Versioning](https://semver.org/) when versioned releases begin.

## [Unreleased]

### Performance

- Replace full IndexedDB subscriber reloads with typed evidence-record deltas,
  remove storage-layer presentation sorting, and cache Vault search/sort keys.
- Add a local-only capacity notice at 8,000 records while retaining the tested
  10,000-record public-alpha limit.
- Document the gated cursor-backed summary-store architecture required before
  raising that supported limit.

### Security

- Decode and revalidate wallet-returned signed transaction bytes before any
  TestNet broadcast.
- Require recovered confirmed transactions to match the document proof and
  transaction policy before marking Vault evidence confirmed.
- Reuse the proof-transaction validator across signing, submission recovery,
  and shared public verification.

### Documentation

- Record Merkle-tree batch anchoring as a post-review feature candidate while
  preserving the current single-document capability boundary.
- Define the Version 2 Merkle batch architecture, normative tree construction,
  deterministic vectors, privacy boundary, and security-review requirements.

### Added

- Implement deterministic, domain-separated Merkle trees with duplicate-safe
  membership proofs, bounded local batch hashing, and a versioned Algorand note.
- Add normalized IndexedDB batch storage, v1-to-v2 migration, integrity-protected
  backup and restore, individual share links, local/shared verification, and a
  three-step batch notarization UI with signed-transaction validation.

## [0.1.0-alpha] - 2026-08-30

### Added

- Professional public repository documentation
- GitHub Actions continuous integration
- Issue and pull request templates
- User, developer, architecture, and roadmap documentation
- IndexedDB durable evidence storage
- Legacy localStorage migration and recovery
- Plain and encrypted backup workflows
- Backup integrity and trust verification
- Algorand SDK and Pera Wallet integration foundations
- Automated tests across crypto, backups, repositories, storage, security, and workflows
- Transaction-policy validation before wallet signing
- Submission transaction-ID integrity validation
- Accessibility labels, landmarks, focus management, responsive navigation, and regression tests
- CI lint enforcement

### Changed

- Simplified the Notarize, Verify, and Vault routes with task-first layouts,
  a compact post-confirmation receipt, compact record cards, and progressive
  disclosure for transaction details plus focused, tabbed backup and restore
  controls.
- Combined wallet approval, TestNet submission, and confirmation into one
  user-facing notarization action while retaining transaction-policy checks,
  safe retry handling, and uncertain-status resubmission protection.
- Made the active Notarize navigation restart a completed workflow while
  preserving unfinished notarization work.
- Moved selected-document metadata below the primary notarization action and
  condensed it into a responsive information row.
- Added a bounded Pera approval wait with a same-page cancel and safe retry
  path when a mobile wallet request does not arrive.
- Kept the Vault backup-and-restore keyboard focus outline visible inside its
  rounded tools container.

### Accepted release-candidate limitations

- Physical Android validation subsequently passed on a Samsung Galaxy S25
  running Android 16; the exact Chrome version was not captured.
- Exact Safari 200%/400% page-zoom coverage and the supported-mobile visual-mode
  retest are deferred until a controlled HTTPS deployment is available.
- Independent security review has not begun; this version remains an unaudited
  pre-release public alpha.

### Post-approval work

- Raised the PBKDF2-SHA-256 work factor for new encrypted backups from 250,000
  to 600,000 iterations while retaining narrowly allowlisted legacy restore.
- Cleared mutable password and decrypted-plaintext byte buffers after use;
  immutable JavaScript strings remain governed by browser garbage collection.
- Added the formal proof-payload specification, network recovery guidance, an
  accurately labeled internal security assessment, stronger artifact-header
  assertions, and an explicit 999-document Merkle boundary test.

- Public-alpha hosting selection and deployed HTTPS validation
- Independent security review before any production-readiness claim

# Changelog

All notable changes to Algorand Document Vault will be documented in this file.

The project follows [Semantic Versioning](https://semver.org/) when versioned releases begin.

## [Unreleased]

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

### In progress

- Manual stable Firefox, Safari/iOS, and representative mobile-device checks
- Real zoom, operating-system visual-mode, and per-browser backup UX checks
- Current post-redesign screenshots
- Focused keyboard and zoom recheck of the simplified Notarize, Verify, and
  Vault routes
- Independent security review and product-owner release approval
- Public-alpha hosting selection and deployed HTTPS validation

## [0.1.0-alpha] - Planned

First public alpha release after TestNet validation and release review.

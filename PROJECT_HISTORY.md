# Project History

## Origin

Algorand Document Vault began as an effort to create a lightweight, privacy-first notarization application for individuals and small businesses. The central idea was simple: compute a SHA-256 fingerprint locally, record only the proof on Algorand, and never upload the original document.

## Foundational decisions

- Documents remain with the user.
- SHA-256 is the initial fingerprint algorithm.
- Algorand is the blockchain target for the first release.
- Core evidence types remain separated from network-specific implementation.
- Every service and folder must have a clear purpose.
- Security, testing, build verification, runtime verification, and Git checkpoints are part of normal development.

## Major milestones

### Application foundation

The project was scaffolded with React, Vite, and TypeScript. Core managers, pages, services, and document workflows were separated early to avoid concentrating business logic inside React components.

### Evidence architecture

The evidence-record model, notarization workflow, verification flow, repository boundary, Vault interface, and duplicate-fingerprint history were developed as the central product foundation.

### Backup and security

The project added backup export and import, validation, change previews, trust evaluation, SHA-256 integrity metadata, PBKDF2 key derivation, AES-GCM encryption, and encrypted recovery tests.

### Durable persistence

Evidence storage moved from direct localStorage access to an asynchronous repository backed by IndexedDB. A tested migration and rollback path preserves legacy records without requiring destructive upgrades.

### Algorand integration

The application added TestNet node configuration, proof-note creation, transaction construction, Pera Wallet connection and signing, signed transaction submission, confirmation monitoring, and explorer links.

## Current direction

The project is completing full TestNet validation, strengthening wallet and network failure handling, improving public documentation, and preparing for a first alpha release and later independent security review.
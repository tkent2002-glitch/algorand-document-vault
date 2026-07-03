# Security Architecture

**Project:** Algorand Document Vault

**Documentation Version:** 1.0.0

**Application Version:** 0.1.0 (Foundation)

**Status:** Approved

**Owner:** Tim Kent

**Lead Software Architect:** ChatGPT

**Created:** July 2026

---

# Purpose

This document defines the security model for Algorand Document Vault.

The objective is to protect user privacy, maintain document integrity, and minimize trust requirements while providing a simple user experience.

---

# Security Philosophy

Algorand Document Vault follows one fundamental principle:

> **Users own their documents.**

The application is designed so that the original document never needs to leave the user's computer.

Only a SHA-256 fingerprint is notarized on the Algorand blockchain.

---

# Security Objectives

The application shall:

- Protect document privacy.
- Preserve document integrity.
- Minimize attack surface.
- Never expose wallet private keys.
- Keep cryptographic operations local whenever possible.

---

# Threat Model

Version 1.0 considers the following threats:

- Unauthorized document access
- Modified documents
- Fake timestamps
- Wallet impersonation
- Browser storage tampering
- User error

Enterprise threats such as insider attacks and cloud compromise are outside the scope of Version 1.0.

---

# Privacy Model

Original documents:

- Remain on the user's computer.
- Are never uploaded by the application.
- Are never transmitted to the blockchain.

Only the SHA-256 fingerprint is recorded on-chain.

---

# Cryptography

Hash Algorithm

- SHA-256

Purpose

- Fingerprinting
- Integrity verification

The application does not encrypt documents in Version 1.0.

Future versions may support optional encryption.

---

# Wallet Security

Version 1.0 supports:

- Pera Wallet

Private keys:

- Never enter the application.
- Never enter browser storage.
- Never pass through application code.

Transaction approval always occurs inside Pera Wallet.

---

# Blockchain Security

The blockchain stores:

- SHA-256 fingerprint
- Transaction metadata

The blockchain never stores:

- Original documents
- Private keys
- User credentials

---

# Local Storage

Version 1.0 stores:

- Document name
- SHA-256 fingerprint
- Transaction ID
- Timestamp
- Category

Sensitive information should not be stored in browser local storage.

Future versions may migrate to IndexedDB or encrypted storage.

---

# Data Integrity

Verification compares:

- Newly generated SHA-256 fingerprint
- Previously notarized blockchain fingerprint

If identical:

Status:

Verified

Otherwise:

Modified

---

# Security Principles

- Privacy by Default
- Security by Design
- Least Privilege
- Fail Securely
- Transparent Operations

---

# User Responsibilities

Users remain responsible for:

- Protecting original documents.
- Protecting wallet credentials.
- Backing up important files.
- Verifying documents before notarization.

---

# Future Security Enhancements

Potential future improvements include:

- Encrypted local vault
- Hardware wallet support
- Multi-signature notarization
- Enterprise authentication
- Audit logging
- Secure cloud synchronization

---

# Related Documents

- PRD.md
- PROJECT_CHARTER.md
- SOFTWARE_ARCHITECTURE.md
- DECISIONS.md

---

# Revision History

| Version | Date | Author | Notes |
|----------|------|--------|-------|
| 1.0.0 | July 2026 | Tim Kent / ChatGPT | Initial security architecture |
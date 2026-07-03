# Software Architecture

**Project:** Algorand Document Vault

**Documentation Version:** 1.0.0

**Application Version:** 0.1.0 (Foundation)

**Status:** Approved

**Owner:** Tim Kent

**Lead Software Architect:** ChatGPT

**Created:** July 2026

---

# Purpose

This document defines the overall software architecture for Algorand Document Vault.

It describes how the application is organized, how data flows through the system, and how the major software components interact.

This document is the engineering blueprint for Version 1.0.

---

# Architecture Goals

The architecture has five primary goals:

1. Simplicity
2. Security
3. Maintainability
4. Extensibility
5. Performance

Every engineering decision should support one or more of these goals.

---

# Architectural Principles

## Simplicity Before Complexity

Choose the simplest design that satisfies the product requirements.

---

## Privacy by Design

Original documents remain on the user's computer.

Only SHA-256 fingerprints are submitted to the blockchain.

---

## Layered Architecture

Each software layer has a single responsibility.

User interface components should never communicate directly with blockchain services.

---

## Separation of Concerns

Business logic, user interface, blockchain communication, and local storage remain independent.

---

## Single Source of Truth

Every piece of information has one authoritative location.

Avoid duplicate state whenever possible.

---

# High-Level Architecture

```
                 User
                   │
                   ▼
         React User Interface
                   │
                   ▼
         Application Services
         ┌──────┬────────┬────────┐
         ▼      ▼        ▼
   Hash Service Wallet Service Vault Service
         │      │        │
         └──────┴────────┘
                   │
                   ▼
          Blockchain Service
                   │
                   ▼
        Algorand TestNet/MainNet
```

---

# Application Layers

## Presentation Layer

Responsible for:

- Pages
- Components
- Forms
- Buttons
- User interaction

Technology:

- React
- TypeScript

---

## Application Layer

Responsible for:

- Coordinating workflows
- Managing application state
- Calling services
- Error handling

---

## Domain Layer

Responsible for:

- Hash generation
- Verification logic
- Document metadata
- Validation rules

The Domain Layer contains the core business logic.

---

## Infrastructure Layer

Responsible for:

- Algorand SDK
- Pera Wallet
- Browser storage
- File APIs

Infrastructure should never contain business rules.

---

# Primary Services

## Hash Service

Responsibilities:

- Generate SHA-256 hashes
- Validate files
- Return fingerprints

---

## Wallet Service

Responsibilities:

- Connect wallet
- Disconnect wallet
- Monitor wallet status

---

## Blockchain Service

Responsibilities:

- Submit transactions
- Receive confirmations
- Retrieve transaction information

All blockchain communication passes through this service.

---

## Vault Service

Responsibilities:

Store:

- Document name
- SHA-256 hash
- Transaction ID
- Timestamp
- Category

---

# Data Flow

## Notarization

1. User selects document
2. SHA-256 fingerprint generated
3. Wallet connection verified
4. Blockchain transaction submitted
5. Confirmation received
6. Local vault updated

---

## Verification

1. User selects document
2. SHA-256 regenerated
3. Vault record located
4. Blockchain record retrieved
5. Hashes compared
6. Verification displayed

---

# Technology Stack

Frontend

- React
- TypeScript
- Vite

Blockchain

- Algorand SDK
- Pera Wallet

Hashing

- SHA-256 Web Crypto API

Storage

- Browser Local Storage (Version 1.0)

---

# Scalability

Future releases should support:

- Cloud synchronization
- Team collaboration
- Mobile applications
- Enterprise deployment
- Additional blockchain providers

These features should require minimal changes to the existing architecture.

---

# Related Documents

- PRD.md
- PROJECT_CHARTER.md
- ROADMAP.md
- SECURITY.md
- DECISIONS.md

---

# Revision History

| Version | Date | Author | Notes |
|----------|------|--------|-------|
| 1.0.0 | July 2026 | Tim Kent / ChatGPT | Initial architecture |
# Engineering Decisions

**Project:** Algorand Document Vault

**Documentation Version:** 1.0.0

**Application Version:** 0.1.0 (Foundation)

**Status:** Active

**Owner:** Tim Kent

**Lead Software Architect:** ChatGPT

---

# Purpose

This document provides a concise record of significant engineering and product decisions.

Detailed reasoning is recorded in the Architecture Decision Records (ADR).

---

# Decision Log

| ID | Date | Decision | Reason |
|----|------|----------|--------|
| DEC-001 | July 2026 | React + TypeScript | Strong ecosystem, maintainability, excellent tooling. |
| DEC-002 | July 2026 | Vite | Fast development server and modern build tooling. |
| DEC-003 | July 2026 | Algorand Blockchain | Fast finality, low fees, reliable infrastructure. |
| DEC-004 | July 2026 | Pera Wallet | Officially supported wallet with excellent developer experience. |
| DEC-005 | July 2026 | Store only SHA-256 hashes on-chain | Privacy by design. |
| DEC-006 | July 2026 | Documents remain local | Users retain ownership and control of their files. |
| DEC-007 | July 2026 | Layered architecture | Improves maintainability and future expansion. |
| DEC-008 | July 2026 | Service-oriented design | Separates business logic from infrastructure. |
| DEC-009 | July 2026 | Target individuals and small businesses first | Keeps Version 1.0 focused and achievable. |
| DEC-010 | July 2026 | Documentation before implementation | Reduces technical debt and improves engineering quality. |

---

# Related Documents

- PRD.md
- SOFTWARE_ARCHITECTURE.md
- SECURITY.md
- adr/

---

# Revision History

| Version | Date | Author | Notes |
|----------|------|--------|-------|
| 1.0.0 | July 2026 | Tim Kent / ChatGPT | Initial decision log |
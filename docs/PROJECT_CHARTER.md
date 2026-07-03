# Project Charter

**Project:** Algorand Document Vault

**Documentation Version:** 1.0.0

**Application Version:** 0.1.0 (Foundation)

**Status:** Approved

**Owner:** Tim Kent

**Lead Software Architect:** ChatGPT

**Created:** July 2026

---

# Purpose

This Project Charter defines the mission, vision, guiding principles, and success criteria for Algorand Document Vault.

While the Product Requirements Document defines **what** we are building, this document explains **why** we are building it and establishes the principles that guide every product and engineering decision.

---

# Mission

Build the simplest, most trustworthy blockchain document notarization application available.

---

# Vision

Enable individuals and small businesses to prove that a document existed at a specific point in time using the Algorand blockchain without requiring blockchain expertise.

The experience should feel as familiar and effortless as saving a file to a computer.

---

# North Star

> **Making blockchain document notarization as simple as saving a file.**

Every product decision, engineering decision, and feature request should support this objective.

---

# Core Principles

## Privacy First

Users own their documents.

Documents never leave the user's computer unless they explicitly choose to share them.

---

## Security by Design

Security is designed into the application from the beginning rather than added later.

---

## Simplicity Before Complexity

Every workflow should be understandable by a first-time user.

If a feature increases complexity without providing significant value, it should be reconsidered.

---

## Optimize for Clarity Before Cleverness

Readable software is more valuable than clever software.

Simple architecture is preferred over unnecessary complexity.

Engineering decisions should always be easy to explain and maintain.

---

## Transparency

Users should always understand:

- What is stored
- Where it is stored
- Why it is stored

Nothing should happen behind the scenes without the user's knowledge.

---

## Professional Engineering

Every milestone should leave the application in a working, testable state.

Documentation, testing, and implementation receive equal attention.

---

# Target Audience

## Primary

Individuals and small businesses requiring trusted proof that a document existed at a specific point in time.

Examples include:

- Freelancers
- Contractors
- Consultants
- Homeowners
- Students
- Families
- Photographers
- Designers
- Inventors
- Small business owners

---

## Secondary

Organizations requiring document integrity verification.

Examples include:

- Law firms
- Engineering firms
- Insurance companies
- Financial professionals
- Government agencies

Enterprise functionality is outside the scope of Version 1.0.

---

# Definition of Success

Version 1.0 will be considered successful when a first-time user can:

1. Upload a document.
2. Generate a SHA-256 fingerprint.
3. Connect a Pera Wallet.
4. Notarize the document.
5. Receive blockchain confirmation.
6. Verify the document later.

Average completion time:

**Less than two minutes.**

---

# Project Philosophy

Algorand Document Vault is designed to make advanced cryptography and blockchain technology accessible without requiring technical knowledge.

The application should hide complexity while maintaining complete transparency regarding privacy and security.

Success is measured by user confidence rather than technical sophistication.

---

# Guiding Questions

Before implementing any feature, ask:

- Does this support our North Star?
- Does this improve user trust?
- Does this keep the application simple?
- Does this improve security?
- Can we clearly explain why this feature exists?

If the answer is "no," the feature should be postponed or redesigned.

---

# Related Documents

- PRD.md
- ROADMAP.md
- SOFTWARE_ARCHITECTURE.md
- SECURITY.md
- DECISIONS.md

---

# Revision History

| Version | Date | Author | Notes |
|----------|------|--------|-------|
| 1.0.0 | July 2026 | Tim Kent / ChatGPT | Initial approved release |
# Product Roadmap

**Project:** Algorand Document Vault

**Documentation Version:** 1.0.0

**Application Version:** 0.1.0 (Foundation)

**Status:** Approved

**Owner:** Tim Kent

**Lead Software Architect:** ChatGPT

**Created:** July 2026

---

# Purpose

This roadmap defines the planned evolution of Algorand Document Vault from its initial foundation through Version 1.0 and beyond.

It provides engineering direction while maintaining flexibility for future improvements.

---

# North Star

> Making blockchain document notarization as simple as saving a file.

Every milestone should move the project closer to achieving this goal.

---

# Foundation ✅

Completed

Objectives

- Development environment
- GitHub repository
- React + TypeScript
- Vite
- Project documentation
- Product vision
- Folder structure

Exit Criteria

- Development environment operational
- Documentation established
- Repository organized

---

# Blueprint

Current Milestone

Objectives

- Product documentation
- Software architecture
- Security architecture
- Engineering standards
- Decision records

Exit Criteria

- Engineering documentation complete
- Architecture approved
- Security model approved

---

# First Light

Objectives

Replace the default React application with the first version of Algorand Document Vault.

Deliverables

- Application branding
- Landing page
- Navigation
- Basic layout
- Responsive interface

Exit Criteria

The React starter application has been completely replaced.

---

# Proof

Objectives

Create the document processing engine.

Deliverables

- File upload
- Drag-and-drop support
- SHA-256 generation
- Hash display

Exit Criteria

Users can generate document fingerprints locally.

---

# Trust

Objectives

Integrate Algorand blockchain services.

Deliverables

- Pera Wallet connection
- Wallet status
- Algorand TestNet integration
- Transaction submission
- Confirmation handling

Exit Criteria

Document fingerprints can be permanently notarized.

---

# Vault

Objectives

Create the local document vault.

Deliverables

- Vault database
- Categories
- Search
- History
- Transaction records

Exit Criteria

Users can browse and manage previous notarizations.

---

# Verification

Objectives

Validate document authenticity.

Deliverables

- Document selection
- SHA-256 comparison
- Blockchain verification
- Verification report

Exit Criteria

Users can independently verify document integrity.

---

# Release Candidate

Objectives

Prepare Version 1.0.

Deliverables

- Testing
- Bug fixes
- Documentation review
- Performance improvements
- Accessibility review

Exit Criteria

Application is production ready.

---

# Version 1.0

Success Criteria

A first-time user can:

- Upload a document.
- Generate a SHA-256 fingerprint.
- Connect a wallet.
- Submit the fingerprint.
- Receive blockchain confirmation.
- Verify the document later.

Completion time:

Less than two minutes.

---

# Future Vision

Potential future releases may include:

- Mobile applications
- Public verification portal
- QR verification certificates
- Merkle-tree batch anchoring with individual document proofs
- Team workspaces
- Cloud synchronization
- AI-assisted organization
- Enterprise edition
- Multiple blockchain support

Merkle-tree batch anchoring is under consideration only. It would require a
versioned proof specification, threat model, storage and recovery design,
performance validation, and independent security review. The current alpha
supports one document fingerprint per Algorand transaction.

---

# Revision History

| Version | Date | Author | Notes |
|----------|------|--------|-------|
| 1.0.0 | July 2026 | Tim Kent / ChatGPT | Initial approved release |

# ADR-0001: Security-First Development

## Status

Accepted

## Decision

The Algorand Document Vault is a security-first application.

All milestones must preserve the following rules:

- No speculative features.
- No unnecessary folders, services, or abstractions.
- Every class must have a clear purpose.
- Every milestone must pass build verification.
- Runtime behavior must be verified before moving forward.
- Git checkpoints are required after successful milestones.

## Consequences

Development may move more slowly, but the project remains easier to review, audit, and prepare for production.

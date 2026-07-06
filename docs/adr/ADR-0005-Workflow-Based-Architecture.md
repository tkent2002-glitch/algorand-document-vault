# ADR-0005: Workflow-Based Architecture

## Status

Accepted

## Decision

Business processes are represented as workflows.

The first workflow is:

- NotarizationWorkflow

Its responsibility is to coordinate:

- Document validation
- SHA-256 hashing
- Proof creation
- Future Algorand submission

## Consequences

React pages remain thin.

Services remain focused.

Future workflows may be added only when they serve an immediate product need.

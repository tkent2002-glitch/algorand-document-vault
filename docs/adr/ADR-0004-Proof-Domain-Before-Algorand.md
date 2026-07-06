# ADR-0004: Proof Domain Before Algorand

## Status

Accepted

## Decision

The application defines its own proof domain before implementing Algorand integration.

Core proof concepts include:

- ProofPayload
- NotarizationProof
- VerificationProof

Algorand is the implementation used to anchor proofs, but Algorand does not define what a proof is.

## Consequences

Business logic remains clean and easier to review.

Algorand-specific concepts such as transaction IDs, rounds, wallets, and fees remain in the infrastructure/service layer.

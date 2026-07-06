# ADR-0003: Documents Stay Off-Chain

## Status

Accepted

## Decision

Documents and sensitive metadata remain off-chain.

The blockchain stores only proof of hash.

The blockchain must not store:

- Document contents
- File names
- Beneficiary names
- Contract parties
- Private metadata
- Personal information

## Consequences

The document holder remains responsible for storing the document.

Verification requires the holder to present the document again so the application can recalculate its hash.

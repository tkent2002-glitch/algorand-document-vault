# Product Vision

## Product

Algorand Document Vault

## Purpose

Provide a security-first document integrity system that creates cryptographic proof of a document fingerprint and anchors that proof to Algorand.

## Core Promise

The application proves document integrity.

It does not prove legal authenticity, truthfulness, enforceability, ownership, or signer authority.

## Primary User Journey

1. Select a document.
2. Generate a SHA-256 fingerprint.
3. Create a privacy-preserving proof payload.
4. Connect Pera Wallet.
5. Sign and submit an Algorand transaction.
6. Store a local evidence record.
7. Verify documents against local evidence records and blockchain proofs.

## Product Guardrails

The application must not store document contents on-chain.

The application must not store sensitive metadata on-chain.

The blockchain is the trust anchor, not the product itself.

## Deferred

Stablecoin payments, zero-knowledge proofs, team collaboration, case management, and cloud document storage are deferred.

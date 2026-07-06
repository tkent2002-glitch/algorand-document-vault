# Notarize Workspace Design Review

## Status

Approved for redesign planning.

## Purpose

The Notarize page is the primary workflow of Algorand Document Vault.

Its purpose is to help the user create cryptographic evidence for one document, review that evidence, sign the transaction with Pera Wallet, and prepare for Algorand submission.

## Primary User Goal

Notarize one document safely and clearly.

## Design Problem

The current page is functional, but the information order still reflects the application's internal state rather than the user's workflow.

The user should not need to understand services, payloads, transaction drafts, or evidence objects before selecting a document.

## Desired User Flow

1. Select Document
2. Review Document Summary
3. Review Evidence Summary
4. Review Blockchain Preparation
5. Sign and Submit
6. Track Progress

## Recommended Page Order

### 1. Page Header

Explain the purpose of the page in plain language.

### 2. Upload Step

This should be the first major action.

The user starts by selecting a document.

### 3. Document Summary

After upload, show:

- Filename
- SHA-256 hash
- Evidence record status

### 4. Evidence Review

Show a human-readable evidence summary first.

Technical JSON payload should be hidden or visually secondary.

### 5. Blockchain Preparation

Show:

- Wallet status
- Network
- Fee estimate
- Transaction status
- Note size

### 6. Sign and Submit

This is the final action area.

Signing should feel important and deliberate.

Submission remains separate from signing.

### 7. Progress Timeline

The timeline should support the workflow, not dominate it.

It should appear as a side panel or secondary progress section.

## Information Priority

### Always Visible

- Current step
- Selected document
- SHA-256 fingerprint
- Wallet status
- Network
- Signature/submission readiness

### Secondary

- Evidence record ID
- Full hash
- Transaction details
- Raw proof payload

### Hidden by Default

- Full JSON payload
- Internal object details
- Long technical identifiers

## UX Principles

- Start with the user's task, not system state.
- Keep irreversible actions visually distinct.
- Never hide the fact that blockchain submission is permanent.
- Make wallet status obvious.
- Make proof data inspectable without overwhelming the user.
- Preserve the distinction between signing and submitting.

## Duplicate Detection Policy

After hashing, the app should check the Evidence Vault for an existing SHA-256 match.

If a match exists, the app should warn the user before creating another Evidence Record.

The user may still choose to create a new proof intentionally.

## Implementation Plan

### Chapter 9.1B - Workspace Layout

Rearrange existing Notarize components into the approved workflow order.

No functional changes.

### Chapter 9.1C - Evidence Summary

Replace always-visible raw JSON with a human-readable evidence summary and optional technical details.

### Chapter 9.1D - Duplicate Detection

Add local Evidence Vault duplicate detection after hashing.

## Decision

Proceed with Chapter 9.1B using the component structure created in Chapter 9.1A.

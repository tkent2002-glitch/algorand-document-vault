# Blockchain Architecture

## Current target

Algorand TestNet is the current network target.

## Transaction model

The application prepares a zero-amount self-payment transaction:

- Sender: connected wallet address
- Receiver: the same wallet address
- Amount: 0 microAlgos
- Note: serialized document-integrity proof payload
- Fee and validity rounds: Algod suggested parameters

## Workflow

```text
Create local proof
→ build transaction
→ user signs through Pera Wallet
→ submit signed bytes to Algod
→ wait for confirmation
→ persist transaction ID and confirmed round
→ expose explorer link
```

## Service boundaries

- `AlgorandProofNoteService`: creates and size-checks note bytes
- `AlgorandTransactionBuilderService`: obtains suggested parameters and constructs a transaction
- `WalletService`: connects, restores, disconnects, and requests signatures
- `AlgorandSubmissionService`: submits signed bytes
- `AlgorandConfirmationService`: waits for confirmation
- `AlgorandExplorerService`: creates network-specific transaction links

## Hardening still required

- End-to-end TestNet validation
- Wallet cancellation classification
- Network mismatch detection
- Timeout and retry policy
- Pool-error reporting
- Verification of confirmed note payload against local evidence
- MainNet readiness review

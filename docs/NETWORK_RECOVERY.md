# Network and Wallet Recovery

Algorand Document Vault is a browser application that depends on Pera Wallet,
WalletConnect infrastructure, and an Algorand TestNet node. An outage can delay
a workflow, but it must never turn an unknown transaction into confirmed
evidence.

## User-visible states

| Situation | Application response | Safe next action |
| --- | --- | --- |
| Wallet request rejected | Reports rejection; nothing is submitted | Retry signing when ready |
| Wallet request unresponsive | Ends the approval wait after 90 seconds; nothing is submitted | Reopen Pera, then reconnect or retry |
| Network unavailable before submission | Reports that the network cannot be reached | Restore connectivity before retrying |
| Submission result uncertain | Does not automatically resubmit | Check the transaction status first |
| Confirmation timeout | Keeps the transaction in an uncertain/recoverable state | Use **Check transaction status** |
| Transaction missing, pending, or mismatched | Does not mark evidence confirmed | Wait or review; do not assume success |
| Proof-matching transaction confirmed | Records its transaction ID, round, and confirmation time | Continue to Vault or verification |

## Retry policy

The application intentionally does not use blind automatic retries for signed
transactions. A retry after an uncertain submission could create duplicate
anchors. Immediate retry is permitted only when the application knows signing
did not complete, such as explicit wallet rejection or the local approval wait
ending before a signature was received.

If submission might have occurred, recovery queries TestNet using the known
transaction ID. Confirmation is accepted only after the returned transaction
passes the same proof-note and transaction-policy validation used before
broadcast.

## Operator guidance

1. Keep the original browser tab and local Vault intact.
2. Do not repeatedly approve replacement transactions while status is unknown.
3. Restore internet access and wallet connectivity.
4. Use the in-application status check when it is offered.
5. Confirm the transaction in Pera Explorer when manual review is required.
6. Treat a node outage as **unavailable**, not as proof invalidity.

The app does not promise availability of Pera, WalletConnect, AlgoNode, the
browser, or Algorand TestNet. Original documents remain local, and no service
outage changes what a fingerprint proves.

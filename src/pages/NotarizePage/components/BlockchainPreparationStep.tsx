import type { AlgorandProofTransactionDraft } from "../../../types";

type BlockchainPreparationStepProps = {
  transactionDraft: AlgorandProofTransactionDraft | null;
};

function BlockchainPreparationStep({
  transactionDraft,
}: BlockchainPreparationStepProps) {
  if (!transactionDraft) {
    return (
      <div className="notarize-result">
        <strong>Blockchain Preparation</strong>
        <p>
          A transaction will be prepared after a document is selected
          and a Pera Wallet session is available.
        </p>
        <p>
          No document contents are sent to Algorand. Only the
          cryptographic proof payload is included in the transaction note.
        </p>
      </div>
    );
  }

  return (
    <div className="notarize-result">
      <strong>Transaction Review</strong>
      <p>Status: Ready for wallet review</p>
      <p>Network: Algorand TestNet</p>
      <p>Transaction Type: Payment transaction with proof note</p>
      <p>Amount: 0 ALGO</p>
      <p>Estimated Minimum Fee: 0.001 ALGO</p>
      <p>Sender: {transactionDraft.senderAddress}</p>
      <p>Receiver: {transactionDraft.receiverAddress}</p>
      <p>Note Size: {transactionDraft.noteByteLength} bytes</p>
      <p>
        Review these details before approving the transaction in
        Pera Wallet.
      </p>
    </div>
  );
}

export default BlockchainPreparationStep;
import type { AlgorandProofTransactionDraft } from "../../../types";

type BlockchainPreparationStepProps = {
  transactionDraft: AlgorandProofTransactionDraft | null;
};

function BlockchainPreparationStep({
  transactionDraft,
}: BlockchainPreparationStepProps) {
  if (!transactionDraft) {
    return null;
  }

  return (
    <div className="notarize-result">
      <strong>Transaction Review</strong>
      <p>Network: TestNet</p>
      <p>Transaction Type: Payment transaction with proof note</p>
      <p>Amount: 0 ALGO</p>
      <p>Estimated Minimum Fee: 0.001 ALGO</p>
      <p>Sender: {transactionDraft.senderAddress}</p>
      <p>Receiver: {transactionDraft.receiverAddress}</p>
      <p>Note Size: {transactionDraft.noteByteLength} bytes</p>
    </div>
  );
}

export default BlockchainPreparationStep;

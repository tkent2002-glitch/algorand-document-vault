export type AlgorandTransactionInspection = {
  network: string;
  transactionType: string;
  amountAlgos: string;
  estimatedFeeAlgos: string;
  senderAddress: string;
  receiverAddress: string;
  noteByteLength: number;
  payloadPreview: string;
  readiness: "not_ready" | "ready_for_signature" | "signed_not_submitted";
};

export type AlgorandUnsignedProofTransaction = {
  txId: string;
  senderAddress: string;
  receiverAddress: string;
  amountMicroAlgos: number;
  notePreview: string;
  noteByteLength: number;
};

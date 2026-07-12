export type AlgorandSignedProofTransaction = {
  txId: string;
  signedTransaction: Uint8Array;
  signedTransactionByteLength: number;
  signedAt: string;
};

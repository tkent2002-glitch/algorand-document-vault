import type { NotarizationProofStatus } from "./NotarizationProof";

export type MerkleBatchProofPayload = {
  appId: "algorand-document-vault";
  schemaVersion: "2.0";
  proofType: "merkle-batch";
  hashAlgorithm: "SHA-256";
  treeAlgorithm: "adv-merkle-sha256-v1";
  root: string;
  leafCount: number;
};

export type MerkleBatchProof = {
  payload: MerkleBatchProofPayload;
  status: NotarizationProofStatus;
  proofAnchorId?: string;
  confirmedAt?: string;
  createdAt: string;
};

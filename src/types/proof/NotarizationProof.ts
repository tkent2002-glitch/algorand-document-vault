import type { ProofPayload } from "./ProofPayload";

export type NotarizationProofStatus =
  | "draft"
  | "pending_wallet_signature"
  | "submitted"
  | "confirmed"
  | "failed";

export type NotarizationProof = {
  payload: ProofPayload;
  status: NotarizationProofStatus;
  proofAnchorId?: string;
  confirmedAt?: string;
  createdAt: string;
};

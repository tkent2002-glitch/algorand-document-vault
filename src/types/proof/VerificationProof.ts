import type { ProofPayload } from "./ProofPayload";

export type VerificationProofStatus =
  | "not_checked"
  | "proof_found"
  | "proof_not_found"
  | "hash_match"
  | "hash_mismatch"
  | "error";

export type VerificationProof = {
  status: VerificationProofStatus;
  payload?: ProofPayload;
  proofAnchorId?: string;
  checkedAt: string;
  message: string;
};

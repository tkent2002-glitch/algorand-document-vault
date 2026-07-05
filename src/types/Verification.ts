import type { DocumentHash } from "./Hash";

export type VerificationStatus = "unverified" | "valid" | "invalid" | "error";

export type VerificationResult = {
  status: VerificationStatus;
  expectedHash?: DocumentHash;
  actualHash?: DocumentHash;
  transactionId?: string;
  checkedAt: string;
  message: string;
};

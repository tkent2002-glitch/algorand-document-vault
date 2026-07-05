import type { VaultDocument } from "./Document";
import type { DocumentHash } from "./Hash";

export type NotarizationStatus = "draft" | "pending" | "confirmed" | "failed";

export type NotarizationRequest = {
  document: VaultDocument;
  hash: DocumentHash;
  createdAt: string;
};

export type NotarizationRecord = NotarizationRequest & {
  status: NotarizationStatus;
  transactionId?: string;
};

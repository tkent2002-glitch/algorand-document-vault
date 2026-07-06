import type {
  AlgorandSubmissionResult,
  NotarizationProof,
} from "../../types";

export type EvidenceRecordStatus =
  | "draft"
  | "signed"
  | "submitted"
  | "confirmed"
  | "failed";

export type EvidenceRecord = {
  id: string;
  status: EvidenceRecordStatus;
  documentName: string;
  hashAlgorithm: "SHA-256";
  hashValue: string;
  proof: NotarizationProof;
  algorandTransactionId?: string;
  submittedAt?: string;
  createdAt: string;
};

export class EvidenceRecordService {
  static createDraft(
    documentName: string,
    proof: NotarizationProof
  ): EvidenceRecord {
    return {
      id: crypto.randomUUID(),
      status: "draft",
      documentName,
      hashAlgorithm: proof.payload.hash.algorithm,
      hashValue: proof.payload.hash.value,
      proof,
      createdAt: new Date().toISOString(),
    };
  }

  static markSubmitted(
    record: EvidenceRecord,
    submission: AlgorandSubmissionResult
  ): EvidenceRecord {
    return {
      ...record,
      status: "submitted",
      algorandTransactionId: submission.transactionId,
      submittedAt: submission.submittedAt,
    };
  }
}

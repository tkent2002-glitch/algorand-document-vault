import type {
  AlgorandConfirmationResult,
  AlgorandSubmissionResult,
  MerkleBatchProof,
} from "../../types";
import type {
  BatchHashedDocument,
  MerkleBatch,
  MerkleMembershipProof,
} from "../merkle";
import type { EvidenceRecordStatus } from "./EvidenceRecordService";

export type BatchEvidenceRecord = {
  id: string;
  status: EvidenceRecordStatus;
  merkleRoot: string;
  treeAlgorithm: "adv-merkle-sha256-v1";
  leafCount: number;
  proof: MerkleBatchProof;
  algorandTransactionId?: string;
  submittedAt?: string;
  confirmedRound?: number;
  confirmedAt?: string;
  createdAt: string;
};

export type BatchEvidenceMemberRecord = {
  id: string;
  batchId: string;
  documentName: string;
  size: number;
  lastModified: number;
  hashAlgorithm: "SHA-256";
  hashValue: string;
  occurrence: number;
  leafIndex: number;
  membershipProof: MerkleMembershipProof;
  createdAt: string;
};

export type BatchEvidenceDraft = {
  batch: BatchEvidenceRecord;
  members: BatchEvidenceMemberRecord[];
};

export class BatchEvidenceRecordService {
  static createDraft(
    merkleBatch: MerkleBatch,
    hashedDocuments: BatchHashedDocument[],
    proof: MerkleBatchProof
  ): BatchEvidenceDraft {
    if (
      merkleBatch.leafCount !== hashedDocuments.length ||
      proof.payload.root !== merkleBatch.root ||
      proof.payload.leafCount !== merkleBatch.leafCount
    ) {
      throw new Error("Batch evidence inputs do not describe the same Merkle batch.");
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const hashedBySourceIndex = new Map(
      hashedDocuments.map((document) => [document.sourceIndex, document])
    );

    const members = merkleBatch.members.map((member) => {
      const document = hashedBySourceIndex.get(member.sourceIndex);

      if (!document || document.hashValue !== member.documentHash) {
        throw new Error("A hashed document is missing from the Merkle batch.");
      }

      return {
        id: crypto.randomUUID(),
        batchId: id,
        documentName: document.documentName,
        size: document.size,
        lastModified: document.lastModified,
        hashAlgorithm: "SHA-256" as const,
        hashValue: document.hashValue,
        occurrence: member.occurrence,
        leafIndex: member.leafIndex,
        membershipProof: member.proof,
        createdAt,
      };
    });

    return {
      batch: {
        id,
        status: "draft",
        merkleRoot: merkleBatch.root,
        treeAlgorithm: merkleBatch.algorithm,
        leafCount: merkleBatch.leafCount,
        proof,
        createdAt,
      },
      members,
    };
  }

  static markSubmitted(
    batch: BatchEvidenceRecord,
    submission: AlgorandSubmissionResult
  ): BatchEvidenceRecord {
    return {
      ...batch,
      status: "submitted",
      algorandTransactionId: submission.transactionId,
      submittedAt: submission.submittedAt,
    };
  }

  static markConfirmed(
    batch: BatchEvidenceRecord,
    confirmation: AlgorandConfirmationResult
  ): BatchEvidenceRecord {
    return {
      ...batch,
      status: "confirmed",
      algorandTransactionId: confirmation.transactionId,
      confirmedRound: confirmation.confirmedRound,
      confirmedAt: confirmation.confirmedAt,
    };
  }
}

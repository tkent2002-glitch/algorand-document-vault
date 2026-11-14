import { BatchEvidenceRepository } from "../repositories/evidence/BatchEvidenceRepository";
import {
  BatchEvidenceRecordService,
  BatchHashingService,
  MerkleTreeService,
  NotarizationService,
  ProofPayloadSerializer,
  type BatchEvidenceDraft,
  type BatchHashingOptions,
  type BatchHashedDocument,
  type MerkleBatch,
} from "../services";
import type { MerkleBatchProof } from "../types";

export type MerkleBatchNotarizationWorkflowResult = {
  hashedDocuments: BatchHashedDocument[];
  merkleBatch: MerkleBatch;
  proof: MerkleBatchProof;
  evidence: BatchEvidenceDraft;
  serializedProofPayload: string;
};

export class MerkleBatchNotarizationWorkflow {
  static async execute(
    files: File[],
    options: BatchHashingOptions = {}
  ): Promise<MerkleBatchNotarizationWorkflowResult> {
    const hashedDocuments = await BatchHashingService.hashFiles(files, options);
    const merkleBatch = await MerkleTreeService.build(
      hashedDocuments.map((document) => document.hashValue)
    );
    const proof = NotarizationService.createMerkleBatchProof(
      merkleBatch.root,
      merkleBatch.leafCount
    );
    const evidence = BatchEvidenceRecordService.createDraft(
      merkleBatch,
      hashedDocuments,
      proof
    );

    await BatchEvidenceRepository.saveBatchAsync(
      evidence.batch,
      evidence.members
    );

    return {
      hashedDocuments,
      merkleBatch,
      proof,
      evidence,
      serializedProofPayload: ProofPayloadSerializer.serialize(proof),
    };
  }
}

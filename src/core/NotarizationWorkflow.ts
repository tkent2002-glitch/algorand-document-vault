import { EvidenceRepository } from "../repositories";
import {
  DocumentValidationService,
  EvidenceRecordService,
  HashService,
  NotarizationService,
  ProofPayloadSerializer,
} from "../services";

import type { EvidenceRecord } from "../services";
import type { DocumentHash, NotarizationProof } from "../types";

export type NotarizationWorkflowResult = {
  fileName: string;
  hashValue: string;
  documentHash: DocumentHash | null;
  proof: NotarizationProof | null;
  evidenceRecord: EvidenceRecord | null;
  duplicateRecord: EvidenceRecord | null;
  serializedProofPayload: string;
  errors: string[];
};

export class NotarizationWorkflow {
  static async execute(file: File | null): Promise<NotarizationWorkflowResult> {
    const validation = DocumentValidationService.validate(file);

    if (!validation.valid || !file) {
      return {
        fileName: file?.name ?? "",
        hashValue: "",
        documentHash: null,
        proof: null,
        evidenceRecord: null,
        duplicateRecord: null,
        serializedProofPayload: "",
        errors: validation.errors,
      };
    }

    const hashValue = await HashService.sha256FromFile(file);

    const duplicateRecord =
      await EvidenceRepository.findByHashAsync(hashValue);

    const documentHash: DocumentHash = {
      algorithm: "SHA-256",
      value: hashValue,
    };

    const proof = NotarizationService.createProof(documentHash);
    const evidenceRecord = EvidenceRecordService.createDraft(
      file.name,
      proof
    );

    await EvidenceRepository.saveAsync(evidenceRecord);

    const serializedProofPayload =
      ProofPayloadSerializer.serialize(proof);

    return {
      fileName: file.name,
      hashValue,
      documentHash,
      proof,
      evidenceRecord,
      duplicateRecord,
      serializedProofPayload,
      errors: [],
    };
  }
}

import {
  DocumentValidationService,
  EvidenceRecordService,
  HashService,
  NotarizationService,
  ProofPayloadSerializer,
} from "../services";

import type { DocumentHash, NotarizationProof } from "../types";
import type { EvidenceRecord } from "../services";

export type NotarizationWorkflowResult = {
  fileName: string;
  hashValue: string;
  documentHash: DocumentHash | null;
  proof: NotarizationProof | null;
  evidenceRecord: EvidenceRecord | null;
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
        serializedProofPayload: "",
        errors: validation.errors,
      };
    }

    const hashValue = await HashService.sha256FromFile(file);

    const documentHash: DocumentHash = {
      algorithm: "SHA-256",
      value: hashValue,
    };

    const proof = NotarizationService.createProof(documentHash);
    const evidenceRecord = EvidenceRecordService.createDraft(file.name, proof);
    const serializedProofPayload = ProofPayloadSerializer.serialize(proof);

    return {
      fileName: file.name,
      hashValue,
      documentHash,
      proof,
      evidenceRecord,
      serializedProofPayload,
      errors: [],
    };
  }
}

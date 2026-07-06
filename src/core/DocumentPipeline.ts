import { DocumentValidationService, HashService, NotarizationService } from "../services";
import type { DocumentHash, NotarizationProof } from "../types";

export type DocumentPipelineResult = {
  fileName: string;
  hashValue: string;
  documentHash: DocumentHash | null;
  proof: NotarizationProof | null;
  errors: string[];
};

export class DocumentPipeline {
  static async prepareNotarization(file: File | null): Promise<DocumentPipelineResult> {
    const validation = DocumentValidationService.validate(file);

    if (!validation.valid || !file) {
      return {
        fileName: file?.name ?? "",
        hashValue: "",
        documentHash: null,
        proof: null,
        errors: validation.errors,
      };
    }

    const hashValue = await HashService.sha256FromFile(file);

    const documentHash: DocumentHash = {
      algorithm: "SHA-256",
      value: hashValue,
    };

    const proof = NotarizationService.createProof(documentHash);

    return {
      fileName: file.name,
      hashValue,
      documentHash,
      proof,
      errors: [],
    };
  }
}
